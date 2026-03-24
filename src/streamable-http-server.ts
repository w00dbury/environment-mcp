import { randomUUID } from "node:crypto";
import { createMcpExpressApp } from "@modelcontextprotocol/sdk/server/express.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { isInitializeRequest } from "@modelcontextprotocol/sdk/types.js";
import type { Request, Response } from "express";
import { createEnvironmentMcpServer } from "./create-environment-mcp-server.js";

function headerSessionId(req: Request): string | undefined {
  const raw = req.headers["mcp-session-id"];
  if (Array.isArray(raw)) {
    return raw[0];
  }
  return raw;
}

/**
 * Stateful MCP streamable HTTP: POST for JSON-RPC, GET for SSE (server → client streaming).
 * Enable with env `MCP_HTTP_PORT`; optional `MCP_HOST` (default 0.0.0.0).
 */
export function startStreamableHttpServer(options: {
  port: number;
  host: string;
}): void {
  const { port, host } = options;
  const app = createMcpExpressApp({ host });
  const transports: Record<string, StreamableHTTPServerTransport> =
    Object.create(null);

  const mcpPostHandler = async (req: Request, res: Response) => {
    const sessionId = headerSessionId(req);
    try {
      if (sessionId) {
        const existing = transports[sessionId];
        if (existing) {
          await existing.handleRequest(req, res, req.body);
          return;
        }
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32_000,
            message: "Bad Request: No valid session ID provided",
          },
          id: null,
        });
        return;
      }

      if (!isInitializeRequest(req.body)) {
        res.status(400).json({
          jsonrpc: "2.0",
          error: {
            code: -32_000,
            message: "Bad Request: No valid session ID provided",
          },
          id: null,
        });
        return;
      }

      let transport: StreamableHTTPServerTransport;
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          transports[sid] = transport;
        },
      });
      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && transports[sid]) {
          delete transports[sid];
        }
      };
      const server = createEnvironmentMcpServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (error) {
      console.error("MCP HTTP POST error:", error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: "2.0",
          error: {
            code: -32_603,
            message: "Internal server error",
          },
          id: null,
        });
      }
    }
  };

  const mcpGetHandler = async (req: Request, res: Response) => {
    const sid = headerSessionId(req);
    if (!(sid && transports[sid])) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    await transports[sid].handleRequest(req, res);
  };

  const mcpDeleteHandler = async (req: Request, res: Response) => {
    const sid = headerSessionId(req);
    if (!(sid && transports[sid])) {
      res.status(400).send("Invalid or missing session ID");
      return;
    }
    try {
      await transports[sid].handleRequest(req, res);
    } catch (error) {
      console.error("MCP HTTP DELETE error:", error);
      if (!res.headersSent) {
        res.status(500).send("Error processing session termination");
      }
    }
  };

  app.post("/mcp", mcpPostHandler);
  app.get("/mcp", mcpGetHandler);
  app.delete("/mcp", mcpDeleteHandler);

  app.listen(port, host, (error?: Error) => {
    if (error) {
      console.error("Failed to start MCP HTTP server:", error);
      process.exit(1);
    }
    console.log(
      `environment-mcp streamable HTTP listening on http://${host}:${port}/mcp`
    );
  });

  const shutdown = async () => {
    for (const sid of Object.keys(transports)) {
      try {
        await transports[sid]?.close();
        delete transports[sid];
      } catch (e) {
        console.error(`Error closing transport ${sid}:`, e);
      }
    }
    process.exit(0);
  };

  process.once("SIGINT", () => {
    shutdown().catch((err) => {
      console.error("Shutdown error:", err);
      process.exit(1);
    });
  });
  process.once("SIGTERM", () => {
    shutdown().catch((err) => {
      console.error("Shutdown error:", err);
      process.exit(1);
    });
  });
}
