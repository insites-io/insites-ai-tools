# CMS Module

The Insites CMS module manages **file-based** content — pages, layouts, partials, web files, global content, collections, emails, SMS templates, and authorization policies. They live as files in the project tree and are administered through IIA, the platform CLI, or direct file edits.

## Where to look

| If you're… | Read |
|---|---|
| Looking up the metadata / front-matter shape of a CMS object type | [`metadata.md`](metadata.md) |
| Configuring CMS object types in IIA (paths, tabs, settings) | [`configuration.md`](configuration.md) |
| Consuming CMS content from Liquid (rendering layouts, including partials, fetching globals) | [`patterns.md`](patterns.md) |
| Hitting an edge or unexpected behavior | [`gotchas.md`](gotchas.md) |
| Customizing or extending CMS — overrides, inheritance, hooks | [`advanced.md`](advanced.md) |

## File-based, not API-based

Unlike the CRM and data modules, **CMS does not expose a V2 REST API**. CMS objects are files in the project tree, edited through:

1. **IIA admin UI** — the primary path for non-developers and most administration
2. **Platform CLI file sync** — for developers maintaining the project as a git repo
3. **Direct file commits** — same as #2, just from your editor

There is no `api.md` for this module — its closest equivalent is [`metadata.md`](metadata.md), the field-by-field reference for the file front-matter that drives behavior.

## Object types

Ten object types live under the CMS module. The object catalog:

| Object | Purpose |
|---|---|
| **Pages** | URL-addressable controllers — fetch data and delegate rendering to partials. |
| **Layouts** | Wrapper templates for pages and emails (HTML scaffold, navigation, footer). |
| **Partials** | Reusable template snippets — the only place HTML/CSS/JS live in views. |
| **Web Files** | Static assets served at fixed URLs (`.js`, `.css`, `.html`, fonts). |
| **File Explorer** | Browse and manage the entire project file tree. |
| **Global Content** | A single shared record with company-wide settings (logo, locations, social links). |
| **Collections** | Data-backed listing views with separate list and details layouts. |
| **Emails** | Email templates — recipient, subject, body, layout. |
| **SMS** | SMS templates — recipient and body. |
| **Authorization Policies** | Files defining single yes/no access rules referenced by pages. |

## Layout map

```
modules/cms/
├── README.md            ← you are here
├── metadata.md          ← front-matter / file-format reference per object type (replaces api.md for this module)
├── configuration.md     ← IIA admin walkthrough per object type
├── patterns.md          ← Liquid-side consumption examples
├── gotchas.md           ← edges and quirks
└── advanced.md          ← overrides, inheritance, hooks
```

## Cross-module ties, in one sentence

CMS-managed email layouts (`external_email_layout`, `internal_email_layout`) are the standard wrappers other modules use for outbound mail — see [`../crm/advanced.md`](../crm/advanced.md) for the override pattern.
