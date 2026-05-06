import { describe, expect, it } from "vitest";
import { fileKindForPath, validate } from "../src/validators.js";

describe("fileKindForPath", () => {
  it("identifies pages", () => {
    expect(fileKindForPath("app/views/pages/index.liquid")).toBe("page");
    expect(fileKindForPath("modules/website/public/views/pages/about.liquid")).toBe("page");
  });
  it("identifies partials", () => {
    expect(fileKindForPath("app/views/partials/shared/header.liquid")).toBe("partial");
  });
  it("identifies commands", () => {
    expect(fileKindForPath("app/lib/commands/products/create.liquid")).toBe("command");
  });
  it("identifies graphql", () => {
    expect(fileKindForPath("app/graphql/products/search.graphql")).toBe("graphql");
  });
});

describe("validators", () => {
  it("flags partials with underscore prefix", async () => {
    const result = await validate("app/views/partials/_card.liquid", "");
    const matched = result.violations.filter((v) => v.ruleId === "partials-no-underscore-prefix");
    expect(matched).toHaveLength(1);
  });

  it("does not flag tags whose name only starts with 'form'", async () => {
    // Regression for the form-tag regex tightening: {% formula %} or {% format %} would have
    // been swept up by the old loose regex. The anchored \b version excludes them.
    const content = "<div>\n{% formula x: 1 %}\n{% format y %}\n</div>";
    const result = await validate("app/forms/account/sign_out.liquid", content);
    const r5 = result.violations.filter((v) => v.ruleId === "forms-no-form-tag");
    expect(r5).toHaveLength(0);
  });

  it("does not flag normal partials", async () => {
    const result = await validate("app/views/partials/card.liquid", "");
    expect(result.violations.find((v) => v.ruleId === "partials-no-underscore-prefix")).toBeUndefined();
  });

  it("flags unfiltered parse_json interpolation", async () => {
    const content = `
{% parse_json object %}
  {
    "title": "{{ form.title }}",
    "price": {{ form.price | json }}
  }
{% endparse_json %}
    `;
    const result = await validate("app/lib/commands/products/create.liquid", content);
    const r11 = result.violations.filter((v) => v.ruleId === "pipe-vars-through-json-filter");
    expect(r11.length).toBeGreaterThanOrEqual(1);
    expect(r11[0].message).toContain("form.title");
  });

  it("does not flag parse_json with json filter", async () => {
    const content = `
{% parse_json object %}
  {
    "title": {{ form.title | json }},
    "price": {{ form.price | json }}
  }
{% endparse_json %}
    `;
    const result = await validate("app/lib/commands/products/create.liquid", content);
    const r11 = result.violations.filter((v) => v.ruleId === "pipe-vars-through-json-filter");
    expect(r11).toHaveLength(0);
  });

  it("flags deprecated {% form %} tag", async () => {
    const content = "<div>\n{% form method: 'post' %}\n  ...\n{% endform %}\n</div>";
    const result = await validate("app/forms/account/sign_out.liquid", content);
    const r5 = result.violations.filter((v) => v.ruleId === "forms-no-form-tag");
    expect(r5.length).toBeGreaterThanOrEqual(1);
  });
});
