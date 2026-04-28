# Insites Core (CRM) - Configuration

## Installation

```bash
insites-cli modules install insites_core
insites-cli deploy staging
```

## Instance Configuration

The module stores configuration in the `instance_configuration` table:

| Key | Description |
|-----|-------------|
| `instance_api_key` | API key for instance-level access |
| `event_stream_api_key` | API key for event streaming |
| `console_sso_key` | Console single sign-on key |

These are managed via GraphQL mutations:
- `update_instance_configuration`
- `delete_instance_configuration`

Query with:
- `get_instance_configuration(name: "instance_api_key")`

## Branding Configuration

The `insites_brand` schema controls white-label appearance:

| Field | Description |
|-------|-------------|
| `branding_name` | Brand display name |
| `branding_tagline` | Brand tagline |
| `branding_url` | Brand website URL |
| `branding_email` | Brand contact email |
| `branding_phone` / `branding_country_code` | Brand phone number |
| `primary_color` / `secondary_color` | Theme colors |
| `logo` / `logo_alternative` | Brand logos |
| `icon` / `icon_alternative` | Brand icons |
| `email_name` / `email_from` | Email sender info |
| `email_header_image` / `email_footer_image` | Email template images |
| `button_color` / `text_color` | Email button/text colors |
| `enable_support` | Show support link (boolean) |
| `support_url` | Support page URL |
| `welcome_heading` / `welcome_subheading` | Welcome screen text |

## Localisation Settings

The `localisation` schema:

| Field | Description | Example |
|-------|-------------|---------|
| `date_format` | Date display format | `DD/MM/YYYY` |
| `time_format` | Time display format | `HH:mm` |
| `instance_time_zone` | Timezone identifier | `Europe/London` |

## System Fields (Lookup Values)

System fields power dropdown menus. Populate them via the `crm_system_field` table:

| system_field | Used for |
|--------------|----------|
| `contact_category` | Contact category dropdown |
| `contact_type` | Contact type dropdown |
| `company_category` | Company category dropdown |
| `company_type` | Company type dropdown |
| `industry` | Industry dropdown |
| `lead_source` | Lead source dropdown |
| `nationality` | Nationality dropdown |
| `prefix` | Name prefix dropdown (Mr, Mrs, etc.) |

## Authorization Policies

The module ships with authorization policies that gate admin access:

- **`insites_only_allowed_by_administrators`** — Requires active admin + 2FA verification or SSO. Redirects to `/admin/401`.
- **`insites_only_allowed_if_logged_in`** — Basic login requirement.
- **`has_valid_instance_api_authorization`** — Validates `Authorization` header against `instance_api_key`. Redirects to `/api/401`.

Use in page frontmatter:

```yaml
---
authorization_policies:
  - modules/insites_core/insites_only_allowed_by_administrators
---
```

## Migrations

The module includes 18 migrations that run on install. Key migrations:

| Migration | Description |
|-----------|-------------|
| `add_custom_field_schema` | Creates `crm_contact_custom_field` and `crm_company_custom_field` tables |
| `add_insites_core_public_views` | Sets up public partials and layouts |
| `add_insites_core_sitemap` | Configures sitemap |
| `add_version_control_configuration` | Initializes version control |

## Directory Structure

```
modules/insites_core/
├── private/
│   ├── schema/                       # 21 data model definitions
│   │   ├── crm/                      # CRM tables (company, contact, address, etc.)
│   │   ├── _globals/                 # Shared tables (task, activity, attachment)
│   │   ├── settings/                 # Config tables (localisation, redirect)
│   │   └── _console/                 # Console tables
│   ├── graphql/                      # 477 GraphQL files
│   │   ├── companies/                # Company queries
│   │   ├── contacts/                 # Contact queries
│   │   ├── crm_activities/           # Activity queries
│   │   ├── tasks/                    # Task queries & mutations
│   │   └── ...
│   ├── forms/                        # 13 form definitions
│   ├── authorization_policies/       # 11 access control policies
│   ├── migrations/                   # 18 schema migrations
│   ├── api_calls/                    # External API integrations
│   └── views/                        # Pages, partials, assets
└── public/
    └── views/
        ├── layouts/                  # Email layouts
        └── partials/lib/hooks/       # Public hook (module info)
```

## See Also

- [README](./README.md)
- [API Reference](./api.md)
- [Gotchas](./gotchas.md)
