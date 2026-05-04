# CRM Module

The Insites CRM module manages contacts, companies, and the work attached to them — addresses, custom fields, relationships, tasks, activities, attachments, and an event-stream audit feed. It exposes a V2 REST API for external integrations and is configured through the IIA admin UI.

## Where to look

| If you're… | Read |
|---|---|
| Looking up the field shape of a CRM resource (types, required, IIA columns) | [`schema.md`](schema.md) |
| Building an external app that calls the CRM API | [`api.md`](api.md) |
| Calling these endpoints from inside an Insites Liquid app | [`api.md`](api.md) + [`../../api/calling-from-liquid.md`](../../api/calling-from-liquid.md) (when written) |
| Looking up the IIA admin paths to configure custom fields, system fields, webhooks | [`configuration.md`](configuration.md) |
| Working with cross-module-shared resources (tasks, activities, attachments, event streams) | [`globals/`](globals/) |
| Looking for examples of common multi-step flows | [`patterns.md`](patterns.md) |
| Hitting an API edge or unexpected behavior | [`gotchas.md`](gotchas.md) |
| Customizing or extending CRM behavior in an Insites app | [`advanced.md`](advanced.md) |

## V2 REST API is the supported surface

The CRM exposes a V2 REST API at `/crm/api/v2/...`. **The V2 API is the preferred way to interact with CRM data** for both external integrations and in-Liquid callers. GraphQL queries against the underlying schema exist, but the V2 API gives you a stable, documented contract — use it whenever the operation you need is exposed there. Legacy v1 endpoints are archived and are not documented in this skill.

## What lives where

```
modules/crm/
├── README.md            ← you are here
├── api.md               ← V2 REST endpoints (CRM-specific resources)
├── schema.md            ← field-by-field shape of every resource (types, required, IIA columns)
├── configuration.md     ← IIA admin walkthrough (custom fields, system fields, webhooks)
├── patterns.md          ← worked HTTP examples for common flows
├── gotchas.md           ← API edges and quirks
├── advanced.md          ← extension points, overrides, hooks
└── globals/             ← global resources (tasks, activities, attachments, event streams)
                          owned by CRM but consumed by other modules
```

## Auth, in one sentence

Send the raw instance API key as the `Authorization` header. **No `Bearer` prefix.** Acquire and rotate the key from the IIA admin UI. Full reference: [`../../api/authentication.md`](../../api/authentication.md).

## Webhooks, in one sentence

CRM fires webhooks on contact and company **create and update** — and nothing else (no delete, no archive/restore, no sub-resource events). Subscribers are registered in IIA. See [`api.md#webhooks`](api.md) for the exact event names and [`configuration.md`](configuration.md) for where to register endpoints.
