# Insites Core (CRM) - Gotchas

## Contacts Are User Profile Types

Contacts are **not** standalone records — they are user profile types attached to `users`. This means:

- Primary email is on the `user` record, not the contact profile
- Contact `uuid` and user `id` are different identifiers
- Querying contacts uses the `users` GraphQL resource with profile filters, not `records`

```liquid
{% comment %} WRONG — contacts are not records {% endcomment %}
{% liquid
  graphql contact = 'modules/insites_core/records/get_record', table: "crm_contact", id: contact_id
%}

{% comment %} CORRECT — use the contacts query {% endcomment %}
{% liquid
  graphql contact = 'modules/insites_core/contacts/get_contacts', keyword: "john@example.com"
%}
```

## Table Names Are Module-Namespaced

All GraphQL operations must use the full namespaced table name:

```graphql
-- WRONG
table: "crm_company"

-- CORRECT
table: "modules/insites_core/crm_company"
```

## System Fields Must Be Pre-Populated

Dropdowns (category, type, industry, lead source) won't show values unless `crm_system_field` records exist. Populate them before using the CRM.

## Polymorphic Relations Require Both Fields

Addresses, documents, and activities link to entities via `related_uuid` + `related_type`. Always set both:

```liquid
{% comment %} WRONG — missing related_type {% endcomment %}
{% liquid
  graphql addresses = 'modules/insites_core/addresses/get_addresses', related_uuid: company.uuid
%}

{% comment %} CORRECT {% endcomment %}
{% liquid
  graphql addresses = 'modules/insites_core/addresses/get_addresses', related_uuid: company.uuid, related_type: "company"
%}
```

## Custom Fields Are Managed via API

Custom field definitions are not schema files — they're managed through the external API endpoints at `/api/_external/`. Don't try to create custom field schemas manually.

## Module Files Are Read-Only

Never edit files in `modules/insites_core/`. Override behavior through:
- Authorization policies in your app's `authorization_policies/`
- Wrapper commands in your app's `lib/commands/`
- Custom pages that call module queries

## 2FA Is Required for Admin Access

The `insites_only_allowed_by_administrators` policy requires both:
1. Active administrator status
2. 2FA verification OR SSO login

If admins can't access pages, check 2FA setup status.

## Archived Records Still Exist

Setting `is_archived: true` on a company or contact does **not** delete it. Queries default to returning non-archived records. To include archived records, explicitly pass `is_archived: true` or omit the filter.

## Phone Numbers Are Split Fields

Phone numbers are stored as two separate fields: country code and number.

```
phone_country_code: "+44"
phone_number: "7700900000"
```

Don't store the full number in a single field.

## See Also

- [README](./README.md)
- [Configuration](./configuration.md)
- [Patterns](./patterns.md)
