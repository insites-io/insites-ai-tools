# Changelog

All notable changes to the Insites Logic Engine will be documented in this file.

## [1.1.0] - 2026-05-06

### Repository

- **Renamed** `insites-ai-tools` → `insites-logic-engine` to align with the npm package identifier (`@insites/logic-engine`). Install URLs in `install.sh`, `claude-install.sh`, `install-examples.sh`, and `command/insites.md` updated; `engine/package.json` repository URL repointed; default branch corrected from `master` → `main` (the previous URLs were silently broken).
- **README rewritten** around the two deliverables: `skills/insites/` for LLM consumption, `engine/` + `logic-engine/` for programmatic tooling. Replaced the stale generic decision-tree list with the actual category index from `SKILL.md`.

### Logic Engine v0 (engine + corpus)

- **Added** the `@insites/logic-engine` npm package skeleton (`engine/`) — TypeScript library that loads the corpus, evaluates `when`/`then` decisions, renders Eta scaffold templates, and exposes an MCP server entry point.
- **Added** the `logic-engine/` corpus: `rules/` (9 markdown constraint files), `decisions/` (12 module-detection + 6 feature-pattern + 6 scaffold), `templates/`, and `audit/` (cross-repo grounding for v0 — 25 rules, R-1 to R-25).
- **Fixed** corpus correctness (PR #1 follow-up): discriminated-union Zod schema for decision kinds (C-1), `prepack` script that bundles the corpus into the npm package (C-3), regex tightening, integration tests. 23/23 vitest tests passing.

### Skill rewrite — `skills/insites/`

The v1.1.0 release rewrites the Insites skill against canonical Combinate codebases (`app-portal`, `app-seedling`) instead of upstream PlatformOS docs. The audit-grounded changes:

- **Project layout** (Skill 01): replaced flat `app/views/...` with the modules-based layout used in real Combinate projects — `modules/<name>/public/{views,forms,graphql,authorization_policies,api_calls,schema,user_profile_types,emails,migrations,assets}/`. Added `references/project-structure.md` covering path conventions, file naming, and explicit callouts that `app/lib/{commands,queries,validations,helpers}/` do not exist.
- **Drop legacy patterns** (Skill 02): deleted `references/commands/` (R-4) and `references/events-consumers/` (R-16). `SKILL.md` Critical Architecture Rule #3 retitled from "Command pattern" to "State changes live in form `callback_actions`". Cleaned dangling cross-references in `pages/`, `partials/`, `background-jobs/`, `authentication/`. Also dropped misleading "`insites-cli modules install` is not yet available" framing (R-8).
- **Pages** (Skill 03): softened R-1 from absolute "no HTML in pages" to a calibrated rule — small page-specific markup, JSON-page bodies, and short redirect/error pages allow inline HTML; reusable markup belongs in partials (~10-line extract threshold).
- **Partials** (Skill 04): softened R-2 from "no GraphQL in partials" to the canonical rule — pages own data fetching for new code; existing addons that contain GraphQL-in-partial code are documented as legacy debt rather than wrong.
- **Forms** (Skill 05): replaced the older "command pattern (build → check → execute)" framing with form definitions at `modules/<name>/public/forms/<name>.liquid` — YAML schema with per-field validation + Liquid `callback_actions` block for state changes and side effects. Added a worked `update_password` example covering `form_set_error` / `form_set_field_error` / `form.errors`.
- **GraphQL** (Skill 06): added a "User profiles and `user_profile_types/`" section to `graphql/README.md` documenting how profile schemas are queried via `related_record` + property accessors, with multi-profile-type users called out explicitly.
- **Authorization** (Skill 07): corrected the truthy/falsy framing — policies are not Liquid `return true/false` controllers; the platform compares the file's *output* as a string against the literal `"true"`. Switched canonical examples to single-line `{%- ... -%}` whitespace-trimmed Liquid that emits exactly `true` or `false`. Documented three concrete failure modes (trailing newline, truthy-object return, policy-name typo).
- **New reference dirs** (Skills 08, 10–12): lean starter `README.md`s for `api-endpoints/` (inbound JSON), `crm-controllers/` (path-aliased CRM V2 controllers), `user-profile-types/` (schema → GraphQL property-accessor pattern), and `payments/` (Stripe via api_calls + constants + form callback_actions). Skill 09 (`api-calls/`) verified as already complete.

### CRM, CMS, Data module references

Three full reference directories added during the v1.1.0 cycle (one per module), each with the standard six-file shape (`README/api/configuration/patterns/gotchas/advanced.md`) plus module-specific extensions:

- **CRM** — V2 REST endpoints, custom/system fields, webhook coverage, `globals/` (tasks, activities, attachments, event_streams), `schema.md` field-by-field reference.
- **CMS** — `metadata.md` (10 object types), file-based stance, IIA admin paths, override patterns.
- **Data** — V2 endpoints for user-defined databases, schema discovery, bulk-loop patterns, IIA configuration walkthrough.

### CLI reference

- **Rewritten** `cli/api.md` against actual `insites-cli help` output — fixed 8 inaccuracies, removed 1 invented command, added 6 missing commands.
- **Removed** all references to a non-existent `insites-cli test` command (R-23) and the entire `references/testing/` directory.

### White-label cleanup

- Dropped `@platform-os/*` npm references and `platform-os` → `insites` tag samples (R-3 / R-9 / R-13).
- Calibrated `SKILL.md` tone — removed dramatic framing, demoted all-caps emphasis to prose.
- Trimmed Section 1 marketing copy from `SKILL.md`.

### QA

- 26 broken markdown links across `skills/` repaired in a single sweep (TW-25999899). Post-fix scan returns 0 broken across 812 relative links in 201 files. Cross-references between reference modules validated against `SKILL.md`.

### Follow-ups (not in this release)

- TW-26199053 — CI guard against audit-regressing patterns (no `app/lib/commands/`, no flat `app/views/`, no `Bearer` prefix in V2 auth examples, whitespace-trimmed authorization-policy output, etc.).
- 5 interactive QA subtasks remain on TW-25999897: install + verify with Claude, deploy generated code to staging, test 8 decision trees against real modules, fresh-install on clean machine, code-review skill against 7 module types.

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
