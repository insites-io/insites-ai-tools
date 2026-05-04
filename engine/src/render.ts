import { Eta } from "eta";
import path from "node:path";
import { loadTemplate } from "./corpus.js";

const eta = new Eta({
  autoTrim: false,
  useWith: false,
});

/** Render a named template (e.g. "command.eta") with the given params. */
export async function renderTemplate(
  name: string,
  params: Record<string, unknown>
): Promise<string> {
  const tpl = await loadTemplate(name);
  return eta.renderString(tpl, params);
}
