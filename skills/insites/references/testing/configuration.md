# Testing Configuration Reference

## Prerequisites

### 1. Install the Tests Module

```bash
insites-cli modules install tests
insites-cli deploy staging
```

### 2. Verify Installation

```bash
insites-cli modules list staging
```

The `test` module should appear in the list.

## Test File Location and Structure

### Test Directory

All tests go in `app/lib/test/`:

```
app/lib/test/
├── commands/
│   ├── users/
│   │   ├── create_test.liquid
│   │   └── update_test.liquid
│   └── products/
│       └── create_test.liquid
├── queries/
│   └── users/
│       └── find_test.liquid
└── helpers/
    └── format_price_test.liquid
```

### Test File Naming

Files **must** end with `_test.liquid`:

```bash
# Valid
create_test.liquid
user_login_test.liquid

# Invalid — will not be discovered
create_tests.liquid
test_create.liquid
create.liquid
```

### Module Tests

When building a module, place tests in the private directory:

```
modules/<module_name>/private/lib/test/
```

## Test File Structure

Every test file follows the contract pattern:

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'

  # Setup: create test data
  assign data = '{ "email": "test@example.com" }' | parse_json
  function result = 'commands/users/create', object: data

  # Assert: verify results
  function contract = 'modules/tests/assertions/valid_object', contract: contract, object: result, field_name: 'user'

  # Return contract (mandatory)
  return contract
%}
```

## Test Environments

### Supported Environments

Tests can only run on:
- Development (`dev`)
- Staging (`staging`)

**Never run tests in production.** The test runner only operates on staging/development environments.

## Running Tests

### Deploy First (Required)

```bash
insites-cli deploy staging
```

### Run All Tests

```bash
insites-cli test run staging
```

### Run Specific Test

```bash
insites-cli test run staging -n test/commands/users/create_test
```

### Browser Access

| Endpoint | Purpose |
|----------|---------|
| `/_tests` | List all test files |
| `/_tests/run` | Run all tests (HTML) |
| `/_tests/run.js` | Run all tests (JSON) |

## See Also

- [Testing API Reference](./api.md)
- [Testing Patterns](./patterns.md)
- [Testing Gotchas](./gotchas.md)
