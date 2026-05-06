import { describe, expect, it } from "vitest";
import { compareSemver, evaluateCondition } from "../src/dsl.js";

describe("compareSemver", () => {
  it("returns 0 for equal versions", () => {
    expect(compareSemver("5.11.1", "5.11.1")).toBe(0);
  });
  it("returns 1 when a > b", () => {
    expect(compareSemver("5.12.0", "5.11.1")).toBe(1);
    expect(compareSemver("6.0.0", "5.99.99")).toBe(1);
  });
  it("returns -1 when a < b", () => {
    expect(compareSemver("5.10.9", "5.11.0")).toBe(-1);
  });
  it("tolerates missing patch versions", () => {
    expect(compareSemver("5.11", "5.11.0")).toBe(0);
    expect(compareSemver("5", "5.0.0")).toBe(0);
  });
});

describe("evaluateCondition", () => {
  const ctx = {
    signals: { has_cart_form: true, has_checkout_route: true, image_count: 12 },
    installedModules: [
      { id: "ecommerce", version: "5.11.1" },
      { id: "events", version: "5.0.0" },
    ],
    availableConstants: new Set(["statsig_api_key"]),
    schemaList: new Set(["product"]),
  };

  it("matches a bare signal presence", () => {
    expect(evaluateCondition({ signal: "has_cart_form" }, ctx)).toBe(true);
    expect(evaluateCondition({ signal: "missing_signal" }, ctx)).toBe(false);
  });

  it("matches signal with gte numeric comparison", () => {
    expect(evaluateCondition({ signal: "image_count", gte: 10 }, ctx)).toBe(true);
    expect(evaluateCondition({ signal: "image_count", gte: 100 }, ctx)).toBe(false);
  });

  it("evaluates all/any/not", () => {
    expect(
      evaluateCondition(
        { all: [{ signal: "has_cart_form" }, { signal: "has_checkout_route" }] },
        ctx
      )
    ).toBe(true);
    expect(
      evaluateCondition(
        { any: [{ signal: "missing" }, { signal: "has_cart_form" }] },
        ctx
      )
    ).toBe(true);
    expect(evaluateCondition({ not: { signal: "missing" } }, ctx)).toBe(true);
  });

  it("matches module_version_gte", () => {
    expect(
      evaluateCondition(
        { module_version_gte: { module: "ecommerce", version: "5.11.0" } },
        ctx
      )
    ).toBe(true);
    expect(
      evaluateCondition(
        { module_version_gte: { module: "ecommerce", version: "6.0.0" } },
        ctx
      )
    ).toBe(false);
  });

  it("matches constant_exists", () => {
    expect(evaluateCondition({ constant_exists: "statsig_api_key" }, ctx)).toBe(true);
    expect(evaluateCondition({ constant_exists: "nonexistent" }, ctx)).toBe(false);
  });
});
