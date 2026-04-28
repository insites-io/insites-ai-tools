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

**Symptom:** `insites-cli test run` finds no tests.

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

**This is by design.** Tests can only run on development and staging environments.

```bash
# WRONG
insites-cli test run production

# CORRECT
insites-cli test run staging
```

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

**Fix:** Always deploy before running tests:

```bash
insites-cli deploy staging
insites-cli test run staging
```

Or use sync mode for active development:

```bash
# Terminal 1
insites-cli sync staging

# Terminal 2
insites-cli test run staging -n test/your_test
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
