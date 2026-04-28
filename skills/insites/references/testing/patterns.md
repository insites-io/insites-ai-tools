# Testing Patterns

## Basic Test Pattern

### Simple Command Test

```liquid
{% comment %} app/lib/test/commands/contacts/create_test.liquid {% endcomment %}
{% liquid
  function contract = 'modules/tests/helpers/init'

  assign data = '{ "email": "user@example.com", "body": "Hello" }' | parse_json
  function contact = 'commands/contacts/create', object: data

  function contract = 'modules/tests/assertions/valid_object', contract: contract, object: contact, field_name: 'contact'
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: "user@example.com", given: contact.email, field_name: 'contact.email'

  return contract
%}
```

## Validation Failure Pattern

### Testing Invalid Input

```liquid
{% comment %} app/lib/test/commands/contacts/create_invalid_test.liquid {% endcomment %}
{% liquid
  function contract = 'modules/tests/helpers/init'

  assign data = '{ "email": "invalid-email", "body": "" }' | parse_json
  function contact = 'commands/contacts/create', object: data

  function contract = 'modules/tests/assertions/not_valid_object', contract: contract, object: contact, field_name: 'invalid_contact'
  function contract = 'modules/tests/assertions/presence', contract: contract, object: contact.errors, field_name: 'email'

  return contract
%}
```

## Multi-Assertion Pattern

### Comprehensive Object Validation

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'

  assign data = '{ "email": "USER@example.com", "body": "This is a valid message." }' | parse_json
  function contact = 'commands/contacts/create', object: data

  # 1. Should be valid
  function contract = 'modules/tests/assertions/valid_object', contract: contract, object: contact, field_name: 'contact'

  # 2. Email should be downcased
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: 'user@example.com', given: contact.email, field_name: 'contact.email'

  # 3. Body should match
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: 'This is a valid message.', given: contact.body, field_name: 'contact.body'

  # 4. Errors should be blank
  function contract = 'modules/tests/assertions/blank', contract: contract, object: contact, field_name: 'errors'

  return contract
%}
```

## Query Test Pattern

### Testing Data Retrieval

```liquid
{% comment %} app/lib/test/queries/users/find_test.liquid {% endcomment %}
{% liquid
  function contract = 'modules/tests/helpers/init'

  # Create a user to query
  assign user_data = '{ "email": "query-test@example.com", "name": "Query Test" }' | parse_json
  function created = 'commands/users/create', object: user_data

  # Query the user
  function found = 'lib/queries/users/find', id: created.id

  function contract = 'modules/tests/assertions/presence', contract: contract, object: found, field_name: 'id'
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: "query-test@example.com", given: found.email, field_name: 'found.email'

  return contract
%}
```

## Helper/Utility Test Pattern

### Testing Pure Functions

```liquid
{% comment %} app/lib/test/helpers/format_price_test.liquid {% endcomment %}
{% liquid
  function contract = 'modules/tests/helpers/init'

  # Normal price
  function result = 'lib/helpers/format_price', amount: 1999
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: "$19.99", given: result, field_name: 'normal_price'

  # Zero price
  function result = 'lib/helpers/format_price', amount: 0
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: "$0.00", given: result, field_name: 'zero_price'

  return contract
%}
```

## Authorization Test Pattern

### Testing Permission Logic

```liquid
{% comment %} app/lib/test/authorization/can_edit_test.liquid {% endcomment %}
{% liquid
  function contract = 'modules/tests/helpers/init'

  # Admin can edit
  function can_edit = 'lib/authorization/can_edit', role: 'admin'
  function contract = 'modules/tests/assertions/true', contract: contract, object: can_edit, field_name: 'result'

  # Guest cannot edit
  function can_edit = 'lib/authorization/can_edit', role: 'guest'
  function contract = 'modules/tests/assertions/not_true', contract: contract, object: can_edit, field_name: 'result'

  return contract
%}
```

## CI/CD Pattern

### Pre-Deployment Testing Workflow

```bash
# 1. Deploy to staging
insites-cli deploy staging

# 2. Run all tests
insites-cli test run staging

# 3. If all pass, deploy to production
insites-cli deploy production
```

### GitHub Actions

```yaml
- name: Run Tests
  run: |
    insites-cli deploy staging
    insites-cli test run staging
    if [ $? -ne 0 ]; then
      echo "Tests failed"
      exit 1
    fi
```

## Real-Time Development Pattern

```bash
# Terminal 1: Start sync
insites-cli sync staging

# Terminal 2: Watch logs
insites-cli logsv2 staging

# Terminal 3: Run tests as needed
insites-cli test run staging -n test/commands/contacts/create_test
```

## See Also

- [Testing Configuration](./configuration.md)
- [Testing API Reference](./api.md)
- [Testing Troubleshooting](./gotchas.md)
