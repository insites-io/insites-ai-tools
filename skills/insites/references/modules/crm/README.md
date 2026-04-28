# Insites Core (CRM)

The `insites_core` module is the CRM foundation for Insites applications. It provides contacts, companies, activities, tasks, documents, relationships, and the admin/authentication layer.

**Required module** — this is the core module for all Insites CRM projects.

**Module name:** `insites_core`
**Slug:** `crm`
**Current version:** 5.13.2

## Install

```bash
insites-cli modules install insites_core
insites-cli deploy staging
```

## Core Entities

| Entity | Schema | Description |
|--------|--------|-------------|
| Company | `crm_company` | Business organizations |
| Contact | `crm_contact` | People (user profile type) |
| Activity | `activity` | Meetings, calls, emails, notes |
| Task | `task` | Assignable to-do items |
| Address | `crm_address` | Postal addresses (polymorphic) |
| Document | `crm_document` | File attachments (polymorphic) |
| Relationship | `crm_relationship` | Links between contacts/companies |
| System Field | `crm_system_field` | Lookup values (categories, types, industries) |
| Webhook | `crm_webhook` | Event-driven HTTP notifications |

## Data Model Overview

### Companies (`crm_company`)

```
company_name, registered_business_number, website
email_1, email_2, email_3
phone_country_code + phone_number, mobile_phone_country_code + mobile_phone_number
Social: facebook, twitter, youtube, linkedin, instagram, snapchat
tax_reference, is_tax_registered
notes, alerts (on_view_alert, on_edit_alert)
assigned_to_administrator_uuid, default_address_uuid
stripe_id, lead_source_uuid, category_uuid, industry_uuid, type_uuid
owner_company_uuid, owner_contact_uuid
is_archived
```

### Contacts (`crm_contact` — user profile type)

```
contact_avatar (upload), company_uuid
prefix, nationality, gender, birth_date, job_title
email_2 (primary email is on the user record)
work_phone, home_phone, mobile_phone (each with country_code + number)
Social: facebook, twitter, youtube, linkedin, instagram, snapchat, tiktok, pinterest
notes, alerts (on_view_alert, on_edit_alert)
assigned_to_administrator_uuid, custom_field_uuid
stripe_id, lead_source_uuid, category_uuid, type_uuid
owner_company_uuid, owner_contact_uuid
is_archived, assigned_groups (array)
```

### Activities (`activity`)

```
type (meeting, call, email, note, etc.), subject
notes, message
start_date_time, end_date_time
related_contact_uuids (array), related_administrator_uuids (array)
attachment_uuids (array)
related_table, related_type, related_uuid
company_uuid, contact_uuid, module
last_updated_by_administrator_uuid
```

### Tasks (`task`)

```
task_name, description, status (default: "open")
due_date
assignee_administrator_uuid
completed_by_administrator_uuid, completed_by_datetime
company_uuid, contact_uuid
related_table, related_uuid, module
```

### Addresses (`crm_address`)

```
related_uuid, related_type (polymorphic — links to company or contact)
address_label, address_1, address_2, address_3
city, county, district, suburb, state, country, country_code, postcode
latitude, longitude, geojson
```

### Documents (`crm_document`)

```
related_uuid, related_type (polymorphic)
document_label, file (upload), notes
```

### Relationships (`crm_relationship`)

```
first_party_type, first_party_uuid
second_party_type, second_party_uuid
relationship_type_uuid, notes
```

### System Fields (`crm_system_field`)

Lookup/enumeration table for dropdown values:

```
system_field: "contact_category" | "contact_type" | "company_category" |
              "company_type" | "industry" | "lead_source" | "nationality" | "prefix"
value: the display value
```

## Key Patterns

### Table Names in GraphQL

All CRM tables are namespaced under the module:

```
modules/insites_core/crm_company
modules/insites_core/crm_contact
modules/insites_core/activity
modules/insites_core/task
modules/insites_core/crm_address
modules/insites_core/crm_document
modules/insites_core/crm_relationship
modules/insites_core/crm_system_field
modules/insites_core/crm_webhook
```

### Polymorphic Relations

Addresses, documents, and activities use `related_uuid` + `related_type` to link to any entity (company or contact).

### Custom Fields

Dynamic fields per contact/company via:
- `crm_contact_custom_field` (created via migration)
- `crm_company_custom_field` (created via migration)

Managed through the external API endpoints at `/api/_external/`.

## Rules

- All schemas are private to the module — access data via GraphQL queries
- Contacts are user profile types, not standalone records
- System fields are the source of truth for dropdown/lookup values
- The `modules/` directory is read-only — never edit module files directly
- Custom fields are managed via API, not schema files

## See Also

- [Configuration](./configuration.md)
- [API Reference](./api.md)
- [Patterns](./patterns.md)
- [Gotchas](./gotchas.md)
- [Advanced](./advanced.md)
