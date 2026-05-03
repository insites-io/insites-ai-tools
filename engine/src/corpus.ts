import { promises as fs } from "node:fs";
import path from "node:path";
import yaml from "yaml";
import { type Decision, DecisionSchema, type Rule, RuleFrontmatterSchema } from "./types.js";

const CORPUS_ROOT = path.resolve(__dirname, "..", "..", "logic-engine");

let rulesCache: Rule[] | null = null;
let decisionsCache: Decision[] | null = null;

/** Load all rules from logic-engine/rules/*.md (each file may contain multiple rules separated by `---` frontmatter blocks). */
export async function loadRules(): Promise<Rule[]> {
  if (rulesCache) return rulesCache;
  const dir = path.join(CORPUS_ROOT, "rules");
  const files = (await fs.readdir(dir)).filter((f) => f.endsWith(".md"));
  const rules: Rule[] = [];
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const content = await fs.readFile(fullPath, "utf8");
    rules.push(...parseRulesFile(content, file));
  }
  rulesCache = rules;
  return rules;
}

/** Parse a markdown file containing one or more rule entries delimited by frontmatter blocks. */
function parseRulesFile(content: string, file: string): Rule[] {
  const rules: Rule[] = [];
  const blockRe = /```yaml\s*\n([\s\S]+?)\n```\s*\n([\s\S]*?)(?=(?:```yaml)|$)/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(content)) !== null) {
    const yamlText = m[1].replace(/^---\n/, "").replace(/\n---\s*$/, "");
    const body = m[2].trim();
    try {
      const fm = RuleFrontmatterSchema.parse(yaml.parse(yamlText));
      rules.push({ ...fm, body, file });
    } catch (err) {
      console.error(`[corpus] failed to parse rule in ${file}:`, err);
    }
  }
  return rules;
}

/** Load all decisions from logic-engine/decisions/<kind>/*.json. */
export async function loadDecisions(): Promise<Decision[]> {
  if (decisionsCache) return decisionsCache;
  const dir = path.join(CORPUS_ROOT, "decisions");
  const decisions: Decision[] = [];
  for (const kindDir of await fs.readdir(dir)) {
    const fullKindDir = path.join(dir, kindDir);
    const stat = await fs.stat(fullKindDir);
    if (!stat.isDirectory()) continue;
    const files = (await fs.readdir(fullKindDir)).filter((f) => f.endsWith(".json"));
    for (const file of files) {
      const content = await fs.readFile(path.join(fullKindDir, file), "utf8");
      try {
        decisions.push(DecisionSchema.parse(JSON.parse(content)));
      } catch (err) {
        console.error(`[corpus] failed to parse decision ${kindDir}/${file}:`, err);
      }
    }
  }
  decisionsCache = decisions;
  return decisions;
}

/** Read a template file from logic-engine/templates/. */
export async function loadTemplate(name: string): Promise<string> {
  const fullPath = path.join(CORPUS_ROOT, "templates", name);
  return await fs.readFile(fullPath, "utf8");
}

export function clearCache(): void {
  rulesCache = null;
  decisionsCache = null;
}
