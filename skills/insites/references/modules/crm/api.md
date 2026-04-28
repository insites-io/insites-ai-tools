# Insites Core (CRM) - API Reference

## GraphQL Queries

### Companies

#### get_companies

List/search companies with pagination and filtering.

```graphql
query get_companies(
  $page: Int = 1
  $size: Int = 10
  $keyword: String
  $is_archived: Boolean
  $category_uuid: String
  $industry_uuid: String
  $type_uuid: String
  $sort: String
)
```

**Returns:** `total_entries`, `total_pages`, results with `company_name`, `website`, `company_avatar` (with URL), category, type, industry, timestamps.

### Contacts

#### get_contacts

List/search contacts with pagination.

```graphql
query get_contacts(
  $page: Int
  $size: Int
  $keyword: String
  $sort: String
  $profiles: ProfileFilterInput
)
```

**Returns:** user `id`, `email`, `first_name`, `last_name`, `name`, `uuid`, nested contact profile with category & type.

### Activities

#### get_crm_activities

List activities with filtering by type and related entity.

```graphql
query get_crm_activities(
  $page: Int
  $size: Int
  $uuid: String
  $type: String
  $related_uuid: String
  $related_type: String
)
```

**Returns:** activities with creator info, related contacts, related administrators, timestamps.

### Tasks

#### get_tasks

List tasks with filtering and sorting.

```graphql
query get_tasks(
  $page: Int
  $size: Int
  $keyword: String
  $related_uuid: String
  $assignee: String
  $due_date_from: String
  $due_date_to: String
  $status: [String]
  $sort: String
)
```

**Returns:** `task_name`, `due_date`, `status`, `completed_by_datetime`, assignee info, timestamps.

#### get_task

Single task with related entities.

```graphql
query get_task(
  $page: Int
  $size: Int
  $uuid: String
)
```

**Returns:** Full task detail including related company, contact, assignee, completed_by user.

#### get_task_comments

Comments on a task.

```graphql
query get_task_comments($task_uuid: String)
```

### Other Queries

| Query | Description |
|-------|-------------|
| `get_addresses` | Addresses for a related entity |
| `get_documents` | Documents for a related entity |
| `get_relationships` | Relationships for a party |
| `get_custom_fields` | Custom field values for a contact/company |
| `get_system_fields` | Lookup values by system_field type |
| `get_administrators` | List admin users |
| `get_columns` | User's saved column preferences |
| `get_filters` | User's saved filters |
| `get_webhooks` | Webhook configs by event_type |
| `get_localisation` | Date/time format and timezone settings |
| `get_module_records_count` | Statistics on module records |

## GraphQL Mutations

### Activities

| Mutation | Description |
|----------|-------------|
| `add_crm_activity` | Create activity (type, subject, attendees, notes, dates, attachments) |
| `update_crm_activity` | Update activity properties |
| `delete_crm_activity` | Delete activity |

### Tasks

| Mutation | Description |
|----------|-------------|
| `update_task_status` | Update task status |
| `delete_task` | Delete task |

### Task Comments

| Mutation | Description |
|----------|-------------|
| `add_task_comment` | Add comment to task |
| `update_task_comment` | Update comment |
| `add_attachment` | Add attachment to comment |

### Webhooks

| Mutation | Description |
|----------|-------------|
| `create_webhook` | Register a webhook |
| `update_webhook` | Update webhook config |
| `delete_webhook` | Remove webhook |

### Console/Admin

| Mutation | Description |
|----------|-------------|
| `create_console_user` | Create admin console user |
| `create_console_api_key` | Generate API key |
| `update_console_api_key` | Update API key |
| `delete_console_users` | Remove console users |

## Forms (Command Pattern)

Forms use YAML frontmatter for resource definition + validation, with `callback_actions` for post-submission logic.

### Authentication Forms

| Form | Resource | Description |
|------|----------|-------------|
| `login` | Session | Admin login with 2FA support |
| `logout` | Session | Clear session |
| `recover_password` | reset_password | Password recovery email flow |
| `reset_password` | User | Token-based password reset |
| `lock_admin` | Session | Lock admin account |
| `unlock_admin` | Session | Unlock admin account |

### Admin Forms

| Form | Resource | Description |
|------|----------|-------------|
| `set_administrator` | User | Set up administrator accounts |
| `new_administrator_token` | User | Generate auth tokens |
| `create_profile` | User | Create user profiles |

### Utility Forms

| Form | Resource | Description |
|------|----------|-------------|
| `add_redirect` | redirect | Create URL redirect |
| `edit_redirect` | redirect | Update URL redirect |
| `attachments` | attachment | File upload handling |

## External API Endpoints

RESTful endpoints at `/api/_external/`:

| Endpoint | Methods | Description |
|----------|---------|-------------|
| Company Custom Fields | GET, POST, DELETE | Manage company custom field definitions |
| Contact Custom Fields | GET, POST, DELETE | Manage contact custom field definitions |

## Public API

### hook_module_info

Returns module metadata:

```liquid
{% liquid
  function info = 'modules/insites_core/lib/hooks/hook_module_info'
%}
```

Returns: `name`, `machine_name`, `type`, `version`, `slug`, `label`, `updated_at`.

### Email Layouts

| Layout | Path | Purpose |
|--------|------|---------|
| Internal | `modules/insites_core/internal_email_layout` | Admin/internal emails |
| External | `modules/insites_core/external_email_layout` | Customer-facing emails |

## Authorization Policies

| Policy | Description |
|--------|-------------|
| `insites_only_allowed_by_administrators` | Active admin + 2FA or SSO required |
| `insites_only_allowed_if_logged_in` | Basic login check |
| `has_valid_instance_api_authorization` | HTTP Authorization header vs instance_api_key |
| `has_valid_console_sso_key` | Console SSO validation |
| `has_valid_http_authorization` | HTTP header auth |
| `insites_only_allowed_if_2fa_is_setup` | 2FA configured check |
| `insites_only_allowed_if_2fa_is_not_setup` | 2FA not yet configured check |
| `insites_token_is_valid` | Token validation |

## See Also

- [README](./README.md)
- [Configuration](./configuration.md)
- [Patterns](./patterns.md)
