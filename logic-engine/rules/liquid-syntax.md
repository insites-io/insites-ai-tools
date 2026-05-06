# Rules — Liquid syntax

Rules about Liquid block formatting, tag usage, and template structure.

---

```yaml
---
id: liquid-blocks-line-wrapping
applies_to: [page, partial, command, policy]
severity: info
evidence: skill-only
evidence_source: "All 81 inspected liquid blocks comply. No violations and no enforcement found, but the convention is universally observed."
audit_ref: audit/v0-conflicts-batch3.md#rule-r-19
---
```

**Rule:** Inside `{% liquid %}...{% endliquid %}` blocks, each statement MUST occupy a single complete line. Do not wrap multi-line statements (e.g. long filter chains, long function calls) inside a `{% liquid %}` block.

**Why:** The `{% liquid %}` block parser is line-oriented — each line is a separate statement. A statement that wraps onto a second line breaks the parse. If you need a multi-line expression, either split into multiple `{% liquid %}` blocks, use `{% capture %}` outside the block, or use individual `{% assign %}` / `{% echo %}` tags.

**How to apply:**

✅ **Correct:**
```liquid
{% liquid
  assign user_id = context.current_user.id
  assign user_email = context.current_user.email
  graphql user = 'crm/get_user', id: user_id
  if user.client == blank
    echo false
    return
  endif
  echo true
%}
```

❌ **Wrong (statement wraps):**
```liquid
{% liquid
  assign user = context.current_user
                | dig: 'profile'
                | first
%}
```

For long expressions, break out:
```liquid
{% capture user %}
  {{- context.current_user
    | dig: 'profile'
    | first -}}
{% endcapture %}
{% liquid
  assign user_processed = user
%}
```

**Verified by:** `app-seedling/modules/dashboard/public/authorization_policies/allow_2fa_verification.liquid:9-31` — well-formed `{% liquid %}` block, each statement on its own line.
