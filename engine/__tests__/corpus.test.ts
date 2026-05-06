import { describe, expect, it } from "vitest";
import { loadDecisions, loadRules, clearCache } from "../src/corpus.js";
import { evaluate } from "../src/runtime.js";

// These tests load the real corpus from the repo's logic-engine/ directory.
// They guard against the regressions identified in PR #1 review:
//   C-1 — DecisionSchema mismatch causing all module-detection decisions to fail Zod parse
//         (would surface as decisions.length being lower than the corpus file count)
//   C-2 — __dirname unavailable in compiled output (would throw at module init)

describe("corpus loader (integration)", () => {
  it("loads rules without parse errors", async () => {
    clearCache();
    const rules = await loadRules();
    expect(rules.length).toBeGreaterThan(0);
    // Each rule has a kebab-case id, severity, evidence class.
    for (const r of rules) {
      expect(r.id).toMatch(/^[a-z][a-z0-9-]*$/);
      expect(["error", "warning", "info"]).toContain(r.severity);
    }
  });

  it("loads decisions of all three kinds without parse errors", async () => {
    clearCache();
    const decisions = await loadDecisions();
    expect(decisions.length).toBeGreaterThan(0);

    const byKind = decisions.reduce<Record<string, number>>(
      (acc, d) => ({ ...acc, [d.kind]: (acc[d.kind] || 0) + 1 }),
      {}
    );

    // All three kinds should be represented. The exact counts depend on the corpus, but
    // none should be zero — that would mean an entire kind silently failed parsing.
    expect(byKind["module-detection"]).toBeGreaterThan(0);
    expect(byKind["feature-pattern"]).toBeGreaterThan(0);
    expect(byKind["scaffold"]).toBeGreaterThan(0);
  });

  it("evaluate() runs end-to-end with a known-matching intent", async () => {
    clearCache();
    const result = await evaluate({
      surface: "studio-chat",
      intent: "auth login flow",
      signals: { has_login_form: true },
    });

    // We get rules markdown back, decisions filtered by the DSL, and (potentially empty) scaffolds.
    expect(typeof result.rulesMarkdown).toBe("string");
    expect(result.rulesMarkdown.length).toBeGreaterThan(0);
    expect(Array.isArray(result.decisions)).toBe(true);
    expect(Array.isArray(result.scaffolds)).toBe(true);
    expect(Array.isArray(result.firedRuleIds)).toBe(true);
  });

  it("evaluate() does not throw on a no-match intent", async () => {
    clearCache();
    const result = await evaluate({
      surface: "studio-chat",
      intent: "nothing matches this xyzzy",
      signals: {},
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result.decisions)).toBe(true);
  });
});
