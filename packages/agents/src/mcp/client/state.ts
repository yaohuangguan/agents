export const MCPConnectionState = {
  /** Waiting for OAuth authorization to complete */
  AUTHENTICATING: "authenticating",
  /** Establishing transport connection to MCP server */
  CONNECTING: "connecting",
  /** Transport connection established */
  CONNECTED: "connected",
  /** Discovering server capabilities (tools, resources, prompts) */
  DISCOVERING: "discovering",
  /** Fully connected and ready to use */
  READY: "ready",
  /** Connection failed at some point */
  FAILED: "failed"
} as const;

export type MCPConnectionState =
  (typeof MCPConnectionState)[keyof typeof MCPConnectionState];
