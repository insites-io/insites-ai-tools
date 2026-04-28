# Insites AI Tools — TODO

## Done (v1.0.0)

### Rebrand
- [x] Updated all GitHub repo URLs → `insites-io/insites-ai-tool` (10 files)
- [x] Updated support email → `support@insites.io`
- [x] Initialized git repo and pushed to `github.com/insites-io/insites-ai-tool`
- [x] Fixed `.gitignore` (old plugin path, added `.DS_Store` / `*~`)
- [x] Renamed `.pos` → `.insites` across all 27 skill docs
- [x] Fixed `.insites` file format from YAML → JSON with correct fields (`instance_uuid`, `token`, `email`, `url`, `key`)
- [x] Removed fabricated `.insites` config sections (caching, sessions, migrations, translations, CDN)

### CLI Command Fixes
- [x] `platformos-check` → `insites-cli audit` (30+ files)
- [x] `insites-cli logs` → `insites-cli logsv2` (alias: `l2`)
- [x] `insites-cli modules install` → noted as under development, replaced with `modules pull` where applicable
- [x] `insites-cli env current` / `env clear-cache` — noted as non-existent with workarounds
- [x] `insites-cli test run` — marked as under development throughout
- [x] `insites-cli constants set` — marked as under development throughout
- [x] Added CLI STATUS notices to all skill reference READMEs for under-development commands

### Module-Free Documentation
- [x] Replaced `modules/core/commands/execute` with actual inline code (`graphql r = mutation_name, args: object`)
- [x] Replaced `modules/core/commands/build` / `check` — documented as naming convention, not real helpers
- [x] Replaced `modules/user/queries/user/current` with `context.current_user` (what the module actually wraps)
- [x] Replaced `modules/user/helpers/can_do_or_unauthorized` with `authorization_policies/` + inline guards
- [x] Replaced `modules/core/helpers/redirect_to` with inline flash + `redirect_to` tag
- [x] Replaced `modules/core/commands/session/get/set/clear` with native `context.session` + `{% session %}` tag
- [x] Replaced `modules/core/commands/events/publish` with `{% background %}` tag pattern
- [x] Removed all `pos-module-core` and `pos-module-user` mandatory dependencies
- [x] Removed "NEVER use authorization_policies/" and "NEVER use context.current_user" — these are now shown as correct native features
- [x] All 16 platformOS validators documented inline (presence, uniqueness, number, email, length, etc.)

### Code Quality Improvements
- [x] Added module path conventions (`public/` / `private/`) to 30 files (READMEs, configurations, gotchas)
- [x] Added `{%- -%}` whitespace stripping guidance to liquid/tags/patterns.md
- [x] Added `args:` hash execute pattern to commands/patterns.md
- [x] Added contract-based validation pattern to commands/patterns.md
- [x] Added "Extracting Reusable Code" refactoring guide to partials/patterns.md
- [x] Added DRY architecture rule (#5) to SKILL.md
- [x] Disabled testing and translations references in SKILL.md (not yet ready)
- [x] Analyzed insites_core module coding patterns and adopted 3 best practices

---

## Remaining (Future Releases)

### Priority: High
- [ ] Rewrite `references/modules/` with actual insites module docs (module-ai, module-api, module-cms, etc.)
- [x] Document undocumented CLI commands: `archive`, `duplicate`, `pull`, `modules init`, `modules version`, `migrations run`
- [ ] Update `platformos-language-server` links in plugin READMEs

### Priority: Medium
- [x] Re-enable testing references once `insites-cli test run` is available (done in v5.9.2)
- [x] Remove translations module placeholder (removed — hardcode English for now)
- [x] Rename `.platformos-check.yml` → `.insites-check.yml` in docs/examples (verified: no references remain)
- [ ] Document `insites-cli modules install` when it becomes available

### Priority: Low
- [ ] `platformos-liquid` LSP language ID — only changeable if language server is updated
- [ ] `platformos.com` external docs URLs — live external links, leave as-is
- [ ] `platformos.com` instance URL examples in config docs — example placeholders
- [ ] `"platformos"` as a schema tag example value in `references/schema/patterns.md`

### CLI Team Backlog (commands to implement)
- [x] `insites-cli test run <environment>` (released in v5.9.2)
- [ ] `insites-cli constants set/list`
- [ ] `insites-cli translations import/export/list/validate/languages`
- [ ] `insites-cli assets upload/list/remove`
- [ ] `insites-cli cache clear/inspect/stats`
- [ ] `insites-cli exec liquid/graphql`
- [ ] `insites-cli sessions clear/debug`
- [ ] `insites-cli config set/show/validate`
- [ ] `insites-cli generate run`
- [ ] `insites-cli modules install`
