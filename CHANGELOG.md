# Changelog

All notable changes to the Insites Logic Engine will be documented in this file.

## [1.1.0] - 2026-05-06

### New Feature

- **`@insites/logic-engine` npm package** — new TypeScript library that loads the rule and decision corpus, evaluates `when`/`then` decisions, renders Eta scaffold templates, and exposes an MCP-server entry point. Source under `engine/`.
- **Versioned rule + decision corpus** — 9 markdown rule files, 24 JSON decision files (12 module-detection + 6 feature-pattern + 6 scaffold), Eta scaffold templates, and an audit folder grounding each rule against real production codebases (`app-portal`, `app-seedling`). Source under `logic-engine/`.
- **`api-endpoints/` reference** — building inbound JSON endpoints under the V2 surface (`api/_external/v2/<resource>/<action>.json.liquid`), with auth, method, status-code, error, and pagination conventions.
- **`crm-controllers/` reference** — controllers that conform to the CRM module's V2 surface using the `path:` front-matter alias.
- **`user-profile-types/` reference** — schema location, GraphQL read via `related_record` + property accessors, write via `record_create`/`record_update`, multi-profile users.
- **`payments/` reference** — Stripe integration assembled from `api_calls/`, `constants/`, and form `callback_actions`. Worked Checkout Session example and webhook receiver shape.
- **CRM module reference** — V2 REST endpoints, custom and system fields, webhook coverage, `globals/` (tasks, activities, attachments, event_streams), and a field-by-field `schema.md`.
- **CMS module reference** — `metadata.md` covering 10 object types (Pages, Layouts, Partials, Web Files, Globals, Collections, Emails, SMS, Authorization Policies), file-based stance, IIA admin paths, and override patterns.
- **Data module reference** — V2 endpoints for user-defined databases, schema discovery, bulk-loop patterns, and an IIA configuration walkthrough.
- **GraphQL profile queries** — new "User profiles and `user_profile_types/`" section explaining how profile schemas are queried via `related_record` + property accessors, with multi-profile-type users called out explicitly.

### Improvement

- **Repository renamed** `insites-ai-tools` → `insites-logic-engine` to align with the npm package identifier `@insites/logic-engine`. Install URLs and the GitHub repository updated; the previous URLs remain redirected for a transition period.
- **README rewritten** around the two deliverables: `skills/insites/` for LLM consumption, `engine/` + `logic-engine/` for programmatic tooling. Replaced the stale generic decision-tree list with the actual category index from `SKILL.md`.
- **Modules-based project layout** — replaced the flat `app/views/...` tree with the layout real Combinate projects actually use: `modules/<name>/public/{views,forms,graphql,authorization_policies,api_calls,schema,user_profile_types,emails,migrations,assets}/`. Added `references/project-structure.md` with explicit callouts that `app/lib/{commands,queries,validations,helpers}/` do not exist in canonical Combinate.
- **State changes via `callback_actions`** — replaced the older "command pattern (build → check → execute)" framing with form definitions at `modules/<name>/public/forms/<name>.liquid`. YAML schema declares fields and per-field validation; a Liquid `callback_actions` block runs the GraphQL mutations and side effects. Worked `update_password` example covering `form_set_error` / `form_set_field_error` / `form.errors`.
- **Pages rule calibrated** — softened the strict "no HTML in pages" rule to match real practice. Tiny page-specific markup, JSON-page bodies, and short redirect/error pages may live inline; reusable markup belongs in partials, with ~10 lines of HTML as the extract-it threshold.
- **Partials rule calibrated** — pages own data fetching for new code, with addon legacy-debt explicitly documented. Existing addons that contain GraphQL inside partials are now described as legacy patterns to follow locally rather than as outright wrong.
- **White-label cleanup** — dropped `@platform-os/*` npm references and `platform-os` → `insites` tag samples. Calibrated `SKILL.md` tone (removed dramatic framing, demoted all-caps emphasis to prose, trimmed marketing copy from Section 1).
- **CLI reference rewritten** against the actual `insites-cli help` output (see also Bug Fix below).
- **Removed dead reference areas** — deleted `references/commands/` and `references/events-consumers/` (patterns sourced from PlatformOS docs that don't exist in canonical Combinate). Cleaned dangling cross-references in `pages/`, `partials/`, `background-jobs/`, and `authentication/` docs.

### Bug Fix

- **Authorization policy output invariant** — corrected the truthy/falsy framing. Policies are not Liquid `return true/false` controllers; the platform compares the file's *output* as a string against the literal `"true"`. Canonical examples now use single-line `{%- ... -%}` whitespace-trimmed Liquid that emits exactly `true` or `false`. Three concrete failure modes documented: trailing newline, returning a Liquid truthy object, and policy-name typos.
- **Logic Engine v0 correctness** — discriminated-union Zod schema for decision kinds (so all 12 module-detection decisions actually load instead of failing silently), `prepack` script that bundles the corpus into the published npm package, and regex tightening on partial-resolution rules. 23/23 vitest tests passing.
- **CLI reference accuracy** — `cli/api.md` had 8 inaccurate command signatures, 1 invented command (`insites-cli test`), and 6 missing real commands. Rewritten against the actual `insites-cli help` output.
- **26 broken markdown links** across `skills/` repaired in a single sweep. Post-fix scan: 0 broken across 812 relative links in 201 files.
- **Misleading "modules install is not yet available" framing** — replaced across `cli/patterns.md`, `cli/advanced.md`, and `configuration/README.md` with accurate prose ("modules are preinstalled per Insites instance and updated through the Insites console; there is no CLI command to install or uninstall modules").
- **Install URL branch reference** — install scripts pointed at `master`, but the repository's default branch is `main` — the old install commands were silently broken. Corrected to `main` everywhere.

### Follow-ups (not in this release)

- TW-26199053 — CI guard against audit-regressing patterns (prevents reintroduction of `app/lib/commands/`, flat `app/views/`, `Bearer ` prefix in V2 auth examples, multi-line authorization-policy output, etc.).
- 5 interactive QA subtasks remain on TW-25999897: install + verify with Claude, deploy generated code to staging, test SKILL.md decision trees against real modules, fresh-install on clean machine, code-review skill against 7 module types.

## [1.0.0] - 2026-03-19

### What is this?

Insites AI Tools is a skill documentation package that teaches LLMs (Claude, GPT, etc.) how to write correct code for the Insites platform. When installed, AI assistants can help developers build pages, query data, create commands, handle authentication, deploy code, and follow Insites coding conventions — without hallucinating unsupported features.

### Key Features

- **Liquid Templating** — Complete reference for Insites-specific tags (`graphql`, `function`, `render`, `background`, `cache`, `session`, `sign_in`, etc.), filters, objects, and coding standards including whitespace stripping guidance
- **GraphQL Data Layer** — Queries, mutations, property accessors, relationships (`related_record` / `related_records`), filtering, sorting, and pagination patterns
- **Command Pattern** — Build → Check → Execute workflow with inline validation, contract-based error accumulation, and 16 documented validation patterns (presence, uniqueness, number, email, length, format, date, and more)
- **Authentication & Authorization** — `authorization_policies/` for page guards, `context.current_user` for user access, role-based permission checking, sign-in/sign-out flows
- **Routing** — File-based routing with dynamic parameters, content-type mapping, HTTP method handling, and slug configuration
- **Schema & Migrations** — YAML schema definitions, property types, relationship conventions, migration lifecycle, and deployment
- **Events & Background Jobs** — Asynchronous event consumers, background job dispatch with `{% background %}` tag, priority and retry configuration
- **Sessions, Caching, Flash Messages** — Native session management via `context.session`, cache tag patterns, flash message flows with redirect
- **Module Development** — `public/` vs `private/` path conventions for building reusable modules
- **Code Refactoring Guide** — When and how to extract reusable partials (validations, execute helpers, UI components, authorization policies) with before/after examples
- **CLI Reference** — All `insites-cli` commands (`audit`, `deploy`, `sync`, `logsv2`, `env add`, `gui serve`, `migrations`, `modules`, `data`) with correct syntax and status notices on under-development commands
- **Decision Trees** — Deterministic routing from any developer request to the correct reference docs
