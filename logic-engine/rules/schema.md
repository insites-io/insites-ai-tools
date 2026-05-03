# Rules — Schema

Rules that apply to schema definitions and the GraphQL property-access functions used to read them.

---

```yaml
---
id: schema-property-functions
applies_to: [graphql]
severity: error
evidence: real-project
evidence_source: "100% compliance across 30+ GraphQL files. property(), property_int(), property_float(), property_boolean(), property_array(), property_upload() used universally."
audit_ref: audit/v0-conflicts-batch3.md#rule-r-25
---
```

**Rule:** Access schema properties in GraphQL via the typed property functions:

| Function | For property type |
|---|---|
| `property(name: "...")` | string (default) |
| `property_int(name: "...")` | integer |
| `property_float(name: "...")` | float / decimal |
| `property_boolean(name: "...")` | boolean |
| `property_array(name: "...")` | array |
| `property_upload(name: "...")` | file upload |
| `property_upload_presigned_url(name: "...")` | presigned upload URL |

**Why:** The platform stores all properties as strings under the hood. The typed accessor functions cast to the correct runtime type and surface errors when a property is misused (e.g. requesting `property_int` for a string property fails clearly, instead of silently returning a string with surprising behaviour downstream).

**How to apply:**
```graphql
results {
  id
  email: property(name: "email")
  age: property_int(name: "age")
  is_active: property_boolean(name: "is_active")
  tags: property_array(name: "tags")
  avatar: property_upload(name: "avatar")
}
```

**Verified by:**
- `app-portal/modules/portal/public/graphql/credit_cards/get_selected_credit_card.graphql` — `property()` and `property_boolean()`
- `app-portal/modules/portal/public/graphql/clients/get_discount_by_code.graphql` — `property_int()` for usage_count, usage_limit
- `app-portal/modules/portal/public/graphql/uploads/get_s3_upload.graphql` — `property_upload_presigned_url()`
