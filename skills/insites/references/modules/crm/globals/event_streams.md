# Globals — Event Streams

The event stream is an audit / activity feed of system actions — record creates, updates, deletes, and arbitrary application-defined events. Useful for activity timelines, audit trails, notifications.

**Full field reference:** `<your-insites-instance>/admin/api/globals/event-streams/overview`

For shared conventions, see [`../api.md`](../api.md).

---

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| `GET` | `/crm/api/v2/event-streams` | List events (paginated, filterable) |
| `POST` | `/crm/api/v2/event-streams` | Log a new event |

There is no read-by-id, update, or delete — events are append-only.

**Required params on create:** `type`, `subject`.

**Required params on list:** `page`, `per_page` (note: this resource uses `per_page`, not the `size` convention used elsewhere).

---

## List query parameters

In addition to `page` and `per_page`:

| Param | Notes |
|---|---|
| `start_date` | ISO 8601 — filter events on or after |
| `end_date` | ISO 8601 — filter events on or before |
| `administrator_uuid` | Filter to events by a specific admin |
| `description` | Substring search on event description |
| `module_source` | Filter by originating module |
| `module_feature` | Filter by feature within a module |
| `result_attributes` | Filter by attributes of the logged entity |

## Example — list recent events

```http
GET /crm/api/v2/event-streams?page=1&per_page=10&format=json HTTP/1.1
Authorization: instance_aB3xK9pQ7mN2vL8wR4tY1zE6cF5sJ0hG
```

```json
HTTP/1.1 200 OK
Content-Type: application/json

{
  "total_entries": 120,
  "total_pages": 12,
  "page": 1,
  "per_page": 10,
  "results": [
    {
      "uuid": "evt-uuid-a1b2c3d4e5",
      "description": "User **John Doe** updated company *Acme Corp* details.",
      "log": {
        "action": "update",
        "entity": "crm_company",
        "field_changed": "phone_number"
      },
      "details": "Company Update Phone number changed.",
      "font_icon": "fas fa-building",
      "font_icon_color": "#3498db",
      "datetime": 1678886400
    }
  ]
}
```

`description` and `details` accept Markdown-style emphasis (`**bold**`, `*italic*`) which is rendered in the IIA event-stream view.

`font_icon` and `font_icon_color` are display hints for the IIA timeline UI; populate them when the event is meant to be human-visible.

`datetime` is a Unix timestamp (seconds since epoch).

## Example — log an application event

```http
POST /crm/api/v2/event-streams?format=json HTTP/1.1
Authorization: instance_aB3xK9pQ7mN2vL8wR4tY1zE6cF5sJ0hG
Content-Type: application/json

{
  "type": "phone_change",
  "subject": "Company phone number updated",
  "description": "User **John Doe** updated company *Acme Corp* details.",
  "log": {
    "action": "update",
    "entity": "crm_company",
    "field_changed": "phone_number",
    "previous_value": "555-1234",
    "new_value": "555-5678"
  },
  "details": "Phone number for Acme Corp was changed by John Doe.",
  "font_icon": "fas fa-building",
  "font_icon_color": "#3498db"
}
```

```json
HTTP/1.1 201 Created
Content-Type: application/json

{ "uuid": "evt-uuid-a1b2c3d4e5" }
```

The create response is intentionally minimal — just the new event's UUID.

## Notes

- **List uses `per_page`, not `size`.** This is the only CRM v2 list endpoint that diverges from the standard `size` parameter; pass `per_page` here.
- Event stream is **append-only** — there is no edit or delete API. Plan log entries accordingly.
- The `log` object is free-form JSON; structure it to match what your downstream consumers expect.
