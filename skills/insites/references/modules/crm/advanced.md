# Insites Core (CRM) - Advanced

## Webhook Integration

### Webhook Payload Formats

| Format | When to use |
|--------|-------------|
| `changes_only` | Lightweight — only send what changed |
| `changes_with_snapshot` | Changes + full object for context |
| `full_object` | Always send the complete record |

### Registering a webhook

```graphql
mutation {
  record_create(
    record: {
      table: "modules/insites_core/crm_webhook"
      properties: [
        { name: "event_type", value: "contact_created" }
        { name: "webhook_url", value: "https://your-app.com/webhooks/contact" }
        { name: "is_webhook_enabled", value: "true" }
        { name: "payload_format", value: "full_object" }
      ]
    }
  ) { id }
}
```

## Custom Fields

### How custom fields work

Custom fields are dynamic — they're not defined in YAML schemas. Instead:

1. **Define** a custom field via the external API (`POST /api/_external/contact-custom-fields`)
2. The field is stored in `crm_contact_custom_field` or `crm_company_custom_field`
3. **Read** custom field values via `get_custom_fields` query
4. **Write** custom field values via the appropriate mutation

### Querying custom fields

```liquid
{% liquid
  graphql custom = 'modules/insites_core/custom_fields/get_custom_fields', related_uuid: contact.uuid
%}
```

## Event Streams (Audit Trail)

The module tracks changes via event streams:

```liquid
{% liquid
  graphql history = 'modules/insites_core/event_streams/get_histories', related_uuid: company.uuid
%}
```

Use for:
- Audit trail / compliance
- Change history display
- Activity feed generation

## External API Integration

### API Authentication

External API endpoints require the `instance_api_key`:

```bash
curl -H "Authorization: Bearer YOUR_INSTANCE_API_KEY" \
  https://your-instance.com/api/_external/contact-custom-fields
```

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/_external/company-custom-fields` | List company custom fields |
| POST | `/api/_external/company-custom-fields` | Create company custom field |
| DELETE | `/api/_external/company-custom-fields/:id` | Remove company custom field |
| GET | `/api/_external/contact-custom-fields` | List contact custom fields |
| POST | `/api/_external/contact-custom-fields` | Create contact custom field |
| DELETE | `/api/_external/contact-custom-fields/:id` | Remove contact custom field |

## Email Layouts

### Using module email layouts

The module provides two email layouts for different audiences:

```liquid
{% comment %} Internal email (to admins) {% endcomment %}
---
layout: modules/insites_core/internal_email_layout
---

{% comment %} External email (to customers) {% endcomment %}
---
layout: modules/insites_core/external_email_layout
---
```

Both layouts pull branding from the `insites_brand` configuration automatically.

## Saved Filters and Column Preferences

### Per-user column configuration

Admins can save their preferred column layouts:

```liquid
{% liquid
  graphql columns = 'modules/insites_core/columns/get_columns', administrator_uuid: admin_uuid, table: "companies"
%}
```

### Per-user saved filters

```liquid
{% liquid
  graphql filters = 'modules/insites_core/filters/get_company_filters', administrator_uuid: admin_uuid
%}
```

## Console Integration

The module integrates with the Insites Console for multi-instance management:

- `create_console_user` — provision console access
- `create_console_api_key` — generate API keys for console
- SSO via `console_sso_key` configuration

## See Also

- [README](./README.md)
- [API Reference](./api.md)
- [Configuration](./configuration.md)
