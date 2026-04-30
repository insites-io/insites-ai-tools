# CRM — Configuration

What an instance administrator can configure in the IIA admin UI to shape the behavior of the CRM module. **Modules are preinstalled** on Insites instances; updates happen through the Insites console, not via CLI.

For authentication, see the shared [`references/api/authentication.md`](../../api/authentication.md).

---

## Custom field definitions

The shape and metadata of custom fields on contacts and companies are configured in IIA, not via the V2 API (the API only manages values for existing definitions and supports `DELETE` on existing definitions). New definitions are added through the admin UI.

| Audience | IIA path |
|---|---|
| Contact custom-field configuration | `<your-insites-instance>/admin/insites#/crm/custom-fields/contacts/configuration` |
| Company custom-field configuration | `<your-insites-instance>/admin/insites#/crm/custom-fields/companies/configuration` |
| Custom-fields landing | `<your-insites-instance>/admin/insites#/crm/custom-fields` |

**Available custom-field types** (from the shape `attribute_type` returned by the V2 list endpoint): `string`, `integer`, `float`, `boolean`, `array`, `geo_json`. Each type can have a different UI element selected for it (input, dropdown, checkbox, card_select_multiple, file_multiple, etc.) — the UI element does not change the underlying storage.

Once defined, set/read values per-contact or per-company using the dotted-path key style on the contact/company endpoints — see [`api.md`](api.md) and [`patterns.md`](patterns.md).

---

## System fields

System fields populate the dropdown values across the CRM (contact type, contact category, lead source, company type, industry, relationships). Each named system field group is configured separately in IIA.

| System field group | IIA path |
|---|---|
| Contact type | `<your-insites-instance>/admin/insites#/crm/system-fields/contact-type` |
| Contact category | `<your-insites-instance>/admin/insites#/crm/system-fields/contact-category` |
| Lead source | `<your-insites-instance>/admin/insites#/crm/system-fields/lead-source` |
| Company type | `<your-insites-instance>/admin/insites#/crm/system-fields/company-type` |
| Industry | `<your-insites-instance>/admin/insites#/crm/system-fields/industry` |
| Relationships | `<your-insites-instance>/admin/insites#/crm/system-fields/relationships` |
| System fields landing | `<your-insites-instance>/admin/insites#/crm/system-fields` |

System field values can also be created and updated via the V2 API at `/crm/api/v2/system-fields` — the IIA UI and the API both back into the same store.

---

## Webhooks

CRM webhooks fire on contact/company create and update (see [`api.md`](api.md) Webhooks section for the exhaustive list). Webhook subscribers — the URLs Insites should `POST` events to — are registered in the IIA admin UI:

| | IIA path |
|---|---|
| CRM webhook subscriptions | `<your-insites-instance>/admin/insites#/crm/webhooks` |

For each webhook subscription, the admin specifies the destination URL and (where supported) any signing secret used to authenticate the payload to the receiver.

CRM does **not** offer fine-grained per-event subscriptions in the V2 API; webhook configuration lives in the admin UI only.

---

## CRM activities integration

CRM activities (calls, meetings, etc.) can be wired into external integrations (e.g., to mirror activities into a calendar or a connected CRM):

| | IIA path |
|---|---|
| CRM activities integration | `<your-insites-instance>/admin/insites#/integrations/crm-activities` |

---

## Authorization policies

Insites does **not have built-in roles**. Any access control rules beyond the instance API key (which gates V2 access at all) are implemented per-instance via custom `authorization_policies` written by developers — see the platform's authorization references rather than CRM-specific docs.

---

## Authentication

Authentication for the CRM V2 API is identical to every other module's V2 API: a single instance-wide API key in the `Authorization` header (no `Bearer` prefix). Acquire and rotate it from the IIA admin UI.

See [`references/api/authentication.md`](../../api/authentication.md) for the full reference.

---

## Out of scope for this document

- **Module install / version updates** — handled via the Insites console, not by developers.
- **Pipelines, stages, opportunities, cases** — these are CRM concepts visible in IIA but **not currently exposed via the V2 API** (legacy v1 surfaces are archived). When/if these resources are added to V2, this document will be updated.
- **API endpoint definitions and API key management** for arbitrary user-defined endpoints — those live in the api module, not CRM.
