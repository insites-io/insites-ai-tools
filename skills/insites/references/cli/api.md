# CLI Commands Reference

## Archive Command

Create a deployment archive without deploying:

```bash
insites-cli archive
insites-cli archive -o ./tmp/release.zip
```

Options:
- `-o, --output <output>` — Archive filename (default: `./tmp/release.zip`)

Useful for CI/CD pipelines where you need to build an artifact without deploying.

## Deploy Command

Deploy your application to an environment:

```bash
insites-cli deploy [environment]
insites-cli deploy dev
insites-cli deploy production
```

Deployment flow:
1. Runs insites-cli audit validation
2. Syncs files
3. Executes migrations
4. Applies schema changes
5. Uploads assets to CDN

## Sync Command

Synchronize local changes without full deployment:

```bash
insites-cli sync [environment]
insites-cli sync dev
insites-cli sync --watch staging
```

Watch mode for continuous sync:

```bash
insites-cli sync dev --watch
```

## GUI Serve Command

Local development server with hot reload:

```bash
insites-cli gui serve
insites-cli gui serve --port 3000
```

Access at `http://localhost:3000`

## Logs Command

View instance logs with filtering. Use `logsv2` (alias: `l2`):

```bash
insites-cli logsv2 [environment]
insites-cli logsv2 dev
insites-cli logsv2 dev --filter "error"
insites-cli logsv2 staging --filter "background_job" --follow
```

Filter options:
- `error`: Error messages only
- `background_job`: Background job logs
- `api_call`: API call logs
- Custom patterns using regex

## Liquid and GraphQL Execution

Execute Liquid templates and GraphQL queries directly:

```bash
insites-cli exec [environment] [query_type] [query]
insites-cli exec dev liquid "{{ 'Hello' }}"
insites-cli exec dev graphql "{ users { id name } }"
```

## Duplicate Command

Duplicate one environment into another:

```bash
insites-cli duplicate init <sourceEnv> <targetEnv>
insites-cli duplicate init staging dev
```

Copies the source environment (code, data, configuration) into the target.

## Pull Command

Export app data from an environment to a zip file:

```bash
insites-cli pull [environment]
insites-cli pull staging
insites-cli pull staging -p ./backup.zip
```

Options:
- `-p, --path <export-file-path>` — Output file path (default: `app.zip`)

## Modules Management

### Initialize Module

Scaffold a new module with the starter structure:

```bash
insites-cli modules init <name>
insites-cli modules init my-module
```

### Pull Module

Pull a module from an instance:

```bash
insites-cli modules pull [environment] <name>
insites-cli modules pull staging @platform-os/blog
```

### List Modules

View installed modules:

```bash
insites-cli modules list [environment]
insites-cli modules list staging
```

### Remove Module

Remove a module from an instance (removes configuration and data):

```bash
insites-cli modules remove [environment] <name>
insites-cli modules remove staging @platform-os/blog
```

### Version Module

Create a new version of a module:

```bash
insites-cli modules version [version] --package
```

## Constants Management

### Set Constants

Configure global constants:

```bash
insites-cli constants set dev MY_API_KEY "secret123"
insites-cli constants set staging SENDGRID_TOKEN "token_xyz"
```

### List Constants

View all constants:

```bash
insites-cli constants list dev
insites-cli constants list production
```

## Migrations Management

### Generate Migration

Create new migration:

```bash
insites-cli migrations generate [environment] [migration_name]
insites-cli migrations generate dev create_users_table
```

### Run Migration

Execute a specific migration by timestamp:

```bash
insites-cli migrations run <timestamp> [environment]
insites-cli migrations run 20240101120000 staging
```

### List Migrations

View migration history:

```bash
insites-cli migrations list [environment]
insites-cli migrations list production
```

## Data Management

### Export Data

Export database records:

```bash
insites-cli data export [environment] [type] [file]
insites-cli data export dev users data/users.csv
```

### Import Data

Import records:

```bash
insites-cli data import [environment] [type] [file]
insites-cli data import staging users data/users.csv
```

### Clean Data

Remove all records (use with caution):

```bash
insites-cli data clean [environment] [type]
insites-cli data clean dev users
```

## Testing Command

Run automated tests:

```bash
insites-cli test run [environment]
insites-cli test run staging
insites-cli test run staging -n [test-name]
insites-cli test run staging -n test/commands/users/create_test
```

Exit codes:
- `0` = All tests passed
- Non-zero = Test failures occurred

## See Also

- [CLI Configuration](./configuration.md)
- [Advanced CLI Patterns](./advanced.md)
- [CLI Troubleshooting](./gotchas.md)
