# Rules — Pages

Rules that apply to files under `app/views/pages/` (or module-equivalent paths like `modules/{name}/public/views/pages/`).

---

```yaml
---
id: pages-one-http-method
applies_to: [page]
severity: info
evidence: real-project
evidence_source: "100% compliance across 30+ pages in app-portal, app-seedling, addon-ecommerce, addon-events. Each page declares exactly one method: in YAML front matter."
audit_ref: audit/v0-conflicts-batch2.md#rule-r-13
---
```

**Rule:** Each page declares exactly one HTTP method (`get`, `post`, `put`, `patch`, or `delete`) in its YAML front matter.

**Why:** Pages are HTTP endpoints. Mixing methods makes routing behaviour ambiguous and breaks the platform's request-handler contract.

**How to apply:** When creating a page, add `method: <verb>` to the front matter. If you need the same URL to serve multiple methods, create separate page files (e.g. `users/get.liquid`, `users/post.liquid`).

**Verified by:** All 30+ inspected pages declare a single `method:`. Examples:
- `app-portal/modules/portal/public/views/pages/api/users/check-user-email.liquid:4` — `method: get`
- `addon-ecommerce/modules/ecommerce/public/views/pages/api/contacts/put.liquid:4` — `method: put`
- `addon-events/modules/events/public/views/pages/api/contacts/add-password.liquid:4` — `method: put`

---

```yaml
---
id: pages-prefer-partials-for-shared-html
applies_to: [page]
severity: warning
evidence: real-project
evidence_source: "Rewrite of original R-1 'pages-no-html'. Original rule said pages must contain no HTML, but 49/438 real-world pages contain inline HTML and the pattern is widespread. Real convention: pages may contain inline HTML for simple content; HTML reused across pages should be extracted to partials."
audit_ref: audit/v0-conflicts-batch1.md#rule-r-1
supersedes: [pages-no-html]
---
```

**Rule:** HTML chunks reused across multiple pages, or composed from 3+ distinct UI blocks, SHOULD be extracted into partials and rendered via `{% render %}`. Inline HTML in a page is acceptable for simple content (static text, single forms, system pages).

**Why:** Reusable HTML in partials prevents drift, makes refactoring easier, and keeps page files focused on routing + data fetching. Forcing every page to be a thin controller is overkill for simple content pages and is contradicted by widespread practice in the canonical repos.

**How to apply:**
- If your page contains a hero + featured products + footer → extract each into a partial.
- If your page contains a single static block of marketing copy → inline HTML is fine.
- If you find yourself copy-pasting HTML between pages → extract.

**Verified by:** Real-world examples show both patterns:
- Inline HTML in pages (acceptable): `app-portal/modules/website/public/views/pages/privacy_policy.liquid` (static legal copy), `app-seedling/modules/website/public/views/pages/index.liquid` (hero section)
- Partial-based pages (preferred for composition): `app-portal/modules/website/public/views/pages/index.liquid` (uses `{% render %}` to delegate)

**Note:** This rule was substantially rewritten during the v0 audit. The original wording ("NO raw HTML/JS/CSS in pages") was contradicted by 11.2% of real-world pages.
