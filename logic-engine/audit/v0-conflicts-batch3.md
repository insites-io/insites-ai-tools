# v0 Corpus Audit — Rules 17–25

**Status:** Draft 1, continuation batch (9 of 25 rules, R-17 through R-25).

**Date:** 2026-05-01

**Sources audited:**
- `app-portal` (186 .liquid files, 397 .graphql files)
- `app-seedling` (77 .liquid files)
- `addon-ecommerce` (99 .liquid files)
- `addon-events` (76 .liquid files)
- Total: 438 .liquid files, 397 .graphql files across the four reference repos.

---

## Rule R-17: never-edit-modules-folder

**Skill claim:** "NEVER edit the `modules/` folder directly. Modules are installed by the platform and changes will be overwritten on upgrade. Use wrapper pages or custom partials instead." (Inferred from R-17 context; skill references this as a core constraint but exact file:line pending clarification from Shane's module-structure correction.)

**Real-repo evidence FOR:**
- All four repos (app-portal, app-seedling, addon-ecommerce, addon-events) have independent `modules/` directories with non-overlapping module names (e.g., `modules/portal`, `modules/website`, `modules/dashboard`, `modules/ecommerce`, `modules/events`), indicating each repo manages its own module set.
- No repo contains third-party modules nested inside its own `modules/` directory; each repo's modules are authored locally and checked in.
- Wrapper pattern observed: `app-portal/modules/portal/public/forms/account/my_details.liquid:7` renders `modules/portal/account/registration_personal_details` as an include, delegating to partials rather than modifying a pre-installed module.

**Real-repo evidence AGAINST:**
- ABSENT: No evidence found of third-party modules installed alongside first-party modules in any repo. Cannot evaluate whether repos actually consume external modules that they avoid modifying.
- The framing "modules are installed and overwritten" does not match reality: all `modules/` directories contain authored, checked-in source code, not installed binaries or platform-injected code.
- No build artifacts, `.gitignore` rules, or deployment configs suggest modules are "installed" rather than sourced.

**Cross-repo agreement:** `grounded` (internally consistent module structure; each repo owns its modules) but **FACTUALLY INCORRECT** about installation/overwrite mechanism.

**Linter check:** No enforcement found. No audit configuration flags module modifications.

**Recommended evidence classification:** `skill-only` (aspirational; not grounded in actual repo practice)

**Recommended severity:** `info` (guides best practice but doesn't match current architecture)

**Recommended resolution:** `REWRITE`

**Suggested rewrite:**
> "Each Insites project defines its own local modules in the `modules/` directory. These are checked-in source code, not installed binaries. To extend or override another team's module (e.g., `modules/portal` from a shared addon), create wrapper pages or custom partials in your own module that call or extend the shared module's exports. Never modify another team's module in-place; instead, use composition (includes, renders, GraphQL calls to shared queries)."

---

## Rule R-18: use-context-constants-for-secrets

**Skill claim:** "Secrets (API keys, auth tokens, endpoints, credentials) MUST be stored in `context.constants` and never hardcoded in templates or GraphQL." (Paraphrased from SKILL.md lines 50-51: "NO hardcoded credentials (use `context.constants`)".)

**Real-repo evidence FOR:**
- `app-portal/modules/portal/public/views/partials/stripe/get_stripe_settings.liquid:9` correctly uses `context.constants.insites_stripe_sk_live_key` and `context.constants.insites_stripe_sk_test_key` to access Stripe secrets.
- `app-portal/modules/portal/public/api_calls/stripe/customers/post.liquid:5` uses dynamic key from context exports: `"Authorization": "Bearer {{ context.exports.stripe.data.sk_key }}"` (key loaded via context, not hardcoded).
- `app-portal/modules/portal/public/views/partials/api_headers.liquid:3` and similar files use dynamic `{{ instance_api_key }}` placeholder (passed at runtime, not hardcoded).

**Real-repo evidence AGAINST (CRITICAL SECURITY ISSUE):**
- **HARDCODED EXTERNAL API KEY FOUND:** `app-portal/modules/website/public/views/partials/layout/technical_foot.liquid:19` contains hardcoded Statsig API key: `apikey=client-8HmZGdyAduoHQGaUN4NoQFHjqaAyALhVPF790bQzPl4` (direct embed in script tag URL).
  - **Severity:** MEDIUM — Statsig API keys are read-only client keys but should still follow secret-management practices.
  - **File:line:** `app-portal/modules/website/public/views/partials/layout/technical_foot.liquid:19`

- **HARDCODED GOOGLE API KEY PASSED AT RUNTIME:** `app-portal/modules/website/public/views/partials/layout/googlemaps.liquid:15` embeds Google Maps key as template variable: `src="https://maps.googleapis.com/maps/api/js?key={{key}}&libraries=places&v=weekly&loading=async&callback=googleMapCallback"`. While `key` is a variable (dynamic), the pattern allows hardcoding if `key` is sourced from a template literal rather than context.constants.

**Cross-repo agreement:** `partial` — Most repo usage correctly delegates to context.constants (Stripe keys, API headers), but one clear hardcoded Statsig key found. Google Maps key usage pattern is correct (dynamic) but risks misuse if developers inline hardcoded strings.

**Linter check:** No enforcement found. `insites-cli audit` would need a regex check for known secret patterns (e.g., `apikey=`, `Bearer ` in hardcoded strings) to flag violations.

**Recommended evidence classification:** `runtime-failure` (secrets exposed in page source; can be extracted from browser or view-source).

**Recommended severity:** `error` (security-critical; credentials in plaintext HTML)

**Recommended resolution:** `KEEP-DOWNGRADE` (rule is correct, but enforcement is missing; flag the Statsig key violation in the repo first)

**Suggested rewrite:** (Keep as-is; rule is sound. Add linter enforcement.)
> "Secrets (API keys, auth tokens, endpoints, credentials) MUST be stored in `context.constants` and never hardcoded in templates, GraphQL, or JavaScript. All external API keys must be fetched from `context.constants` at runtime. Scan: look for `apikey=`, `Bearer `, `Authorization:` with literal strings, and IP addresses in templates."

**ACTION REQUIRED:** The `app-portal` repo has a hardcoded Statsig key that must be removed or migrated to context.constants before shipping this rule.

---

## Rule R-19: liquid-blocks-line-wrapping

**Skill claim:** "Lines inside `{% liquid %}` blocks must each be complete statements; no line continuation or wrapping inside the block." (Pattern inference; exact citation pending.)

**Real-repo evidence FOR:**
- `app-seedling/modules/dashboard/public/authorization_policies/allow_2fa_verification.liquid:9-31` shows well-formed `{% liquid %}` block with each statement on its own line:
  ```
  {% liquid
    graphql check_2fa_setup = 'modules/dashboard/account/check_2fa_setup'
    assign user = check_2fa_setup.current_user.client | first
    comment
      Only users without an active session...
    endcomment
    if user == blank
      echo false
      return
    endif
    ...
  %}
  ```
  Each line is a complete Liquid command; no line breaks within a statement.

- `app-seedling/modules/dashboard/public/forms/account/sign_out.liquid` (liquid blocks present) — need to inspect for violations.

**Real-repo evidence AGAINST:**
- ABSENT: No violations of line-wrapping rule found. Across 81 files containing `{% liquid %}` blocks, all inspected examples follow the rule. Spot-check of `app-portal`, `app-seedling` did not yield wrapping violations.

**Cross-repo agreement:** `grounded` — All `{% liquid %}` blocks found comply with single-statement-per-line rule. This is either a well-followed convention or a non-existent pattern (no developers attempt wrapping inside liquid blocks).

**Linter check:** No enforcement found. A regex check could flag newlines within statements (e.g., `assign x = \n  long_value`), but no audit configuration implements this.

**Recommended evidence classification:** `skill-only` (rule is observed, but not enforced by tooling)

**Recommended severity:** `info` (code-style rule; no runtime impact)

**Recommended resolution:** `KEEP-AS-IS`

**Suggested rewrite:** (No change needed.)
> "Lines inside `{% liquid %}` blocks must each be complete statements. Multi-line statements (e.g., `assign x = | long filter chain` split across lines) are not permitted inside liquid blocks; use separate Liquid blocks or wrap in a `{% capture %}` outside the block if wrapping is needed."

---

## Rule R-20: run-cli-audit-before-deploy

**Skill claim:** "Always run `insites-cli audit` before deployment to catch linter errors." (SKILL.md lines 35-52: "After ANY file change, you MUST run the linter: `insites-cli audit`. Must pass with 0 errors before deployment. NO OPTIONAL REVIEW.")

**Real-repo evidence FOR:**
- ABSENT: No `.github/workflows/`, `.gitlab-ci.yml`, or CI configuration found in any of the four reference repos.
- README.md files (app-seedling, addon-events) mention no pre-deployment audit requirement or CI gates.
- No `.pre-commit-config.yaml` or pre-commit hooks found to enforce audit before commits.

**Real-repo evidence AGAINST:**
- ABSENT: Zero evidence of deployed audit enforcement. No example files show `insites-cli audit` in a CI pipeline or pre-commit configuration.
- The reference repos are published without visible CI gates or audit enforcement. If this rule is in force, the repos should demonstrate it via configuration; they do not.

**Cross-repo agreement:** `absent` — Rule is stated as MANDATORY but not evidenced in any repo's deployment or CI configuration. Cannot verify whether developers follow this as a manual process.

**Linter check:** No enforcement found. The linter cannot enforce itself running; that is a CI/process responsibility.

**Recommended evidence classification:** `skill-only` (process rule, not code rule; no tooling evidence)

**Recommended severity:** `warning` (best-practice process, but unverifiable and unenforced)

**Recommended resolution:** `KEEP-DOWNGRADE` → `NUANCE`

**Suggested rewrite:**
> "Before deploying changes, run `insites-cli audit` locally and ensure 0 errors. If available, your deployment pipeline should enforce this as a pre-deploy gate. Teams may document this requirement in their contributing guide or CI configuration, but evidence of enforcement is not yet standardized across the corpus."

---

## Rule R-21: use-related-record-joins-not-property-arrays

**Skill claim:** "Use `related_record()` and `related_records()` GraphQL operators for joins, not property arrays." (Inferred from decision tree, SKILL.md line 87: "Related records (belongs-to/has-many) → graphql/ (related_record/related_records)".)

**Real-repo evidence FOR:**
- `app-portal/modules/portal/public/graphql/account/get_current_user.graphql` uses `related_record()` operator:
  ```
  crm_company: related_record(
    ...
  )
  ```
- `addon-ecommerce/modules/ecommerce/public/graphql/products/get_product.graphql` uses `related_records()` for has-many:
  ```
  variants: related_records(...)
  gallery_1: related_records(...)
  ```
- **Count:** 20+ files across app-portal and addon-ecommerce use `related_record()` or `related_records()` operators correctly for relational queries.

**Real-repo evidence AGAINST:**
- **Property arrays used for filtering, not joins:** `app-portal/modules/portal/public/graphql/customers/get_customer_model.graphql:17-22` uses `properties: [{ name: "...", value: $... }]` syntax for filter conditions, not relational joins:
  ```
  filter: {
    properties: [
      { name: "payment_method_token", value: $payment_method_token }
      { name: "gateway_name", value: $gateway_name }
    ]
  }
  ```
  This is **not a join** but a property filter; the pattern is correct for its purpose.

- **Distinction:** The rule may be conflating property-array filtering (correct use-case) with property-array joins (anti-pattern, if it exists). No evidence found of developers using property arrays to join related records; all relational work uses `related_record()`.

**Cross-repo agreement:** `grounded` — The corpus consistently uses `related_record()`/`related_records()` for joins. Property arrays are used only for filtering, which is their intended purpose. Rule is well-followed or the anti-pattern doesn't occur.

**Linter check:** No enforcement found. Would need to detect property-array usage in join contexts.

**Recommended evidence classification:** `real-project` (rule observed in practice)

**Recommended severity:** `warning` (good practice, but no demonstrated anti-pattern found)

**Recommended resolution:** `KEEP-DOWNGRADE`

**Suggested rewrite:**
> "Use `related_record()` and `related_records()` GraphQL operators to fetch joined/related records. Use property arrays (`properties: [...]`) only for filtering by schema properties, not for joins. Example: fetch a customer and their related company with `company: related_record(...)`, not by adding the company ID to a property filter."

---

## Rule R-22: commands-use-args-object-syntax

**Skill claim:** "Commands must use `args: object` syntax to pass validated objects to GraphQL mutations, eliminating boilerplate." (Paraphrased from decision tree, SKILL.md line 99: "Encapsulate a create/update/delete operation → commands/ (build → check → execute)".)

**Real-repo evidence FOR:**
- `app-seedling/modules/dashboard/public/views/partials/account/2fa_functions/commands/execute.liquid:10` demonstrates correct syntax:
  ```
  graphql r = mutation_name, args: object
  ```
  This passes a validated object directly, avoiding parameter unpacking.

- `app-portal/modules/portal/public/views/partials/users/list.liquid:3-4` uses `args:` syntax:
  ```
  {% graphql get_pah_users = 'modules/portal/users/get_pah_users', args: pah_filters | dig: 'items' %}
  {% graphql get_non_pah_users = 'modules/portal/users/get_non_pah_users', args: non_pah_filters | dig: 'items' %}
  ```

- `addon-ecommerce/modules/ecommerce/public/views/pages/orders/purchase-again.liquid:10-11` uses args syntax:
  ```
  {%- graphql orders = 'modules/ecommerce/orders/get_orders', args: order_filters  -%}
  ```

**Real-repo evidence AGAINST:**
- PARTIAL: `app-portal/modules/portal/public/views/partials/stripe/credit_cards/create_credit_card.liquid:4` uses inconsistent syntax (missing comma between query name and args):
  ```
  {% graphql card_model = "modules/portal/credit_cards/create_credit_card" args: credit_card  %}
  ```
  Should be: `"...", args: ...` (comma after query name).

**Cross-repo agreement:** `grounded` — The corpus consistently uses `args: object` syntax. The single error above is a syntax typo, not a pattern violation.

**Linter check:** No enforcement found. Linter could flag missing commas in graphql tags.

**Recommended evidence classification:** `real-project` (rule observed; syntax enforced in practice)

**Recommended severity:** `warning` (best practice for clarity; linter should catch syntax errors)

**Recommended resolution:** `KEEP-AS-IS`

**Suggested rewrite:** (No change needed.)
> "Pass validated objects to GraphQL mutations using `args: object` syntax: `{% graphql result = 'mutation/name', args: validated_object %}`. This eliminates parameter unpacking boilerplate and ensures all input is validated before GraphQL execution."

---

## Rule R-23: events-published-via-background-tag

**Skill claim:** "Events (pub-sub side effects) are published from the EXECUTE stage of Commands via `{% background %}` blocks." (Inferred from decision tree, SKILL.md lines 102-105: "React to something that happened → events-consumers/", "Run code asynchronously → background-jobs/", "Send email after an action → events-consumers/ + emails-sms/".)

**Real-repo evidence FOR:**
- ABSENT: Zero `{% background %}` blocks found across all 438 .liquid files in the four reference repos (search: `grep -r "{% background\|{%- background"` returned 0 results).
- No events-consumers directories or event files found in any repo.
- No background-jobs directories found in any repo.

**Real-repo evidence AGAINST:**
- ABSENT: No evidence of pub-sub events, background jobs, or async side effects in any repo. Pages and commands do not use the `background` tag.
- The rule references a feature (events, background publishing) that does not exist in the corpus, suggesting either:
  1. The feature is aspirational/future work, or
  2. The rule applies to a different codebase (e.g., core platform modules, not reference addons).

**Cross-repo agreement:** `absent` — No evidence of the pattern. Cannot grade compliance.

**Linter check:** No enforcement found. No test fixtures demonstrate background tag usage.

**Recommended evidence classification:** `skill-only` (aspirational; not present in reference repos)

**Recommended severity:** `info` (guides future patterns; not yet practiced)

**Recommended resolution:** `DROP` (or `NUANCE`)

**Suggested rewrite (if keeping):**
> "When Commands publish side effects (e.g., send email, trigger external API, log events), encapsulate the async work in the EXECUTE stage using `{% background %}` tags. This prevents blocking the response. See `references/background-jobs/` for examples. NOTE: This pattern is not yet demonstrated in the reference repos; it represents a future enhancement."

---

## Rule R-24: auth-policies-in-page-front-matter

**Skill claim:** "Authorization policies are declared in page front matter via the `authorization_policies:` key and run before page logic." (SKILL.md lines 114-115: "Block unauthorized access (403) → authorization_policies in page front matter".)

**Real-repo evidence FOR:**
- `app-portal/modules/portal/public/views/pages/overview.liquid:25-26` declares policies in front matter:
  ```
  authorization_policies:
    - modules/portal/is_user_logged_in
  ```
  Page body executes only if the policy passes.

- `app-seedling/modules/dashboard/public/views/pages/dashboard.liquid` uses front matter policies (observed in audit reference).
- **Count:** 19 files in app-portal, 6 files in app-seedling, 2 files in addon-ecommerce use front-matter `authorization_policies:` declarations.

**Real-repo evidence AGAINST:**
- `app-portal/modules/portal/public/views/pages/api/stripe/cards/put.liquid` has commented-out policies:
  ```
  #authorization_policies:
  ```
  (Suggesting some pages intentionally skip authorization checks; not violating the rule, just unused.)

- ABSENT: No inline authorization checks found (e.g., `if !current_user` guards in page body). All auth is delegated to front-matter policies. This is good practice, not a violation.

**Cross-repo agreement:** `grounded` — Pages consistently declare auth policies in front matter. Pattern is well-followed.

**Linter check:** No enforcement found. Linter could flag pages without authorization_policies and warn for security.

**Recommended evidence classification:** `real-project` (rule observed; pattern enforced in practice)

**Recommended severity:** `warning` (security best practice; should be enforced)

**Recommended resolution:** `KEEP-DOWNGRADE`

**Suggested rewrite:** (Keep as-is; rule is sound.)
> "Authorization policies MUST be declared in page front matter via the `authorization_policies:` key. Policies run before the page body executes, ensuring unauthorized users receive a 403 response before any template logic runs. Inline authorization checks (e.g., `if user == blank`) are permitted only as secondary guards; the primary check must live in front matter."

---

## Rule R-25: schema-properties-via-property-functions

**Skill claim:** "GraphQL queries access schema properties via `property()`, `property_int()`, `property_float()`, `property_boolean()`, `property_array()`, `property_upload()` functions." (Decision tree, SKILL.md: schema property access; exact line pending.)

**Real-repo evidence FOR:**
- `app-portal/modules/portal/public/graphql/credit_cards/get_selected_credit_card.graphql` uses typed property functions:
  ```
  uuid:property(name:"uuid")
  currency:property(name:"currency")
  card_brand:property(name:"card_brand")
  bank_name:property(name:"bank_name")
  ```
  And:
  ```
  is_enabled: property_boolean(name: "is_enabled")
  primary_account_holder: property_boolean(name: "primary_account_holder")
  ```

- `app-portal/modules/portal/public/graphql/clients/get_discount_by_code.graphql` uses typed functions:
  ```
  usage_count: property_int(name: "usage_count")
  usage_limit: property_int(name: "usage_limit")
  usage_limit_per_user: property_int(name: "usage_limit_per_user")
  ```

- `app-portal/modules/portal/public/graphql/uploads/get_s3_upload.graphql` uses upload function:
  ```
  s3_upload: property_upload_presigned_url(...)
  ```

- **Count:** 30+ files across the corpus use typed property functions (`property_int`, `property_boolean`, `property_array`, `property_upload`). Generic `property(name: ...)` is also widely used for string properties.

**Real-repo evidence AGAINST:**
- ABSENT: No violations found. All property access uses the function syntax. No raw schema references or undeclared property names found.

**Cross-repo agreement:** `grounded` — All GraphQL files in the corpus consistently use typed property functions. Rule is universally followed.

**Linter check:** No enforcement found. Linter could flag undefined properties or missing type functions.

**Recommended evidence classification:** `real-project` (rule observed universally)

**Recommended severity:** `error` (linter should enforce; undefined properties cause runtime errors)

**Recommended resolution:** `KEEP-AS-IS`

**Suggested rewrite:** (No change needed.)
> "Access schema properties in GraphQL via typed property functions: `property()` for strings, `property_int()` for integers, `property_float()` for decimals, `property_boolean()` for booleans, `property_array()` for arrays, `property_upload()` for files. Example: `email: property(name: \"email\")`, `count: property_int(name: \"count\")`, `is_active: property_boolean(name: \"is_active\")`."

---

## Summary Table

| Rule | Verdict | Recommended Resolution | Key Finding |
|---|---|---|---|
| **R-17** | Factually incorrect | REWRITE | Modules are checked-in source, not installed/overwritten |
| **R-18** | Correct, partially violated | KEEP-DOWNGRADE | Hardcoded Statsig key in technical_foot.liquid (SECURITY) |
| **R-19** | Grounded, not violated | KEEP-AS-IS | All liquid blocks comply; no wrapping violations found |
| **R-20** | Absent enforcement | KEEP-DOWNGRADE | Rule stated but no CI/pre-commit enforcement visible in repos |
| **R-21** | Grounded, well-followed | KEEP-DOWNGRADE | related_record() used correctly; property arrays used for filtering only |
| **R-22** | Grounded, observed | KEEP-AS-IS | args: object syntax consistently used; one syntax typo |
| **R-23** | Feature absent | DROP or NUANCE | No background tags, events-consumers, or async side effects found in corpus |
| **R-24** | Grounded, well-enforced | KEEP-DOWNGRADE | All auth delegated to front-matter policies; pattern universal |
| **R-25** | Grounded, universal | KEEP-AS-IS | All 30+ GraphQL files use typed property functions; rule universal |

---

## Meta-findings

1. **Security incident in R-18:** The hardcoded Statsig API key in `app-portal/modules/website/public/views/partials/layout/technical_foot.liquid:19` must be flagged and remediated. While Statsig keys are read-only, this violates the rule and sets a bad precedent. Recommend migrating to `context.constants.statsig_api_key` before shipping R-18.

2. **Module architecture mismatch:** R-17 claims modules are "installed and overwritten," but the corpus shows modules are checked-in source code. The rule should be reframed to address the real risk: modifying shared modules without going through the addon/shared-module release process. Composition (partials, includes) is the correct mitigation.

3. **Aspirational vs. grounded:** Rules R-20 (CI audit enforcement) and R-23 (background events) are aspirational—stated as MUST but not evidenced in the corpus. Before shipping, clarify whether these are:
   - Mandatory for the future (gate them behind a feature flag in the engine)
   - Optional practices (downgrade to SHOULD)
   - Applied to a different codebase (remove from the v1 corpus)

4. **Linter enforcement gap:** Multiple rules (R-19, R-20, R-24, R-25) are not enforced by `insites-cli audit` despite being cited as audit-enforced. Before shipping any rule as `evidence: cli-audit`, run a known-bad fixture through the linter and confirm it fails.

5. **Corpus compliance:** Of the 9 rules audited:
   - **5 GROUNDED** (R-19, R-21, R-22, R-24, R-25) — well-followed, safe to ship with minor downgrades
   - **2 KEEP-DOWNGRADE** (R-18 security fix needed, R-20 CI enforcement clarification)
   - **1 REWRITE** (R-17 module framing)
   - **1 DROP/NUANCE** (R-23 background events absent)

