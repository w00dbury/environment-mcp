import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAirQualityTools } from "./tools/air-quality.js";
import { registerPollenTools } from "./tools/pollen.js";
import { registerWeatherTools } from "./tools/weather.js";

export function createEnvironmentMcpServer(): McpServer {
  const server = new McpServer({
    name: "environment-mcp",
    version: "1.1.0",
  });
  registerAirQualityTools(server);
  registerPollenTools(server);
  registerWeatherTools(server);
  return server;
}
