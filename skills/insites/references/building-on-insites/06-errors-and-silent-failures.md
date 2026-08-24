# Errors and silent failures

**Nothing here raises.** Every convention you know from other languages, where a failed
call throws or returns null, does not apply. A controller returns a hash whether it
succeeded or not, and the difference is a key inside it.

## Errors arrive in the return value

```liquid
{%- function contacts = "crm/controller/contacts/list", params: query -%}

{%- if contacts.errors -%}
  {%- log contacts.errors, type: 'team/contacts' -%}
  <p>Contacts are unavailable right now.</p>
{%- else -%}
  {%- for contact in contacts.results -%}
    ...
  {%- endfor -%}
{%- endif -%}
```

- On success you get `results`, `total_entries`, `total_pages`, `page`, `size`.
- On failure you get an `errors` array **and no `results`**.

**Branch on `errors` before you touch `results`, every time.** A page that skips the
check renders an empty list during a total outage, which reads to a user as "we have no
contacts" rather than "this is broken", and reads to your monitoring as a healthy page.

## There is no 5xx to watch for

The failure status on these routes is **400**. There is no 500 and no 422. An integrator
watching for 5xx sees a clean service throughout an outage.

## The silent failures

Every one of these returns data, a 200, and no error. This is the reason to read a
controller's reference rather than guess its arguments.

| What you write | What happens |
|---|---|
| **No `keyword`** | No filter is applied. You get **every record in the table**, ten at a time, on a page that looks like it is working |
| **A dotted `search_by`**, such as `"company.name"` | The dotted form is detected and **discarded**. The filter becomes empty, so again you get everything |
| **A `sort_by` outside the sortable fields** | **No sort at all.** Not an error, and not a fallback to the default |
| **`exact: true`** as a Liquid boolean | The controller compares against the string `"true"`. A boolean does nothing, and matching stays *contains* rather than *equals* |
| **`{% include %}` instead of `{% function %}`** | The return value is discarded and the controller's output is printed into your page. On some controllers it also sets your response `Content-Type` and status |

**The first two are the dangerous ones.** They turn a filtered list into a full table
dump. In development against a dozen test records that looks identical to working code; in
production it is a data exposure that no test catches, because the page renders.

## How to protect yourself

1. **Never ship a list page without asserting the filter took effect.** If you asked for
   one company's contacts, check that every row returned belongs to that company, and fail
   loudly if not.
2. **Build the argument hash explicitly**, rather than passing `context.params` straight
   through, whenever a missing argument would widen the result set instead of narrowing it.
3. **Test with more records than fit on one page.** Every one of the failures above looks
   correct on page one of a small dataset.
4. **Read the controller's reference for its sortable fields**, because an invalid
   `sort_by` fails silently and an unsorted list looks merely arbitrary rather than broken.

See [`crm/controller/contacts/list`](reference/crm-contacts-list.md) for a worked example
of all of this on a real controller.
