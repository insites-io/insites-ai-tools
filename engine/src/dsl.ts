import type { Condition, InstalledModule } from "./types.js";

/** Inputs the DSL evaluator can read against. */
export type EvaluationContext = {
  signals: Record<string, unknown>;
  installedModules: InstalledModule[];
  availableConstants: Set<string>;
  schemaList: Set<string>;
};

/** Evaluate a Condition against the context, returning true if the condition matches. */
export function evaluateCondition(cond: Condition, ctx: EvaluationContext): boolean {
  if ("all" in cond) {
    return cond.all.every((c) => evaluateCondition(c, ctx));
  }
  if ("any" in cond) {
    return cond.any.some((c) => evaluateCondition(c, ctx));
  }
  if ("not" in cond) {
    return !evaluateCondition(cond.not, ctx);
  }
  if ("module_version_gte" in cond) {
    const mod = ctx.installedModules.find((m) => m.id === cond.module_version_gte.module);
    if (!mod) return false;
    return compareSemver(mod.version, cond.module_version_gte.version) >= 0;
  }
  if ("module_version_lt" in cond) {
    const mod = ctx.installedModules.find((m) => m.id === cond.module_version_lt.module);
    if (!mod) return false;
    return compareSemver(mod.version, cond.module_version_lt.version) < 0;
  }
  if ("module_version_in_range" in cond) {
    const mod = ctx.installedModules.find((m) => m.id === cond.module_version_in_range.module);
    if (!mod) return false;
    const v = mod.version;
    return (
      compareSemver(v, cond.module_version_in_range.min) >= 0 &&
      compareSemver(v, cond.module_version_in_range.max) <= 0
    );
  }
  if ("constant_exists" in cond) {
    return ctx.availableConstants.has(cond.constant_exists);
  }
  if ("schema_exists" in cond) {
    return ctx.schemaList.has(cond.schema_exists);
  }
  if ("signal" in cond) {
    const value = ctx.signals[cond.signal];
    if (cond.gte !== undefined) return typeof value === "number" && value >= cond.gte;
    if (cond.lte !== undefined) return typeof value === "number" && value <= cond.lte;
    if (cond.equals !== undefined) return value === cond.equals;
    if (cond.contains !== undefined) {
      if (Array.isArray(value)) return value.includes(cond.contains);
      if (typeof value === "string" && typeof cond.contains === "string") return value.includes(cond.contains);
      return false;
    }
    if (cond.matches !== undefined) {
      if (typeof value !== "string") return false;
      return cond.matches.some((p) => new RegExp(p, "i").test(value));
    }
    // Bare signal presence check
    return value !== undefined && value !== null && value !== false;
  }
  return false;
}

/** Compare two semver-ish strings. Returns -1, 0, 1. Tolerant of missing patch versions. */
export function compareSemver(a: string, b: string): number {
  const pa = a.split(".").map(Number);
  const pb = b.split(".").map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? 0;
    const y = pb[i] ?? 0;
    if (x > y) return 1;
    if (x < y) return -1;
  }
  return 0;
}
