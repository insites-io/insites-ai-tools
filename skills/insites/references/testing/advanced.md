# Advanced Testing Techniques

## Multi-Scenario Test Files

A single test file can contain multiple comment-separated test scenarios. Each scenario sets up data and adds assertions to the shared contract:

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'
%}

{% comment %} Scenario 1: Valid input {% endcomment %}
{% liquid
  assign data = '{ "email": "valid@example.com", "body": "Hello" }' | parse_json
  function contact = 'commands/contacts/create', object: data

  function contract = 'modules/tests/assertions/valid_object', contract: contract, object: contact, field_name: 'valid_contact'
  function contract = 'modules/tests/assertions/blank', contract: contract, object: contact, field_name: 'errors'
%}

{% comment %} Scenario 2: Invalid email {% endcomment %}
{% liquid
  assign data = '{ "email": "not-an-email", "body": "Hello" }' | parse_json
  function contact = 'commands/contacts/create', object: data

  function contract = 'modules/tests/assertions/not_valid_object', contract: contract, object: contact, field_name: 'invalid_email_contact'
  function contract = 'modules/tests/assertions/presence', contract: contract, object: contact.errors, field_name: 'email'
%}

{% comment %} Scenario 3: Missing required fields {% endcomment %}
{% liquid
  assign data = '{ "email": "", "body": "" }' | parse_json
  function contact = 'commands/contacts/create', object: data

  function contract = 'modules/tests/assertions/not_valid_object', contract: contract, object: contact, field_name: 'empty_contact'
%}

{% liquid
  return contract
%}
```

## Email Testing

Test that actions trigger emails, then inspect them via the test module's endpoints:

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'

  # Trigger an action that sends email
  function result = 'commands/notifications/send_welcome', user_id: user.id

  function contract = 'modules/tests/assertions/valid_object', contract: contract, object: result, field_name: 'welcome_email_sent'

  return contract
%}
```

Inspect sent emails at `/_tests/sent_mails` and `/_tests/sent_mails/:id`.

## Custom Assertions

When built-in assertions are insufficient, use `register_error` to add custom validation:

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'

  function result = 'commands/products/create', object: data

  # Custom: verify price is within range
  assign price = result.price | plus: 0
  if price < 0
    function contract = 'modules/tests/helpers/register_error', contract: contract, field_name: 'price_range', message: 'Price must not be negative'
  endif
  if price > 999999
    function contract = 'modules/tests/helpers/register_error', contract: contract, field_name: 'price_max', message: 'Price exceeds maximum'
  endif

  return contract
%}
```

## Debugging Failing Tests

### Step-by-step protocol

1. Run the specific failing test:
   ```bash
   insites-cli test run staging -n test/commands/users/create_test
   ```

2. Check JSON output for assertion details:
   ```
   /_tests/run.js?name=test/commands/users/create_test
   ```

3. Add `{% log %}` statements and watch logs:
   ```bash
   insites-cli logsv2 staging
   ```

4. In the test file, log intermediate values:
   ```liquid
   {% liquid
     function result = 'commands/users/create', object: data
     log result, type: 'debug'
   %}
   ```

## Test Data Isolation

Tests run on staging, so test data shares the database. Best practices:

- Use unique identifiers (e.g., timestamp-based emails) to avoid collisions
- Clean up created records after testing when possible
- Never depend on specific record IDs existing

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'

  # Use unique email to avoid collisions
  assign now = 'now' | date: '%s'
  assign test_email = 'test-' | append: now | append: '@example.com'

  assign data = '{}' | parse_json | hash_merge: email: test_email, name: 'Test User'
  function result = 'commands/users/create', object: data

  function contract = 'modules/tests/assertions/valid_object', contract: contract, object: result, field_name: 'user'

  return contract
%}
```

## See Also

- [Testing Patterns](./patterns.md)
- [Testing API Reference](./api.md)
- [Deployment Advanced](../deployment/advanced.md)
