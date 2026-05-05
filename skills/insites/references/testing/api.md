# Testing API Reference

## Test Execution

> **Status note:** A CLI test runner (`insites-cli test run`) is **not yet shipped**. Tests are written as `_test.liquid` files using the Contract & Assertion API documented below, and executed today via the **browser-based endpoints**. When the CLI runner ships, this section will be expanded; for now use the browser endpoints.

### Browser-Based Testing

| Endpoint | Purpose |
|----------|---------|
| `/_tests` | List all available test files |
| `/_tests.js` | List tests as JSON |
| `/_tests/run` | Execute all tests (HTML output) |
| `/_tests/run.js` | Execute all tests (JSON output) |
| `/_tests/run?name=test/user_test` | Run specific test |
| `/_tests/run.js?name=test/user_test` | Run specific test (JSON) |

### Async Test Execution

For long-running test suites:

```
GET /_tests/run_async
```

Monitor via logs:

```bash
insites-cli logsv2 staging
```

## Contract & Assertion API

### Contract Initialization

Every test must start with:

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'
%}
```

### Assertions

All assertions follow the same pattern — they accept `contract` and return an updated `contract`.

#### equal

Compare two values for exact equivalence:

```liquid
{% liquid
  function contract = 'modules/tests/assertions/equal',
    contract: contract,
    expected: "hello",
    given: actual_value,
    field_name: 'greeting'
%}
```

#### blank

Field must be absent, null, or empty string:

```liquid
{% liquid
  function contract = 'modules/tests/assertions/blank',
    contract: contract,
    object: user,
    field_name: 'deleted_at'
%}
```

#### presence

Field must exist and have a non-null value:

```liquid
{% liquid
  function contract = 'modules/tests/assertions/presence',
    contract: contract,
    object: user,
    field_name: 'id'
%}
```

#### not_presence

Field must be null or absent:

```liquid
{% liquid
  function contract = 'modules/tests/assertions/not_presence',
    contract: contract,
    object: response,
    field_name: 'error'
%}
```

#### valid_object

Object has `valid: true`:

```liquid
{% liquid
  function contract = 'modules/tests/assertions/valid_object',
    contract: contract,
    object: result,
    field_name: 'user_creation'
%}
```

#### not_valid_object

Object does not have `valid: true` (validation failed as expected):

```liquid
{% liquid
  function contract = 'modules/tests/assertions/not_valid_object',
    contract: contract,
    object: result,
    field_name: 'invalid_user_rejected'
%}
```

#### object_contains_object

Object contains a specific key-value subset:

```liquid
{% liquid
  assign expected_subset = '{ "status": "success" }' | parse_json
  function contract = 'modules/tests/assertions/object_contains_object',
    contract: contract,
    object: response,
    subset: expected_subset,
    field_name: 'response_status'
%}
```

#### true / not_true

Evaluate boolean conditions:

```liquid
{% liquid
  function contract = 'modules/tests/assertions/true',
    contract: contract,
    object: user,
    field_name: 'is_admin'

  function contract = 'modules/tests/assertions/not_true',
    contract: contract,
    object: user,
    field_name: 'deleted'
%}
```

### Custom Error Registration

When built-in assertions are insufficient:

```liquid
{% liquid
  assign length = value | size
  if length < 5
    function contract = 'modules/tests/helpers/register_error',
      contract: contract,
      field_name: 'string_length',
      message: 'String must be at least 5 characters'
  endif
%}
```

### Contract Return

Every test must end with:

```liquid
{% liquid
  return contract
%}
```

## Email Testing

### Sent Emails Endpoint

| Endpoint | Purpose |
|----------|---------|
| `/_tests/sent_mails` | Paginated list of emails sent during tests |
| `/_tests/sent_mails/:id` | Full details of a specific email |

## See Also

- [Testing Configuration](./configuration.md)
- [Testing Patterns](./patterns.md)
- [Testing Troubleshooting](./gotchas.md)
