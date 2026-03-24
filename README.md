# environment-mcp

MCP (Model Context Protocol) server that proxies [Google Maps Platform Environment APIs](https://developers.google.com/maps/environment): **Air Quality**, **Pollen**, and **Weather**. Uses stdio transport and a single API key from the environment.

## Prerequisites

- Node.js 20+
- A Google Cloud project with billing enabled
- APIs enabled: **Air Quality API**, **Pollen API**, **Weather API** (APIs & Services → Library)
- An API key (APIs & Services → Credentials), with usage restricted appropriately for your setup

See the product setup guides for details: [Air Quality](https://developers.google.com/maps/documentation/air-quality/get-api-key), [Pollen](https://developers.google.com/maps/documentation/pollen/get-api-key), [Weather](https://developers.google.com/maps/documentation/weather/get-api-key).

## Install and run

```bash
npm install
npm run build
```

Set the key (do not commit it):

```bash
export GOOGLE_MAPS_API_KEY="your-key"
```

Alternatively use `GOOGLE_ENVIRONMENT_API_KEY`.

Start the server (stdio; typically launched by an MCP client, not used interactively):

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## Cursor MCP configuration

After `npm run build`, add a server entry (adjust the path to your clone):

```json
{
  "mcpServers": {
    "google-environment": {
      "command": "node",
      "args": ["/absolute/path/to/environment-mcp/dist/index.js"],
      "env": {
        "GOOGLE_MAPS_API_KEY": "your-key-here"
      }
    }
  }
}
```

You can omit `env` if `GOOGLE_MAPS_API_KEY` is already set in your shell profile and Cursor inherits it (behavior depends on how Cursor is launched).

## Tools

| Tool | API |
|------|-----|
| `air_quality_current_conditions` | `POST .../v1/currentConditions:lookup` |
| `air_quality_forecast` | `POST .../v1/forecast:lookup` |
| `air_quality_history` | `POST .../v1/history:lookup` |
| `pollen_forecast` | `GET .../v1/forecast:lookup` |
| `weather_current_conditions` | `GET .../v1/currentConditions:lookup` |
| `weather_forecast_days` | `GET .../v1/forecast/days:lookup` |
| `weather_forecast_hours` | `GET .../v1/forecast/hours:lookup` |
| `weather_history_hours` | `GET .../v1/history/hours:lookup` |
| `weather_public_alerts` | `GET .../v1/publicAlerts:lookup` |

Air quality tools accept a JSON body with required `location: { latitude, longitude }` and optional fields per Google’s REST reference; other tools use typed arguments (coordinates, `days`, `hours`, `unitsSystem`, etc.).

## Linting

Uses [Ultracite](https://www.ultracite.ai/) (Biome preset):

```bash
npm run lint
npm run format
```

## Security

- Never pass the API key in tool arguments; only use environment variables.
- Restrict the key in Google Cloud Console (HTTP referrers for browser use; IP or server-only patterns for backend).
