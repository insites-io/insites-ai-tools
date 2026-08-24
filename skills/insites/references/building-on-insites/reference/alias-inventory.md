# Alias inventory

Every controller alias on an instance with these modules installed, generated from
module source. **Check a name here before you call it.** An alias that does not exist
fails at render time with a partial-not-found error, and inventing plausible names is
the most common way a build is wasted.

**225 aliases** across 6 modules.

| Module | Aliases | Version |
|---|---|---|
| `module-ecommerce` | 95 | v5.11.0 |
| `module-crm` | 58 | v5.14.0 |
| `module-events` | 35 | v5.5.3 |
| `module-locator` | 23 | v5.2.0 |
| `module-data` | 7 | v5.6.2 |
| `module-assets` | 7 | v5.2.0 |

Modules that declare **no** aliases, so there is nothing to call in them:

`module-cms`, `module-forms`, `module-pipelines`, `module-permissions`, `module-api`, `module-general`, `module-ai`, `module-system-pages`

## Naming is not uniform

Most aliases contain the word `controller`. **The events aliases do not**, so a search
for `controller` undercounts the inventory by 35. Do not filter on it.

## module-ecommerce (95)

- `ecommerce/controller/cart/create`
- `ecommerce/controller/cart/delete`
- `ecommerce/controller/cart/get`
- `ecommerce/controller/cart/list`
- `ecommerce/controller/cart/update`
- `ecommerce/controller/category/create`
- `ecommerce/controller/category/delete`
- `ecommerce/controller/category/get`
- `ecommerce/controller/category/list`
- `ecommerce/controller/category/update`
- `ecommerce/controller/configuration/get`
- `ecommerce/controller/configuration/update`
- `ecommerce/controller/custom_field/delete`
- `ecommerce/controller/custom_field/list`
- `ecommerce/controller/discount/by_code`
- `ecommerce/controller/discount/create`
- `ecommerce/controller/discount/delete`
- `ecommerce/controller/discount/get`
- `ecommerce/controller/discount/list`
- `ecommerce/controller/discount/update`
- `ecommerce/controller/freight_supplier/create`
- `ecommerce/controller/freight_supplier/delete`
- `ecommerce/controller/freight_supplier/get`
- `ecommerce/controller/freight_supplier/list`
- `ecommerce/controller/freight_supplier/update`
- `ecommerce/controller/order/create`
- `ecommerce/controller/order/delete`
- `ecommerce/controller/order/get`
- `ecommerce/controller/order/list`
- `ecommerce/controller/order/update`
- `ecommerce/controller/order_discount/add_bulk`
- `ecommerce/controller/order_discount/create`
- `ecommerce/controller/order_discount/delete`
- `ecommerce/controller/order_discount/get`
- `ecommerce/controller/order_discount/list`
- `ecommerce/controller/order_discount/update`
- `ecommerce/controller/order_items/add_bulk`
- `ecommerce/controller/order_items/create`
- `ecommerce/controller/order_items/delete`
- `ecommerce/controller/order_items/get`
- `ecommerce/controller/order_items/list`
- `ecommerce/controller/order_items/update`
- `ecommerce/controller/order_shipping_packages/create`
- `ecommerce/controller/order_shipping_packages/delete`
- `ecommerce/controller/order_shipping_packages/get`
- `ecommerce/controller/order_shipping_packages/list`
- `ecommerce/controller/order_shipping_packages/update`
- `ecommerce/controller/payment/create`
- `ecommerce/controller/payment/delete`
- `ecommerce/controller/payment/get`
- `ecommerce/controller/payment/list`
- `ecommerce/controller/payment/update`
- `ecommerce/controller/product/create`
- `ecommerce/controller/product/delete`
- `ecommerce/controller/product/get`
- `ecommerce/controller/product/list`
- `ecommerce/controller/product/update`
- `ecommerce/controller/product_variant/create`
- `ecommerce/controller/product_variant/delete`
- `ecommerce/controller/product_variant/get`
- `ecommerce/controller/product_variant/list`
- `ecommerce/controller/product_variant/update`
- `ecommerce/controller/product_variant_options/create`
- `ecommerce/controller/product_variant_options/delete`
- `ecommerce/controller/product_variant_options/get`
- `ecommerce/controller/product_variant_options/list`
- `ecommerce/controller/product_variant_options/update`
- `ecommerce/controller/quote/create`
- `ecommerce/controller/quote/delete`
- `ecommerce/controller/quote/get`
- `ecommerce/controller/quote/list`
- `ecommerce/controller/quote/update`
- `ecommerce/controller/quote_discounts/create`
- `ecommerce/controller/quote_discounts/delete`
- `ecommerce/controller/quote_discounts/get`
- `ecommerce/controller/quote_discounts/list`
- `ecommerce/controller/quote_discounts/update`
- `ecommerce/controller/quote_items/add_bulk`
- `ecommerce/controller/quote_items/create`
- `ecommerce/controller/quote_items/delete`
- `ecommerce/controller/quote_items/get`
- `ecommerce/controller/quote_items/list`
- `ecommerce/controller/quote_items/update`
- `ecommerce/controller/quote_shipping_packages/create`
- `ecommerce/controller/quote_shipping_packages/delete`
- `ecommerce/controller/quote_shipping_packages/get`
- `ecommerce/controller/quote_shipping_packages/list`
- `ecommerce/controller/quote_shipping_packages/update`
- `ecommerce/controller/stripe/get`
- `ecommerce/controller/stripe/update`
- `ecommerce/controller/system_field/create`
- `ecommerce/controller/system_field/delete`
- `ecommerce/controller/system_field/get`
- `ecommerce/controller/system_field/list`
- `ecommerce/controller/system_field/update`

## module-crm (58)

- `crm/controller/activities/create`
- `crm/controller/activities/delete`
- `crm/controller/activities/get`
- `crm/controller/activities/list`
- `crm/controller/activities/update`
- `crm/controller/addresses/create`
- `crm/controller/addresses/delete`
- `crm/controller/addresses/get`
- `crm/controller/addresses/list`
- `crm/controller/addresses/update`
- `crm/controller/attachments/create`
- `crm/controller/attachments/credentials/get`
- `crm/controller/attachments/delete`
- `crm/controller/attachments/get`
- `crm/controller/attachments/list`
- `crm/controller/companies/archive`
- `crm/controller/companies/assign-contacts`
- `crm/controller/companies/create`
- `crm/controller/companies/delete`
- `crm/controller/companies/get`
- `crm/controller/companies/list`
- `crm/controller/companies/restore`
- `crm/controller/companies/update`
- `crm/controller/contact-profiles/assign`
- `crm/controller/contact-profiles/update-profile`
- `crm/controller/contacts/archive`
- `crm/controller/contacts/create`
- `crm/controller/contacts/delete`
- `crm/controller/contacts/get`
- `crm/controller/contacts/list`
- `crm/controller/contacts/restore`
- `crm/controller/contacts/update`
- `crm/controller/custom-fields/delete`
- `crm/controller/custom-fields/list`
- `crm/controller/event-streams/create`
- `crm/controller/event-streams/list`
- `crm/controller/google_maps/get`
- `crm/controller/relationships/create`
- `crm/controller/relationships/delete`
- `crm/controller/relationships/get`
- `crm/controller/relationships/list`
- `crm/controller/relationships/update`
- `crm/controller/system-fields/create`
- `crm/controller/system-fields/delete`
- `crm/controller/system-fields/get`
- `crm/controller/system-fields/list`
- `crm/controller/system-fields/update`
- `crm/controller/task-comments/create`
- `crm/controller/task-comments/get`
- `crm/controller/task-comments/list`
- `crm/controller/task-comments/update`
- `crm/controller/tasks/complete`
- `crm/controller/tasks/create`
- `crm/controller/tasks/delete`
- `crm/controller/tasks/get`
- `crm/controller/tasks/list`
- `crm/controller/tasks/open`
- `crm/controller/tasks/update`

## module-events (35)

- `events/event_expenses/create`
- `events/event_expenses/delete`
- `events/event_expenses/list`
- `events/event_expenses/update`
- `events/event_faqs/create`
- `events/event_faqs/delete`
- `events/event_faqs/list`
- `events/event_faqs/update`
- `events/event_speakers/create`
- `events/event_speakers/delete`
- `events/event_speakers/list`
- `events/event_speakers/update`
- `events/event_sponsors/create`
- `events/event_sponsors/delete`
- `events/event_sponsors/list`
- `events/event_sponsors/update`
- `events/event_tickets/assign_contact`
- `events/event_tickets/create`
- `events/event_tickets/delete`
- `events/event_tickets/list`
- `events/event_tickets/update`
- `events/events/create`
- `events/events/delete`
- `events/events/get`
- `events/events/list`
- `events/events/update`
- `events/events/update_event_status`
- `events/system_fields/create`
- `events/system_fields/delete`
- `events/system_fields/get_options`
- `events/system_fields/list`
- `events/system_fields/update`
- `events/system_fields/update_configuration`
- `events/venues/create`
- `events/venues/list`

## module-locator (23)

- `locator/controller/categories/create`
- `locator/controller/categories/delete`
- `locator/controller/categories/get`
- `locator/controller/categories/list`
- `locator/controller/categories/update`
- `locator/controller/custom_fields/delete`
- `locator/controller/custom_fields/get`
- `locator/controller/enquiries/create`
- `locator/controller/enquiries/delete`
- `locator/controller/enquiries/filters/get_filter_options`
- `locator/controller/enquiries/get`
- `locator/controller/enquiries/list`
- `locator/controller/enquiries/update`
- `locator/controller/locations/create`
- `locator/controller/locations/delete`
- `locator/controller/locations/get`
- `locator/controller/locations/list`
- `locator/controller/locations/update`
- `locator/controller/system_fields/create`
- `locator/controller/system_fields/delete`
- `locator/controller/system_fields/get`
- `locator/controller/system_fields/list`
- `locator/controller/system_fields/update`

## module-data (7)

- `databases/controller/database/items/add`
- `databases/controller/database/items/delete`
- `databases/controller/database/items/get`
- `databases/controller/database/items/list`
- `databases/controller/database/items/update`
- `databases/controller/databases/get`
- `databases/controller/databases/list`

## module-assets (7)

- `assets/controller/assets/archive`
- `assets/controller/assets/create`
- `assets/controller/assets/delete`
- `assets/controller/assets/get`
- `assets/controller/assets/list`
- `assets/controller/folders/create`
- `assets/controller/folders/delete`

---

Generated from module source. Counts are per installed module version, so they move
between releases: regenerate rather than trusting a copied figure.
