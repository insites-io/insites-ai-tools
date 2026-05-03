#!/usr/bin/env node
// CLI — runs via `npx @insites/logic-engine <command>`.
// Commands: validate, audit, recommend, scaffold.

import { promises as fs } from "node:fs";
import path from "node:path";
import { evaluate } from "./runtime.js";
import { validate } from "./validators.js";

async function main() {
  const [command, ...args] = process.argv.slice(2);
  switch (command) {
    case "validate": {
      const filePath = args[0];
      if (!filePath) {
        console.error("usage: insites-logic-engine validate <file>");
        process.exit(2);
      }
      const content = await fs.readFile(filePath, "utf8");
      const result = await validate(filePath, content);
      if (result.violations.length === 0) {
        console.log("OK — no violations");
        process.exit(0);
      }
      for (const v of result.violations) {
        console.log(`${v.severity.toUpperCase()}  ${v.ruleId}  ${filePath}${v.line ? ":" + v.line : ""}  ${v.message}`);
      }
      const hasError = result.violations.some((v) => v.severity === "error");
      process.exit(hasError ? 1 : 0);
    }
    case "audit": {
      const dir = args[0] || ".";
      let totalErrors = 0;
      let totalWarnings = 0;
      async function walk(d: string): Promise<void> {
        for (const entry of await fs.readdir(d, { withFileTypes: true })) {
          const full = path.join(d, entry.name);
          if (entry.isDirectory()) {
            if (entry.name === "node_modules" || entry.name === ".git" || entry.name === "dist") continue;
            await walk(full);
          } else if (/\.(liquid|graphql)$/.test(entry.name)) {
            const content = await fs.readFile(full, "utf8");
            const r = await validate(full, content);
            for (const v of r.violations) {
              if (v.severity === "error") totalErrors++;
              if (v.severity === "warning") totalWarnings++;
              console.log(`${v.severity.toUpperCase()}  ${v.ruleId}  ${full}${v.line ? ":" + v.line : ""}  ${v.message}`);
            }
          }
        }
      }
      await walk(dir);
      console.log(`\nDone. ${totalErrors} errors, ${totalWarnings} warnings.`);
      process.exit(totalErrors > 0 ? 1 : 0);
    }
    case "recommend": {
      const intent = args.join(" ");
      if (!intent) {
        console.error("usage: insites-logic-engine recommend \"<intent>\"");
        process.exit(2);
      }
      const result = await evaluate({
        surface: "studio-chat",
        intent,
      });
      console.log(JSON.stringify({ decisions: result.decisions, scaffolds: result.scaffolds }, null, 2));
      process.exit(0);
    }
    default:
      console.error("usage: insites-logic-engine <validate|audit|recommend|scaffold> [...args]");
      process.exit(2);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
