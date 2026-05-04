import path from "node:path";
import type { ValidationResult, ValidatorFn } from "./types.js";

const VALIDATORS = new Map<string, ValidatorFn>();

/** Register a validator function under a rule id. */
export function registerValidator(ruleId: string, fn: ValidatorFn): void {
  VALIDATORS.set(ruleId, fn);
}

/** Validate a file against all registered validators that apply to its file kind. */
export async function validate(
  filePath: string,
  content: string
): Promise<ValidationResult> {
  const violations = [];
  for (const fn of VALIDATORS.values()) {
    const result = await fn(filePath, content);
    violations.push(...result);
  }
  return { violations };
}

/** Identify which file kind a path represents (page, partial, command, etc.). */
export function fileKindForPath(filePath: string): string | null {
  const p = filePath.replace(/\\/g, "/");
  if (/\/views\/pages\//.test(p)) return "page";
  if (/\/views\/partials\//.test(p)) return "partial";
  if (/\/views\/layouts\//.test(p)) return "layout";
  if (/\/lib\/commands\//.test(p)) return "command";
  if (/\/authorization_policies\//.test(p)) return "policy";
  if (/\/forms\//.test(p)) return "form";
  if (/\/graphql\//.test(p) || p.endsWith(".graphql")) return "graphql";
  if (/\/schema\//.test(p)) return "schema";
  return null;
}

// ---- Built-in validators (one per rule that has a validator: frontmatter entry) ----

/** R-3 / partials-no-underscore-prefix: filename must not start with underscore. */
registerValidator("partials-no-underscore-prefix", (filePath: string) => {
  if (fileKindForPath(filePath) !== "partial") return [];
  const base = path.basename(filePath);
  if (base.startsWith("_")) {
    return [
      {
        ruleId: "partials-no-underscore-prefix",
        severity: "error" as const,
        message: `Partial filename '${base}' starts with an underscore. Rename without the leading underscore.`,
      },
    ];
  }
  return [];
});

/** R-11 / pipe-vars-through-json-filter: scan parse_json blocks for unfiltered variable interpolation. */
registerValidator("pipe-vars-through-json-filter", (filePath: string, content: string) => {
  const violations = [];
  const blockRe = /\{%\s*parse_json[^%]*%\}([\s\S]*?)\{%\s*endparse_json\s*%\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(content)) !== null) {
    const blockStart = m.index;
    const blockBody = m[1];
    // Find {{ ... }} interpolations without | json
    const interpRe = /\{\{\s*([^}]+?)\s*\}\}/g;
    let im: RegExpExecArray | null;
    while ((im = interpRe.exec(blockBody)) !== null) {
      const expr = im[1];
      if (!/\|\s*json(\s|$)/.test(expr)) {
        const absoluteIndex = blockStart + (m[0].indexOf(im[0]));
        const line = content.substring(0, absoluteIndex).split("\n").length;
        violations.push({
          ruleId: "pipe-vars-through-json-filter",
          severity: "error" as const,
          line,
          message: `Variable '${expr.trim()}' interpolated into parse_json without '| json' filter. Add '| json' to prevent injection.`,
        });
      }
    }
  }
  return violations;
});

/** R-5 / forms-no-form-tag: forbid the deprecated {% form %} tag. */
registerValidator("forms-no-form-tag", (filePath: string, content: string) => {
  const violations = [];
  const tagRe = /\{%-?\s*form[\s\S]*?%\}/g;
  let m: RegExpExecArray | null;
  while ((m = tagRe.exec(content)) !== null) {
    // exclude tags like {% format ... %} which start with form-
    if (/^\{%-?\s*form\s*$|^\{%-?\s*form\s/.test(m[0]) === false) continue;
    const line = content.substring(0, m.index).split("\n").length;
    violations.push({
      ruleId: "forms-no-form-tag",
      severity: "error" as const,
      line,
      message: "Deprecated {% form %} tag detected. Use plain HTML <form> with {% render 'authenticity_token' %}.",
    });
  }
  return violations;
});
