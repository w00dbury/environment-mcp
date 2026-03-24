import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAirQualityTools } from "./tools/air-quality.js";
import { registerPollenTools } from "./tools/pollen.js";
import { registerWeatherTools } from "./tools/weather.js";

const server = new McpServer({
  name: "environment-mcp",
  version: "1.0.0",
});

registerAirQualityTools(server);
registerPollenTools(server);
registerWeatherTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
