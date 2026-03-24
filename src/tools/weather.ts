import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveApiKey } from "../google/api-key.js";
import { googleGetJson, jsonResult } from "../google/client.js";

const WEATHER = "https://weather.googleapis.com/v1";

const unitsSystemSchema = z.enum(["METRIC", "IMPERIAL"]).optional();

const latLonSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

const weatherCurrentSchema = latLonSchema.extend({
  unitsSystem: unitsSystemSchema,
  languageCode: z.string().min(1).optional(),
});

const weatherForecastDaysSchema = latLonSchema.extend({
  unitsSystem: unitsSystemSchema,
  languageCode: z.string().min(1).optional(),
  pageSize: z.number().int().min(1).max(10).optional(),
  pageToken: z.string().optional(),
  days: z.number().int().min(1).max(10).optional(),
});

const weatherForecastHoursSchema = latLonSchema.extend({
  unitsSystem: unitsSystemSchema,
  languageCode: z.string().min(1).optional(),
  pageSize: z.number().int().min(1).max(24).optional(),
  pageToken: z.string().optional(),
  hours: z.number().int().min(1).max(240).optional(),
});

const weatherHistoryHoursSchema = latLonSchema.extend({
  unitsSystem: unitsSystemSchema,
  languageCode: z.string().min(1).optional(),
  pageSize: z.number().int().min(1).max(24).optional(),
  pageToken: z.string().optional(),
  hours: z.number().int().min(1).max(24).optional(),
});

const weatherPublicAlertsSchema = latLonSchema.extend({
  languageCode: z.string().min(1).optional(),
  pageSize: z.number().int().positive().optional(),
  pageToken: z.string().optional(),
});

function locationQuery(
  latitude: number,
  longitude: number
): Record<string, string> {
  return {
    "location.latitude": String(latitude),
    "location.longitude": String(longitude),
  };
}

export function registerWeatherTools(server: McpServer): void {
  server.registerTool(
    "weather_current_conditions",
    {
      description:
        "Google Weather API: current conditions at a location. See https://developers.google.com/maps/documentation/weather/current-conditions",
      inputSchema: weatherCurrentSchema,
    },
    async ({ latitude, longitude, unitsSystem, languageCode }) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googleGetJson(
        `${WEATHER}/currentConditions:lookup`,
        keyRes.key,
        {
          ...locationQuery(latitude, longitude),
          ...(unitsSystem === undefined ? {} : { unitsSystem }),
          ...(languageCode === undefined ? {} : { languageCode }),
        }
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
    "weather_forecast_days",
    {
      description:
        "Google Weather API: up to 10 days of daily forecast. See https://developers.google.com/maps/documentation/weather/daily-forecast",
      inputSchema: weatherForecastDaysSchema,
    },
    async ({
      latitude,
      longitude,
      unitsSystem,
      languageCode,
      pageSize,
      pageToken,
      days,
    }) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googleGetJson(
        `${WEATHER}/forecast/days:lookup`,
        keyRes.key,
        {
          ...locationQuery(latitude, longitude),
          ...(unitsSystem === undefined ? {} : { unitsSystem }),
          ...(languageCode === undefined ? {} : { languageCode }),
          ...(pageSize === undefined ? {} : { pageSize }),
          ...(pageToken === undefined ? {} : { pageToken }),
          ...(days === undefined ? {} : { days }),
        }
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
    "weather_forecast_hours",
    {
      description:
        "Google Weather API: up to 240 hours of hourly forecast. See https://developers.google.com/maps/documentation/weather/hourly-forecast",
      inputSchema: weatherForecastHoursSchema,
    },
    async ({
      latitude,
      longitude,
      unitsSystem,
      languageCode,
      pageSize,
      pageToken,
      hours,
    }) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googleGetJson(
        `${WEATHER}/forecast/hours:lookup`,
        keyRes.key,
        {
          ...locationQuery(latitude, longitude),
          ...(unitsSystem === undefined ? {} : { unitsSystem }),
          ...(languageCode === undefined ? {} : { languageCode }),
          ...(pageSize === undefined ? {} : { pageSize }),
          ...(pageToken === undefined ? {} : { pageToken }),
          ...(hours === undefined ? {} : { hours }),
        }
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
    "weather_history_hours",
    {
      description:
        "Google Weather API: up to 24 hours of historical hourly weather. See https://developers.google.com/maps/documentation/weather/hourly-history",
      inputSchema: weatherHistoryHoursSchema,
    },
    async ({
      latitude,
      longitude,
      unitsSystem,
      languageCode,
      pageSize,
      pageToken,
      hours,
    }) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googleGetJson(
        `${WEATHER}/history/hours:lookup`,
        keyRes.key,
        {
          ...locationQuery(latitude, longitude),
          ...(unitsSystem === undefined ? {} : { unitsSystem }),
          ...(languageCode === undefined ? {} : { languageCode }),
          ...(pageSize === undefined ? {} : { pageSize }),
          ...(pageToken === undefined ? {} : { pageToken }),
          ...(hours === undefined ? {} : { hours }),
        }
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
    "weather_public_alerts",
    {
      description:
        "Google Weather API: public weather alerts intersecting a location. See https://developers.google.com/maps/documentation/weather/weather-alerts",
      inputSchema: weatherPublicAlertsSchema,
    },
    async ({ latitude, longitude, languageCode, pageSize, pageToken }) => {
      const keyRes = resolveApiKey();
      if (!keyRes.ok) {
        return {
          content: [{ type: "text", text: keyRes.message }],
          isError: true,
        };
      }
      const result = await googleGetJson(
        `${WEATHER}/publicAlerts:lookup`,
        keyRes.key,
        {
          ...locationQuery(latitude, longitude),
          ...(languageCode === undefined ? {} : { languageCode }),
          ...(pageSize === undefined ? {} : { pageSize }),
          ...(pageToken === undefined ? {} : { pageToken }),
        }
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
