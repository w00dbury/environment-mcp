import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveApiKey } from "../google/api-key.js";
import { googlePostJson, jsonResult } from "../google/client.js";

const AIR_QUALITY = "https://airquality.googleapis.com/v1";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

/** Request body for currentConditions:lookup (extra fields passed through to Google). */
const airQualityBodySchema = z
  .object({
    location: locationSchema,
  })
  .passthrough();

export function registerAirQualityTools(server: McpServer): void {
  server.registerTool(
    "air_quality_current_conditions",
    {
      description:
        "Google Air Quality API: current conditions at a location (hourly indexes, optional pollutants via extraComputations). POST body matches https://developers.google.com/maps/documentation/air-quality/reference/rest/v1/currentConditions/lookup — requires `location` with latitude and longitude; other optional fields are forwarded.",
      inputSchema: airQualityBodySchema,
    },
    async (args) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googlePostJson(
        `${AIR_QUALITY}/currentConditions:lookup`,
        keyRes.key,
        args
      );
      if (!result.ok) {
        return {
          content: [{ type: "text", text: result.message }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: jsonResult(result.data) }] };
    }
  );

  server.registerTool(
    "air_quality_forecast",
    {
      description:
        "Google Air Quality API: hourly forecast for a time range or specific hour. POST body matches https://developers.google.com/maps/documentation/air-quality/reference/rest/v1/forecast/lookup — requires `location`; use `period` (startTime/endTime), `dateTime`, or `hours` per API docs.",
      inputSchema: airQualityBodySchema,
    },
    async (args) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googlePostJson(
        `${AIR_QUALITY}/forecast:lookup`,
        keyRes.key,
        args
      );
      if (!result.ok) {
        return {
          content: [{ type: "text", text: result.message }],
          isError: true,
        };
      }
      return { content: [{ type: "text", text: jsonResult(result.data) }] };
    }
  );

  server.registerTool(
    "air_quality_history",
    {
      description:
        "Google Air Quality API: historical hourly data. POST body matches https://developers.google.com/maps/documentation/air-quality/reference/rest/v1/history/lookup — requires `location`; use `period`, `dateTime`, or `hours` (1–720) per API docs.",
      inputSchema: airQualityBodySchema,
    },
    async (args) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googlePostJson(
        `${AIR_QUALITY}/history:lookup`,
        keyRes.key,
        args
      );
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
