# CRM — Global resources

The endpoints in this folder live under `/crm/api/v2/...` (the same URL prefix as the rest of CRM) but the **resources are conceptually shared** — they are referenced and consumed by other Insites modules, not just CRM. They live here because `module-v5-core` owns the implementation, and other modules call these endpoints rather than re-implement them.

When another module's documentation needs to mention tasks, activities, attachments, or event streams, it links here instead of duplicating.

## Files

| File | Resource | Notes |
|---|---|---|
| [tasks.md](tasks.md) | Tasks + task comments | Includes `complete` / `open` lifecycle PATCH actions |
| [activities.md](activities.md) | Activities | Calls, meetings, emails, etc. — attached to a feature (contact, company, opportunity) |
| [attachments.md](attachments.md) | Attachments + attachment credentials | Two-step upload flow via temporary S3 credentials |
| [event_streams.md](event_streams.md) | Event streams | Audit / activity feed |

## Conventions

All globals follow the same conventions as the rest of the CRM V2 API. See [`../api.md`](../api.md) for:

- Authentication (raw `Authorization` header, no `Bearer` prefix)
- URL pattern (`/crm/api/v2/<resource>[...]`)
- Request format and dotted-path nested references (`<relation>.uuid`)
- Response envelope (success and error shapes)
- List envelope (`total_entries / total_pages / page / size / results`)
- Common LIST query params (`page`, `size`, `sort_by`, `sort_order`, `search_by`, `keyword`, `exact`)
- Security headers
- Status codes and the `format=json` behavior

## Webhooks

**No globals fire webhooks** as of this writing. Only contact/company create and update on the CRM-specific resources do — see [`../api.md`](../api.md) Webhooks section for the full audit.
