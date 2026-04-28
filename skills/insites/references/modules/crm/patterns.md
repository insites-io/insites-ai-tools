# Insites Core (CRM) - Common Patterns

## Querying Companies

### List companies with filtering

```liquid
{% liquid
  graphql companies = 'modules/insites_core/companies/get_companies', page: 1, size: 20, keyword: "Acme"
%}
```

### Filter by category

```liquid
{% liquid
  graphql companies = 'modules/insites_core/companies/get_companies', category_uuid: category_uuid, is_archived: false
%}
```

### Archived companies

```liquid
{% liquid
  graphql archived = 'modules/insites_core/companies/get_companies', is_archived: true
%}
```

## Querying Contacts

### List contacts

```liquid
{% liquid
  graphql contacts = 'modules/insites_core/contacts/get_contacts', page: 1, size: 20
%}
```

### Search contacts

```liquid
{% liquid
  graphql contacts = 'modules/insites_core/contacts/get_contacts', keyword: "john"
%}
```

## Working with Activities

### Create an activity

```liquid
{% liquid
  graphql result = 'modules/insites_core/crm_activities/add_crm_activity', type: "meeting", subject: "Client review", notes: "Quarterly review meeting", start_date_time: "2026-04-15T10:00:00Z", end_date_time: "2026-04-15T11:00:00Z", company_uuid: company.uuid
%}
```

### List activities for a company

```liquid
{% liquid
  graphql activities = 'modules/insites_core/crm_activities/get_crm_activities', related_uuid: company.uuid, related_type: "company"
%}
```

### Filter by activity type

```liquid
{% liquid
  graphql calls = 'modules/insites_core/crm_activities/get_crm_activities', type: "call", related_uuid: contact.uuid
%}
```

## Working with Tasks

### Get tasks for a contact

```liquid
{% liquid
  graphql tasks = 'modules/insites_core/tasks/get_tasks', related_uuid: contact.uuid, status: '["open"]'
%}
```

### Filter tasks by date range and assignee

```liquid
{% liquid
  graphql tasks = 'modules/insites_core/tasks/get_tasks', assignee: admin_uuid, due_date_from: "2026-04-01", due_date_to: "2026-04-30", status: '["open", "in_progress"]'
%}
```

### Get a single task with details

```liquid
{% liquid
  graphql task = 'modules/insites_core/tasks/get_task', uuid: task_uuid
%}
```

### Add a comment to a task

```liquid
{% liquid
  graphql comment = 'modules/insites_core/tasks/comments/add_task_comment', task_uuid: task_uuid, comment: "Updated the client", author_administrator_uuid: context.current_user.id
%}
```

## Working with Addresses

### Get addresses for a company

```liquid
{% liquid
  graphql addresses = 'modules/insites_core/addresses/get_addresses', related_uuid: company.uuid, related_type: "company"
%}
```

## Working with Documents

### Get documents for a contact

```liquid
{% liquid
  graphql docs = 'modules/insites_core/documents/get_documents', related_uuid: contact.uuid, related_type: "contact"
%}
```

## Working with Relationships

### Get relationships for a company

```liquid
{% liquid
  graphql rels = 'modules/insites_core/relationships/get_relationships', party_uuid: company.uuid
%}
```

## System Fields (Lookups)

### Get dropdown values

```liquid
{% liquid
  graphql industries = 'modules/insites_core/system_fields/get_system_fields', system_field: "industry"
  graphql categories = 'modules/insites_core/system_fields/get_system_fields', system_field: "contact_category"
  graphql lead_sources = 'modules/insites_core/system_fields/get_system_fields', system_field: "lead_source"
%}
```

## Webhooks

### Get webhooks for an event type

```liquid
{% liquid
  graphql hooks = 'modules/insites_core/webhooks/get_webhooks', event_type: "contact_created"
%}
```

### Webhook payload formats

| Format | Description |
|--------|-------------|
| `changes_only` | Only changed fields |
| `changes_with_snapshot` | Changes + full object |
| `full_object` | Complete object state |

## Authorization Pattern

### Protect a page with admin auth

```yaml
---
slug: admin/dashboard
authorization_policies:
  - modules/insites_core/insites_only_allowed_by_administrators
---
```

### Protect an API endpoint

```yaml
---
slug: api/contacts
authorization_policies:
  - modules/insites_core/has_valid_instance_api_authorization
---
```

## Pagination Pattern

All list queries support `$page` and `$size`:

```liquid
{% liquid
  assign page = context.params.page | default: 1 | plus: 0
  graphql companies = 'modules/insites_core/companies/get_companies', page: page, size: 20
%}

{% comment %} Access pagination info {% endcomment %}
{% liquid
  assign total_pages = companies.items.total_pages
  assign total_entries = companies.items.total_entries
%}
```

## See Also

- [README](./README.md)
- [API Reference](./api.md)
- [Configuration](./configuration.md)
