# Module Name - Gotchas

## Module Not Installed

**Symptom:** `Liquid error: Could not find partial 'modules/<module-name>/...'`

**Fix:** Install the module and deploy:
```bash
insites-cli modules install <module-name>
insites-cli deploy staging
```

## Editing Module Files Directly

**Do not edit files in `modules/`.** The modules directory is read-only. Override module behavior via the documented override mechanism only.

## Missing Constants

**Symptom:** Module features fail silently or return errors.

**Fix:** Ensure all required constants are set. See [configuration.md](./configuration.md).

## See Also

- [README](./README.md)
- [Configuration](./configuration.md)
- [Patterns](./patterns.md)
