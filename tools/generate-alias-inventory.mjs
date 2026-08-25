#!/usr/bin/env node
// Regenerates skills/insites/references/building-on-insites/reference/alias-inventory.md
// from module source, per that file's own footer ("regenerate rather than trusting a
// copied figure"). Reads the given module repos; writes nothing unless --write is passed.
//
// Usage:
//   node tools/generate-alias-inventory.mjs [--write] <module-repo-dir> [...more]
//   node tools/generate-alias-inventory.mjs --write ~/Desktop/Projects/module-v5-core ~/Desktop/Projects/module-v5-ecommerce ...

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "..", "skills", "insites", "references", "building-on-insites", "reference", "alias-inventory.md");

const args = process.argv.slice(2);
const write = args.includes("--write");
const repos = args.filter((a) => a !== "--write");
if (repos.length === 0) {
  console.error("Usage: node tools/generate-alias-inventory.mjs [--write] <module-repo-dir> [...more]");
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

// A callable alias is a partial declaring `path:` in its front matter.
function aliasOf(file) {
  const src = readFileSync(file, "utf8");
  if (!src.startsWith("---")) return null;
  const end = src.indexOf("---", 3);
  if (end === -1) return null;
  const fm = src.slice(3, end);
  const m = fm.match(/^\s*path:\s*(\S+)\s*$/m);
  return m ? m[1] : null;
}

function moduleVersion(repo) {
  for (const f of walk(repo)) {
    if (f.endsWith("hook_module_info.liquid")) {
      const m = readFileSync(f, "utf8").match(/"version":\s*"([^"]+)"/);
      if (m) return `v${m[1]}`;
    }
  }
  return "unknown";
}

const perModule = new Map(); // repoName -> { version, aliases: [] }
for (const repo of repos) {
  const name = basename(repo).replace(/^module-v5-core$/, "module-crm").replace(/^module-v5-/, "module-");
  const aliases = [];
  for (const f of walk(repo)) {
    if (!f.includes("/views/partials/")) continue;
    const alias = aliasOf(f);
    if (alias) aliases.push(alias);
  }
  aliases.sort();
  perModule.set(name, { version: moduleVersion(repo), aliases });
}

const withAliases = [...perModule.entries()].filter(([, v]) => v.aliases.length > 0).sort((a, b) => b[1].aliases.length - a[1].aliases.length);
const without = [...perModule.entries()].filter(([, v]) => v.aliases.length === 0).map(([k]) => k);
const total = withAliases.reduce((n, [, v]) => n + v.aliases.length, 0);

let md = `# Alias inventory

Every controller alias on an instance with these modules installed, generated from
module source. **Check a name here before you call it.** An alias that does not exist
fails at render time with a partial-not-found error, and inventing plausible names is
the most common way a build is wasted.

**${total} aliases** across ${withAliases.length} modules.

| Module | Aliases | Version |
|---|---|---|
${withAliases.map(([k, v]) => `| \`${k}\` | ${v.aliases.length} | ${v.version} |`).join("\n")}
`;

if (without.length) {
  md += `\nModules that declare **no** aliases, so there is nothing to call in them:\n\n${without.map((m) => `\`${m}\``).join(", ")}\n`;
}

md += `
## Naming is not uniform

Most aliases contain the word \`controller\`. Some (the events aliases) do not, so a
search for \`controller\` undercounts the inventory. Do not filter on it.
`;

for (const [k, v] of withAliases) {
  md += `\n## ${k} (${v.aliases.length})\n\n${v.aliases.map((a) => `- \`${a}\``).join("\n")}\n`;
}

md += `
---

Generated from module source by tools/generate-alias-inventory.mjs. Counts are per
scanned module version, so they move between releases: regenerate rather than trusting
a copied figure.
`;

if (write) {
  writeFileSync(OUT, md);
  console.log(`wrote ${OUT}: ${total} aliases across ${withAliases.length} modules`);
} else {
  for (const [k, v] of withAliases) console.log(`${k} ${v.version}: ${v.aliases.length}`);
  console.log(`total: ${total} — run with --write to update alias-inventory.md`);
}
