import type { ClientCapabilities } from "@modelcontextprotocol/client";

export function elicitationCapabilitiesFromHandlers(handlers?: {
  form?: unknown;
  url?: unknown;
}): ClientCapabilities["elicitation"] | undefined {
  if (!handlers) return undefined;
  const elicitation: NonNullable<ClientCapabilities["elicitation"]> = {};
  if (handlers.form) elicitation.form = {};
  if (handlers.url) elicitation.url = {};
  return elicitation.form || elicitation.url ? elicitation : undefined;
}
