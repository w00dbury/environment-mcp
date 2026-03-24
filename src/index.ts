import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createEnvironmentMcpServer } from "./create-environment-mcp-server.js";
import { startStreamableHttpServer } from "./streamable-http-server.js";

const httpPortRaw = process.env.MCP_HTTP_PORT;
if (httpPortRaw !== undefined && httpPortRaw !== "") {
  const port = Number.parseInt(httpPortRaw, 10);
  if (Number.isNaN(port) || port < 1 || port > 65_535) {
    console.error(
      "MCP_HTTP_PORT must be a number between 1 and 65535 when set."
    );
    process.exit(1);
  }
  const host = process.env.MCP_HOST ?? "0.0.0.0";
  startStreamableHttpServer({ port, host });
} else {
  const server = createEnvironmentMcpServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
