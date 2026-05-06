# API Endpoints (inbound)

API endpoints expose JSON over HTTP from a module. They are pages with the `.json.liquid` extension that read `context.params`, run GraphQL or call other partials, and emit a JSON response.

> **Distinction:** this directory covers **endpoints you build** (inbound HTTP into your project). For **outbound calls** to third-party services (Stripe, Twilio, etc.), see [`api-calls/`](../api-calls/README.md).

## Where they live

API endpoints follow the canonical V2 API surface: `modules/<module>/public/views/pages/api/_external/v2/<resource>/<action>.json.liquid`. The `_external/v2/` segment is the public V2 surface — sibling folders under `api/` are internal IIA-only and should not be exposed to API consumers.

## Minimal endpoint

```liquid
{% comment %} modules/dashboard/public/views/pages/api/_external/v2/products/index.json.liquid {% endcomment %}
---
slug: api/_external/v2/products
method: get
authorization_policies:
  - is_api_authenticated
---
{% liquid
  graphql res = 'modules/dashboard/products/list',
    page: context.params.page | default: 1,
    per_page: context.params.per_page | default: 25
  assign body = res.records | json
  print body
%}
```

## Conventions

- **Authentication.** V2 endpoints expect a raw `instance_<50-char-alphanumeric>` token in the `Authorization` header (no `Bearer` prefix). See [`api/authentication.md`](../api/authentication.md) for the exact contract.
- **Method handling.** One file per HTTP verb. PUT/DELETE need `_method` only when called via HTML forms; native API clients send the verb directly.
- **Status codes.** Set explicit response codes via `{% response_status N %}` for non-200 outcomes (validation 422, not found 404, unauthenticated 401, forbidden 403).
- **Errors.** Emit `{ "errors": [{ "message": "...", "field": "..." }] }` shaped responses for validation failures so consumers can pattern-match.
- **Pagination.** Mirror what GraphQL returns: `{ "results": [...], "total_entries": N, "current_page": N, "total_pages": N }`.

## See Also

- [`api/authentication.md`](../api/authentication.md) — V2 auth (instance token, no Bearer prefix)
- [`api/calling-from-liquid.md`](../api/calling-from-liquid.md) — how controllers/pages alias paths via `path:` front-matter
- [`api-calls/`](../api-calls/README.md) — outbound HTTP from Liquid
- [`pages/`](../pages/README.md) — pages as controllers
- [`graphql/`](../graphql/README.md) — data layer behind endpoints
