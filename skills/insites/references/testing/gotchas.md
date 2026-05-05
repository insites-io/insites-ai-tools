# Testing Gotchas and Troubleshooting

## Contract Not Initialized

**Symptom:** Test runs but no assertions execute; test appears to pass but validates nothing.

**Fix:** Add `function contract = 'modules/tests/helpers/init'` as the first line:

```liquid
{% liquid
  function contract = 'modules/tests/helpers/init'
  # ... rest of test ...
  return contract
%}
```

## Contract Not Returned

**Symptom:** Test appears to pass but results aren't collected.

**Fix:** Add `return contract` as the last statement in the test file.

## Contract Not Reassigned

**Symptom:** Error about nil contract, or only the last assertion is recorded.

```liquid
{% liquid
  # WRONG — contract not updated
  function result = 'modules/tests/assertions/equal', contract: contract, expected: "a", given: "a", field_name: 'test'

  # CORRECT — contract reassigned
  function contract = 'modules/tests/assertions/equal', contract: contract, expected: "a", given: "a", field_name: 'test'
%}
```

## Test File Not Found

**Symptom:** `/_tests/run` returns no tests.

**Causes:**
- File not in `app/lib/test/` directory
- File doesn't end with `_test.liquid`
- File not deployed

**Fix:**
```bash
# Verify file exists
ls app/lib/test/

# Naming must be: *_test.liquid
# WRONG: user_tests.liquid, test_user.liquid
# CORRECT: user_test.liquid

# Always deploy before running tests
insites-cli deploy staging
```

## Tests Not Running in Production

**This is by design.** Tests can only run on development and staging environments. Hitting `/_tests/run` against a production instance is rejected by the platform.

## Object Property Access on Nil

**Symptom:** Cannot access property of nil.

**Fix:** Check the object exists before asserting on its properties:

```liquid
{% liquid
  if user != blank
    function contract = 'modules/tests/assertions/equal', contract: contract, expected: "test@example.com", given: user.email, field_name: 'user.email'
  else
    function contract = 'modules/tests/helpers/register_error', contract: contract, field_name: 'user_exists', message: 'User object is nil'
  endif
%}
```

## Stale Test Results

**Symptom:** Tests pass but code changes aren't reflected.

**Fix:** Always deploy (or sync) before running tests:

```bash
insites-cli deploy staging
# then visit <staging-instance>/_tests/run
```

For active development, use sync mode in one terminal and refresh `/_tests/run?name=test/your_test` in the browser as you make changes:

```bash
insites-cli sync staging
```

## Tests Pass Locally but Fail in CI

**Causes:**
- Missing constants in CI environment
- Different data state between environments
- Tests not deployed

**Fix:**
- Ensure constants are set on the CI environment
- Make tests self-contained (create their own test data)
- Deploy before running tests in CI

## Wrong Test Directory

```
# WRONG paths
app/lib/tests/          (extra 's')
app/tests/
tests/
app/lib/test.liquid     (not a directory)

# CORRECT path
app/lib/test/
```

## See Also

- [Testing Configuration](./configuration.md)
- [Testing Patterns](./patterns.md)
- [CLI Troubleshooting](../cli/gotchas.md)
