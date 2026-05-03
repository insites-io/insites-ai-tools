import { loadDecisions, loadRules } from "./corpus.js";
import { evaluateCondition, type EvaluationContext } from "./dsl.js";
import { renderTemplate } from "./render.js";
import type {
  Decision,
  FilePlan,
  Rule,
  SelectionInput,
  SelectionResult,
} from "./types.js";

/** Select rules whose applies_to overlaps the surface's relevant file kinds. */
export async function selectRules(input: SelectionInput): Promise<Rule[]> {
  const all = await loadRules();
  // For now, return all rules — refinement to filter by surface/intent comes after the audit settles.
  return all;
}

/** Build evaluation context from selection input. */
function buildEvalContext(input: SelectionInput): EvaluationContext {
  return {
    signals: input.signals ?? {},
    installedModules: input.installedModules ?? [],
    availableConstants: new Set(input.availableConstants ?? []),
    schemaList: new Set(),
  };
}

/** Run the DSL against all loaded decisions; return matching ones. */
export async function evaluateDecisions(input: SelectionInput): Promise<Decision[]> {
  const all = await loadDecisions();
  const ctx = buildEvalContext(input);
  return all.filter((d) => {
    if (!d.when) return false;
    return evaluateCondition(d.when, ctx);
  });
}

/** Render scaffold templates for matching decisions that include `files`. */
export async function renderScaffolds(decisions: Decision[]): Promise<FilePlan[]> {
  const plans: FilePlan[] = [];
  for (const d of decisions) {
    if (!d.then.files) continue;
    const files = [];
    for (const f of d.then.files) {
      const rendered = await renderTemplate(f.template, f.params ?? {});
      files.push({ ...f, content: rendered });
    }
    plans.push({
      files: files as never,
      rationale: d.then.rationale,
      source_decision_id: d.id,
    });
  }
  return plans;
}

/** Concatenate selected rule bodies into a single markdown blob for prompt injection. */
export function rulesToMarkdown(rules: Rule[]): string {
  return rules
    .map((r) => `## ${r.id} (severity: ${r.severity})\n\n${r.body}`)
    .join("\n\n---\n\n");
}

/** Public API: full evaluation. */
export async function evaluate(input: SelectionInput): Promise<SelectionResult> {
  const rules = await selectRules(input);
  const decisions = await evaluateDecisions(input);
  const scaffolds = await renderScaffolds(decisions);
  return {
    rulesMarkdown: rulesToMarkdown(rules),
    decisions,
    scaffolds,
    firedRuleIds: [
      ...rules.map((r) => r.id),
      ...decisions.map((d) => d.id),
    ],
  };
}
