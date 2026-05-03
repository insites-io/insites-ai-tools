# @insites/logic-engine

TypeScript library that interprets the Insites logic-engine corpus (rules + decisions + templates + validators). Consumed by `insites-studio`, the `@insites/logic-engine-mcp` MCP server, the `npx @insites/logic-engine` CLI, and any other tool that needs to reason about Insites projects programmatically.

## Status

Draft (`0.1.0-draft`). The corpus is in active v0 audit. Not yet published to npm.

## Install (when published)

```bash
npm install @insites/logic-engine
```

## Public API

```ts
import { evaluate, validate } from '@insites/logic-engine';

const result = await evaluate({
  surface: 'studio-chat',
  intent: 'add a discount code to the checkout',
  projectFiles: [{ path: 'app/views/pages/checkout.liquid', size: 1234 }],
  installedModules: [{ id: 'ecommerce', version: '5.11.1' }],
});
// → { rulesMarkdown, decisions, scaffolds, firedRuleIds, validators }

const validationResult = await validate(
  'app/views/pages/checkout.liquid',
  fileContent
);
// → { violations: [{ ruleId, severity, line, message }] }
```

## Distribution surfaces

This package powers three distribution surfaces:

1. **npm library** (`@insites/logic-engine`) — server-side imports, used by `insites-studio`.
2. **MCP server** (`@insites/logic-engine-mcp`) — wraps this library as MCP tools for any MCP-aware IDE.
3. **CLI** (`npx @insites/logic-engine`) — `validate`, `audit`, `recommend`, `scaffold` commands.

## Source layout

```
engine/
├── src/
│   ├── runtime.ts       evaluate(), selectRules()
│   ├── dsl.ts           generic when/then evaluator
│   ├── validators.ts    validator framework
│   ├── corpus.ts        loads + caches corpus from disk
│   ├── render.ts        Eta template renderer
│   ├── types.ts         Zod schemas + type exports
│   └── index.ts         public API
└── __tests__/           Vitest unit tests
```

## Corpus

The corpus (rules, decisions, templates, validators) lives in `../logic-engine/` (the sibling directory of this package, both inside `insites-ai-tool`). The package bundles the corpus at build time so consumers don't need network access.

See `../logic-engine/README.md` for corpus authoring rules.
