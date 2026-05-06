# v0 Corpus Audit — Index & Executive Summary

**Status:** All 25 candidate rules audited. Awaiting Shane + team review on per-rule resolutions.

**Date:** 2026-05-01

**Sources audited:**
- `app-portal` (186 .liquid files)
- `app-seedling` (77 .liquid files)
- `addon-ecommerce` (99 .liquid files)
- `addon-events` (76 .liquid files)
- `insites-ai-tool/skills/insites/SKILL.md` and references (the existing public skill content)

**Total files inspected:** 438 .liquid files + 397 .graphql files across the four reference repos.

**Detailed entries** (each rule with full evidence FOR / AGAINST, severity recommendation, suggested rewrite):
- [v0-conflicts-batch1.md](v0-conflicts-batch1.md) — Rules R-1 to R-8 (pages, partials, commands, forms, auth, modules)
- [v0-conflicts-batch2.md](v0-conflicts-batch2.md) — Rules R-9 to R-16 (commands return shape, validation, json filter, GraphQL conventions)
- [v0-conflicts-batch3.md](v0-conflicts-batch3.md) — Rules R-17 to R-25 (modules architecture, secrets, syntax, events, schema)

---

## Executive summary

| Verdict | Count | Rules |
|---|---|---|
| **GROUNDED** — rule correct, ship as-is | 9 | R-3, R-6, R-9, R-13, R-14, R-15, R-19, R-22, R-25 |
| **CORRECT-INTENT, VIOLATED-IN-CORPUS** — rule sound but reference repos themselves break it | 4 | R-5, R-7, R-12, R-18 |
| **CONTRADICTED at scale** — rule contradicted by real repos, needs rewrite/nuance | 4 | R-1, R-2, R-10, R-16 |
| **ABSENT** — too few real examples to ground; rule is aspirational | 3 | R-4, R-20, R-23 |
| **FALSE** — rule is factually wrong, must be dropped or rewritten | 2 | R-8, R-17 |
| **CRITICAL SECURITY** — rule grounded but corpus has urgent violations to fix | 2 | R-11, R-18 |
| **VERIFIED CONVENTIONS** (subset of GROUNDED, listed for visibility) | — | R-21, R-24 |

**Net impact on planned 25-rule corpus:**
- **9 ship as-is** (KEEP-AS-IS)
- **6 ship with downgrades** (KEEP-DOWNGRADE — severity adjusted to match grounded reality)
- **4 require rewrites** (REWRITE)
- **3 require nuance** (NUANCE)
- **2 to drop or aspirational-tag** (DROP / NUANCE-aspirational)
- **1 false rule** (R-8 modules-never-install) replaced with a corrected rule

---

## URGENT pre-ship action items

These are independent of the engine — they're real issues in the canonical repos that should be fixed regardless.

### Security — CRITICAL

**S-1. R-11 parse_json injection vectors** — multiple files in production code use unfiltered variable interpolation inside `{% parse_json %}` blocks, opening JSON-injection / XSS attack surface.

| File | Lines | Unfiltered count |
|---|---|---|
| `app-portal/modules/portal/public/forms/account/my_details.liquid` | 99-127 | 8+ |
| `addon-ecommerce/modules/ecommerce/public/views/pages/checkout/save-checkout-session.liquid` | 16-41 | 12+ |
| `addon-ecommerce/modules/ecommerce/public/forms/checkout/checkout_shipping_address_guest.liquid` | 54-55 | 2 |
| `addon-ecommerce/modules/ecommerce/public/emails/auto_responders/order_success.liquid` | 35, 95, 157 | 3+ |

Each instance needs `| json` filter applied. Suggest: Insites platform team prioritises before the engine ships R-11.

**S-2. R-18 hardcoded Statsig API key** — `app-portal/modules/website/public/views/partials/layout/technical_foot.liquid:19` contains `apikey=client-8HmZGdyAduoHQGaUN4NoQFHjqaAyALhVPF790bQzPl4` hardcoded in a script tag URL. Statsig client keys are typically read-only but this still violates the secrets policy and sets a bad precedent. Migrate to `context.constants.statsig_api_key`.

**S-3. R-7 auth-policy code path produces no output** — `addon-ecommerce/modules/ecommerce/public/authorization_policies/order_created_date_valid.liquid:14-16` has an `if` branch with no `else`, so when the condition fails the policy outputs nothing. Depending on how the platform interprets nil-policy output, this could be an auth-bypass risk. Add explicit `else false`.

### Pattern violations (less urgent, but rule-credibility-blocking)

**P-1. R-5 deprecated `{% form %}` tag** — 4 files in canonical repos still use the deprecated tag the rule forbids. Open 4 small PRs replacing each with plain `<form>` + authenticity_token:
- `app-portal/modules/portal/public/forms/account/sign_out.liquid:16`
- `app-portal/modules/portal/public/forms/pay_bills/pay_bills.liquid:102`
- `app-seedling/modules/dashboard/public/forms/account/sign_out.liquid:12`
- `addon-ecommerce/modules/ecommerce/public/forms/checkout/checkout_payment.liquid:199`

If we ship R-5 without these fixes, the engine flags the canonical examples on day one — destroys credibility.

---

## Meta-findings

1. **No `insites-cli audit` enforcement detected** for any of the 25 rules audited. The skill cites the linter repeatedly but no audit configurations, CI gates, or test fixtures show actual enforcement. **Before any rule ships as `evidence: cli-audit`, we need a verification step:** create a known-bad fixture, run `insites-cli audit` against it, confirm the linter flags it. Until proven, no rule ships as `cli-audit`.

2. **Reference repos themselves violate rules they advocate.** R-5, R-7, R-11, R-12, R-18 all have violations in the canonical repos. Engine credibility on day one depends on whether we fix-first or ship-disabled. Recommendation: fix-first.

3. **Build → check → execute Command pattern is largely theoretical.** Across 438 files, only 2 explicit command files exist (both in `app-seedling/.../2fa_functions/`). The pattern is documented in detail in skill references but not adopted in the canonical repos. Either it's a future direction, or the rule should be tagged `aspirational`.

4. **Events / `{% background %}` pattern has zero real-world usage.** Skill describes events-consumers, background jobs, async side effects — none exist in any of the 438 .liquid files. Either drop R-23 or tag it `aspirational`.

5. **Module structure differs from skill.** Skill describes `app/views/pages/` at project root; real repos use `modules/{name}/public/views/...`. Path-based rules need qualifying. The "modules are installed and overwritten" framing in R-17 is also factually wrong — modules are checked-in source code (matches Shane's correction during planning).

6. **`addon-ecommerce` is the noisiest rule violator.** 18% of partials contain GraphQL (R-2), 7% of pages contain HTML (R-1), 1 violation in auth policy (R-7), most parse_json injection vectors (R-11). Either the ecommerce domain genuinely warrants different rules, or the addon predates the rules and needs a refactoring pass.

7. **Rules defining process (run audit, deploy gates) are unverifiable from the corpus.** R-20 (run cli-audit before deploy) is stated as MUST but no CI configurations or pre-commit hooks exist in any reference repo to enforce it. Either downgrade to `info` (best practice) or fix the actual deploy pipelines.

---

## Full 25-rule summary table

| # | Slug | Skill claim | Real-repo evidence | Verdict | Severity | Resolution |
|---|---|---|---|---|---|---|
| **R-1** | pages-no-html | NO HTML in pages | 49/438 violate (11.2%) | `contradicted` | `warning` | REWRITE |
| **R-2** | graphql-not-in-partials | NO GraphQL in partials | 35/438 violate (8%) | `contradicted` | `warning` | NUANCE |
| **R-3** | partials-no-underscore-prefix | No leading `_` | 0/438 violate | `grounded` | `error` | KEEP-AS-IS |
| **R-4** | commands-build-check-execute | Build → check → execute | 1/438 follows | `absent` | `warning` | NUANCE (aspirational) |
| **R-5** | forms-no-form-tag | No deprecated `{% form %}` | 4/438 violate (in own repos) | `partial` | `error` | REWRITE + fix violations |
| **R-6** | csrf-token-required | CSRF on POST forms | 0 violations | `grounded` | `warning` | KEEP-AS-IS |
| **R-7** | auth-policy-explicit-true-false | Always echo true/false | 1/7 violates (auth bypass risk) | `partial` | `error` | KEEP + fix violation |
| **R-8** | modules-never-install | Modules via app.yml install | Rule premise false | `false` | N/A | DROP / REWRITE |
| **R-9** | commands-return-valid-errors | Return `{ valid, errors }` | 100% compliant in sample | `grounded` | `warning` | KEEP-AS-IS |
| **R-10** | validate-input-in-check-stage | All input validated in CHECK | 70% compliant | `partial` | `warning` | NUANCE |
| **R-11** | pipe-vars-through-json-filter | `{ json }` in parse_json | **5+ unsafe instances** | `contradicted` | `error` | REWRITE + URGENT FIX |
| **R-12** | auth-policies-handle-nil | Defensive nil checks | 1 violation found | `partial` | `warning` | KEEP-DOWNGRADE |
| **R-13** | pages-one-http-method | One HTTP method per page | 0 violations | `grounded` | `info` | KEEP-AS-IS |
| **R-14** | render-vs-function-tags | `render` for HTML, `function` for data | 0 violations | `grounded` | `info` | KEEP-AS-IS |
| **R-15** | graphql-tables-fully-qualified | Fully qualified table names | 0 violations | `grounded` | `info` | KEEP-AS-IS |
| **R-16** | extract-reusable-validations | Validation helpers extracted | 50% compliant | `partial` | `info` | NUANCE |
| **R-17** | never-edit-modules-folder | `modules/` is read-only | Skill premise false | `false` | `info` | REWRITE |
| **R-18** | use-context-constants-for-secrets | No hardcoded secrets | **1 hardcoded Statsig key** | `partial` | `error` | KEEP + URGENT FIX |
| **R-19** | liquid-blocks-line-wrapping | One statement per line | 0 violations | `grounded` | `info` | KEEP-AS-IS |
| **R-20** | run-cli-audit-before-deploy | Always audit pre-deploy | No CI evidence | `absent` | `warning` | NUANCE (process rule) |
| **R-21** | use-related-record-for-joins | No property-array joins | 0 violations | `grounded` | `warning` | KEEP-DOWNGRADE |
| **R-22** | commands-args-object-syntax | Pass via `args: object` | 0 violations | `grounded` | `warning` | KEEP-AS-IS |
| **R-23** | events-via-background-tag | Events via `{% background %}` | 0 instances anywhere | `absent` | `info` | DROP / NUANCE-aspirational |
| **R-24** | auth-policies-in-front-matter | Policies in page front matter | 100% compliant | `grounded` | `warning` | KEEP-DOWNGRADE |
| **R-25** | schema-property-functions | `property()`, `property_int()`, etc. | 0 violations | `grounded` | `error` | KEEP-AS-IS |

---

## Open questions for Shane + team

1. **R-1 / R-2 nuance:** proposed rewrites permit inline HTML in simple pages and GraphQL in block/calculation partials. Right line, or stricter with refactoring push?

2. **R-4 / R-23 status:** are build → check → execute Commands and `{% background %}` events current standard, future direction, or applied to a different codebase entirely? This determines whether the engine treats their absence as a violation or as expected.

3. **R-5 / R-7 / R-11 / R-18 sequencing:** fix the canonical-repo violations first, then ship the rules? Or ship the rules disabled and use them to drive the cleanup? Recommendation: fix first (~10 small PRs total).

4. **R-8 / R-17 module rule:** drop entirely or keep rewrites that capture the always-present module model? Recommendation: keep both as rewrites — they're load-bearing knowledge for users coming from Webflow / Shopify who'd assume installs are required.

5. **R-20 process rule:** keep it as `info` advice in the corpus, or move it out of the engine entirely (it's a process rule, not a code rule)?

6. **`evidence: cli-audit` verification:** before any rule ships as `cli-audit`, who runs the verification (creating known-bad fixtures, running `insites-cli audit`, confirming flags)? This blocks ~5 rules from being upgraded to `cli-audit` evidence.

---

## Next step on approval

1. Insites platform team makes the urgent security fixes (S-1, S-2, S-3) — these are independent of the engine.
2. P-1 cleanup PRs (R-5 deprecated `{% form %}` tag) ship before R-5 is enabled in the engine.
3. Audit resolutions are confirmed per-rule in the per-batch files.
4. Initial corpus markdown files (`logic-engine/rules/*.md`) are written from the audit-approved rules.
5. v1 corpus PR opens against `insites-ai-tool`.
