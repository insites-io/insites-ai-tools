# Controller contract — front-matter specification

Every controller partial carries a machine-readable contract in its front matter. The
contract is the **single source of truth** for what the controller accepts, returns and
does on bad input. Generated documentation (the instance's `/admin/api` Controller tab and
`.md` output) renders from it; a drift check compares it against the code.

The worked example this spec was proven against is
[`crm/controller/contacts/list`](crm-contacts-list.md).

## Carrier

The contract lives under `metadata:` in the controller partial's front matter, beside the
existing `path:` alias. Partial `metadata` is deploy-safe (the sitemap partials in
`insites_core` already use it) and queryable:

```graphql
{
  admin_liquid_partials(
    per_page: 200
    filter: { metadata: [{ attribute: { key: "kind", value: "controller" } }] }
  ) {
    results { physical_file_path metadata }
  }
}
```

Two keys sit flat at the top of `metadata` so discovery filters can target them; the rest
nests under `contract`:

```yaml
---
  path: crm/controller/contacts/list
  metadata:
    kind: controller
    alias: crm/controller/contacts/list
    contract:
      module: module-crm
      stability: stable            # stable | beta | deprecated
      safe_in_function: true       # false when the response handler is ungated or there is no {% return %}
      http_twin: GET /crm/api/v2/contacts
      summary: Returns a page of CRM contacts with relations and custom fields inflated.
      params:
        - name: page
          type: integer
          default: 1
          description: 1-indexed page number.
      returns:
        - name: total_entries
          type: integer
          notes: Total matching records, not the page size.
      errors:
        - condition: <what makes it fail>
          response: <errors array shape; status when format=json>
      silent_failures:
        - input: <what you write>
          behavior: <what actually happens, incl. data-exposure notes>
---
```

## Field semantics

| Field | Rule |
|---|---|
| `kind` | Literal `controller`. Flat, for the discovery filter. |
| `alias` | Must equal the partial's `path:` value. Flat, so a doc page can filter for one alias. |
| `module` | Repo name (`module-crm`, `module-data`, …). |
| `stability` | `stable`, `beta`, or `deprecated`. |
| `safe_in_function` | `true` only when the controller both returns a value and gates its response handler. The two module-data write controllers with no `{% return %}` are `false`. |
| `http_twin` | The REST endpoint that wraps this controller, `METHOD /path` form, omitted when none exists. |
| `params` | One entry per key the controller reads (from `params.*` or named arguments). Every entry states type, default, and meaning. Named arguments (e.g. `uuid` passed beside `params`) are listed with `argument: true`. |
| `returns` | One entry per top-level key of the return hash. |
| `errors` | Conditions that populate `errors` in the return value; note there is no 5xx — the failure status on the HTTP twin is 400. |
| `silent_failures` | Inputs that return 200 with plausible-but-wrong data. This table is the most valuable part of the contract — do not leave it empty if the controller has list semantics (missing keyword, dotted search_by, invalid sort_by). |

`module_version`, `last_updated` and `canonical_url` from the original proposal are
deliberately **not** stored per-partial: the version is the installed module's version
(already known to the instance), staleness is the drift check's job, and the canonical URL
is derivable from the alias. Storing them per-file guarantees they rot.

## Authoring rules

- Facts come from reading the controller source and its calling endpoint page, not from
  the HTTP docs. Where they disagree, the source wins and the discrepancy is worth a task.
- Defaults are what the code applies (`| default:` filters), not what feels sensible.
- A param compared against a string (e.g. `exact` vs `"true"`) is documented as type
  `string` with the comparison spelled out in `description`.
- If the controller's response handler is ungated (fires regardless of `?format=json`),
  say so in `silent_failures` and set `safe_in_function: false`.

## Rendering

The module-api docs renderer resolves the contract by alias via `admin_liquid_partials`
and renders it as the Controller tab (HTML) and contract tables in the `.md` twin:
arguments, returns, errors, silent failures — same section order as
[crm-contacts-list.md](crm-contacts-list.md).

## Drift checks (CI, proposed)

- Contract coverage: % of aliases whose metadata carries a complete contract (target 100%).
- Reference integrity: every alias in generated docs resolves to a partial declaring it.
- Drift: every `params.*` key read in the source appears in `contract.params`, and vice versa.
- Alias equality: `metadata.alias` equals `path:` in the same file.
