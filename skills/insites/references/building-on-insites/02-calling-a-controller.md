# Calling a controller

A controller is a piece of logic a module already ships. Calling one is how you get real
data onto a page without an HTTP request, an API key or a rate limit.

## The call

```liquid
{%- function contacts = "crm/controller/contacts/list", params: context.params -%}
{{ contacts.total_entries }}
```

`{% function %}` binds the controller's return value to a variable. That is the whole
mechanism.

## An alias is not a file path

`crm/controller/contacts/list` appears **nowhere in module source as a string**. Searching
for it finds nothing, which makes it look like the documentation is wrong. It is not: the
alias is declared in the `path:` front matter of the partial that implements it.

```liquid
---
  path: crm/controller/contacts/list
---
```

The alias is the stable name. The file behind it moves between module versions; the alias
does not. **Always call the alias, never the file path.** Passing the path works for some
partials today and is not a supported call.

## `{% function %}` against `{% include %}`

They look interchangeable. They are not, and the difference can break your page's HTTP
response.

| | `{% function %}` | `{% include %}` |
|---|---|---|
| The return value | Bound to your variable | **Discarded** |
| The controller's text output | Discarded | **Printed into your page** |
| Can it set your page's status and `Content-Type`? | No | **Yes, on some controllers** |

**Use `{% function %}` for every controller call.** `{% include %}` is for your own
presentational partials.

## Why `{% include %}` can hijack your page

Every controller ends by returning its data. Most also call a shared response handler,
which sets the HTTP status and `Content-Type` on the response, and **whether that is
gated differs by module.**

The CRM controllers gate it on a query parameter:

```liquid
{%- if context.params.format == 'json' -%}
  {%- include "modules/insites_core/functions/response_handler",
      data: data, status: status -%}
{%- endif -%}

{% return data %}
```

So a CRM controller only touches your response if the request carried `?format=json`.
All 58 CRM controllers do this, and all 58 return a value.

**The data module controllers do not gate it at all.** Verified in module-data on
13 August 2026:

| Alias | Returns a value | Response handler |
|---|---|---|
| `databases/controller/databases/list` | yes | **ungated** |
| `databases/controller/databases/get` | yes | **ungated** |
| `databases/controller/database/items/list` | yes | **ungated** |
| `databases/controller/database/items/get` | yes | **ungated** |
| `databases/controller/database/items/delete` | yes | **ungated** |
| `databases/controller/database/items/add` | **no `{% return %}` at all** | **ungated** |
| `databases/controller/database/items/update` | **no `{% return %}` at all** | **ungated** |

Two consequences, and both look like your own bug:

1. **`items/add` and `items/update` return nothing.** Your variable is blank even when the
   write succeeded. Do not test success by checking the return value; re-read the record.
2. **All seven set your page's `Content-Type` and status** whatever the request looked
   like. Call one from a page that renders HTML and the response headers stop matching the
   body.

**So learning the calling convention from a CRM example and applying it to a data
controller does not work.** Check the module before you assume a controller behaves like
the last one you called.

## The `?format=json` trap on an HTML page

Because the CRM gate reads `context.params.format`, which is a **query parameter and not
your page's front matter**, anyone can append `?format=json` to your HTML page's URL. If
that page calls a CRM controller, the response handler fires mid-render and sets a JSON
`Content-Type` on a response whose body is your HTML.

If your page must not do that, do not pass `context.params` straight through. Build the
argument hash explicitly and leave `format` out of it:

```liquid
{%- parse_json query -%}
  {
    "page":    {{ context.params.page | default: 1 | plus: 0 }},
    "size":    25,
    "keyword": {{ context.params.q | default: '' | json }}
  }
{%- endparse_json -%}
{%- function contacts = "crm/controller/contacts/list", params: query -%}
```

Passing `context.params` through is the common case and it is fine for a page that is
meant to serve both HTML and JSON. It is a trap only when it is not.

## Finding the alias you need

Check the [alias inventory](reference/alias-inventory.md). **A call to an alias that does
not exist fails at render time** with a partial-not-found error, and inventing plausible
names is the single most common way an agent wastes a build.

225 aliases exist. Naming is not uniform: the CRM, ecommerce, locator, data and assets
aliases contain the word `controller`, and the 35 events aliases do not.

---

For the deep in-Liquid reference — argument passing per controller, auth context, worked page examples — see [calling-from-liquid](../api/calling-from-liquid.md).
