import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveApiKey } from "../google/api-key.js";
import { googleGetJson, jsonResult } from "../google/client.js";

const POLLEN_FORECAST = "https://pollen.googleapis.com/v1/forecast:lookup";

const pollenForecastSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  days: z.number().int().min(1).max(5),
});

export function registerPollenTools(server: McpServer): void {
  server.registerTool(
    "pollen_forecast",
    {
      description:
        "Google Pollen API: daily pollen forecast (1–5 days) at a location. See https://developers.google.com/maps/documentation/pollen/forecast",
      inputSchema: pollenForecastSchema,
    },
    async ({ latitude, longitude, days }) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googleGetJson(POLLEN_FORECAST, keyRes.key, {
        "location.latitude": latitude,
        "location.longitude": longitude,
        days,
      });
      if (!result.ok) {
        return {
          content: [{ type: "text", text: result.message }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: jsonResult(result.data) }] };
    }
  );
}
