// MCP server wrapper — exposes the engine as MCP tools for any MCP-aware IDE
// (Claude Code, Cursor, Continue, etc).
//
// STATUS: stub. Wire to @modelcontextprotocol/sdk once the engine is stable.
//
// Tools to expose:
//   evaluate_intent   — full engine evaluation for an intent + project state
//   validate_file     — run validators on a file's content
//   recommend_pattern — for a feature description, return decision matches with rationale + references
//   scaffold_files    — render templates into a file plan
//   lookup_reference  — resolve a {repo, path} reference to its content
//   introspect_instance — read connected instance's module versions, constants, schemas
//   lookup_rule       — fetch a rule's full markdown body by id

import { evaluate } from "./runtime.js";
import { validate } from "./validators.js";

export type McpToolHandler = (args: unknown) => Promise<unknown>;

export const tools: Record<string, McpToolHandler> = {
  evaluate_intent: async (args) => evaluate(args as never),
  validate_file: async (args) => {
    const { filePath, content } = args as { filePath: string; content: string };
    return validate(filePath, content);
  },
  // TODO: recommend_pattern, scaffold_files, lookup_reference, introspect_instance, lookup_rule
};

// TODO: stdio MCP server boot using @modelcontextprotocol/sdk
