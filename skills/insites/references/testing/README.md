# Testing

Insites testing uses the tests module (`pos-module-tests`). Tests run in staging/development only.

## Setup

```bash
insites-cli modules install tests
insites-cli deploy staging
```

## Test Location

`app/lib/test/` — files must end with `_test.liquid`.

> **Module path:** When building a module, use `modules/<module_name>/private/lib/test/` for test files. Tests are always private to the module.

## Writing Tests

Every test must initialize a contract, pass it through assertions, and return it.

```liquid
{% comment %} app/lib/test/products/create_test.liquid {% endcomment %}
{% liquid
  function contract = 'modules/tests/helpers/init'

  assign data = '{ "title": "Test Product", "price": "19.99" }' | parse_json
  function result = 'commands/products/create', object: data

  function contract = 'modules/tests/assertions/valid_object', contract: contract, object: result, field_name: 'product'
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: "Test Product", given: result.title, field_name: 'product.title'
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: "19.99", given: result.price, field_name: 'product.price'

  return contract
%}
```

## Testing Validation Errors

```liquid
{% comment %} app/lib/test/products/create_invalid_test.liquid {% endcomment %}
{% liquid
  function contract = 'modules/tests/helpers/init'

  assign data = '{ "title": "", "price": "" }' | parse_json
  function result = 'commands/products/create', object: data

  function contract = 'modules/tests/assertions/not_valid_object', contract: contract, object: result, field_name: 'invalid_product'
  function contract = 'modules/tests/assertions/presence', contract: contract, object: result.errors, field_name: 'title'

  return contract
%}
```

## Available Assertions

| Assertion | Description |
|-----------|-------------|
| `valid_object` | Object has `valid: true` |
| `not_valid_object` | Object has `valid` not true |
| `equal` | Two values are equal |
| `blank` | Field is empty/null |
| `presence` | Field exists with value |
| `not_presence` | Field is null/missing |
| `true` | Value is truthy |
| `not_true` | Value is falsy |
| `object_contains_object` | Object has key-value subset |

## Running Tests

### CLI
```bash
# Run all tests
insites-cli test run staging

# Run a specific test
insites-cli test run staging -n test/products/create_test
```

### Browser
Navigate to `/_tests/run` on your staging instance.

## Test Organization

```
app/lib/test/
├── commands/
│   ├── products/
│   │   ├── create_test.liquid
│   │   └── update_test.liquid
│   └── orders/
│       └── place_test.liquid
├── queries/
│   └── users/
│       └── find_test.liquid
└── helpers/
    └── format_price_test.liquid
```

## Rules

- Tests only run in staging/development
- Files go in `app/lib/test/` and must end with `_test.liquid`
- Every test must initialize a contract with `modules/tests/helpers/init`
- Every assertion must reassign `contract` (not a different variable)
- Every test must `return contract` as the last statement
- Deploy before running tests (`insites-cli deploy staging`)
- Test commands and business logic, not pages
