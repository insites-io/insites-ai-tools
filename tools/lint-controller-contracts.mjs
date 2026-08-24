#!/usr/bin/env node
// Lints controller contract front matter against the spec in
// skills/insites/references/building-on-insites/reference/controller-contract-spec.md,
// and checks reference integrity: every controller_name mentioned in a module's API doc
// data resolves to a partial declaring that alias (the /admin/api phantom-controller
// class of fault, TW#26617508).
//
// Usage: node tools/lint-controller-contracts.mjs <module-repo-dir> [...more]
// Exit codes: 0 clean, 1 findings.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(join(dirname(fileURLToPath(import.meta.url)), "..", "engine", "package.json"));
const YAML = require("yaml");

const repos = process.argv.slice(2);
if (repos.length === 0) {
  console.error("Usage: node tools/lint-controller-contracts.mjs <module-repo-dir> [...more]");
  process.exit(2);
}

function* walk(dir) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (name === "node_modules" || name === ".git") continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) yield* walk(full);
    else if (name.endsWith(".liquid")) yield full;
  }
}

function frontMatter(file) {
  const src = readFileSync(file, "utf8");
  if (!src.startsWith("---")) return null;
  const end = src.indexOf("\n---", 3);
  if (end === -1) return null;
  return src.slice(3, end);
}

const STABILITY = new Set(["stable", "beta", "deprecated"]);
const findings = [];
const declaredAliases = new Set();
const docReferences = []; // { file, alias }

let contracts = 0;
for (const repo of repos) {
  for (const f of walk(repo)) {
    const src = readFileSync(f, "utf8");

    // collect controller_name references from API doc data partials
    if (f.includes("/insites_api/external_api/")) {
      for (const m of src.matchAll(/"controller_name"\s*:\s*"([^"]+)"/g)) {
        docReferences.push({ file: f, alias: m[1] });
      }
    }

    if (!f.includes("/views/partials/")) continue;
    const fm = frontMatter(f);
    if (!fm || !/^\s*path:/m.test(fm)) continue;

    let doc;
    try {
      doc = YAML.parse(fm);
    } catch (e) {
      findings.push(`${f}: front matter is not valid YAML — ${e.message.split("\n")[0]}`);
      continue;
    }
    if (doc?.path) declaredAliases.add(doc.path);

    const meta = doc?.metadata;
    if (!meta || meta.kind !== "controller") continue;
    contracts++;

    if (meta.alias !== doc.path) findings.push(`${f}: metadata.alias (${meta.alias}) != path (${doc.path})`);
    const c = meta.contract;
    if (!c) {
      findings.push(`${f}: metadata.kind is controller but metadata.contract is missing`);
      continue;
    }
    if (!STABILITY.has(c.stability)) findings.push(`${f}: contract.stability "${c.stability}" not in stable|beta|deprecated`);
    if (typeof c.safe_in_function !== "boolean") findings.push(`${f}: contract.safe_in_function must be a boolean`);
    if (!c.summary) findings.push(`${f}: contract.summary missing`);
    for (const [key, entries] of [["params", c.params], ["returns", c.returns]]) {
      if (entries == null) continue;
      if (!Array.isArray(entries)) {
        findings.push(`${f}: contract.${key} must be an array`);
        continue;
      }
      entries.forEach((e, i) => {
        if (!e?.name) findings.push(`${f}: contract.${key}[${i}] has no name`);
        if (!e?.type) findings.push(`${f}: contract.${key}[${i}] (${e?.name}) has no type`);
      });
    }
    for (const [key, entries, a, b] of [["errors", c.errors, "condition", "response"], ["silent_failures", c.silent_failures, "input", "behavior"]]) {
      if (entries == null) continue;
      entries.forEach?.((e, i) => {
        if (!e?.[a] || !e?.[b]) findings.push(`${f}: contract.${key}[${i}] needs ${a} + ${b}`);
      });
    }
  }
}

// Reference integrity across everything scanned
for (const ref of docReferences) {
  if (!declaredAliases.has(ref.alias)) {
    findings.push(`${ref.file}: documents controller_name "${ref.alias}" but no scanned partial declares that alias (phantom reference — scan all installed module repos together to rule out cross-module aliases)`);
  }
}

console.log(`scanned ${repos.length} repo(s): ${declaredAliases.size} aliases, ${contracts} contracts, ${docReferences.length} doc references`);
if (findings.length) {
  console.log(`\n${findings.length} finding(s):`);
  for (const f of findings) console.log(`  - ${f}`);
  process.exit(1);
}
console.log("clean");
