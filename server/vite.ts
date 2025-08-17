// server/vite.ts
import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { createServer as createViteServer, createLogger, type InlineConfig } from "vite";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";

const viteLogger = createLogger();

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: Express, httpServer: Server) {
  const serverOptions: InlineConfig["server"] = {
    middlewareMode: true,
    hmr: { server: httpServer },
    allowedHosts: true, // allow all in dev
  };

  const vite = await createViteServer({
    ...(viteConfig as InlineConfig),
    configFile: false,
    appType: "custom",
    server: serverOptions,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        // fail fast in dev so we don't serve a broken, untransformed index.html
        process.exit(1);
      },
    },
  });

  // Let Vite handle assets, /@vite/client, HMR websocket, etc.
  app.use(vite.middlewares);

  // Always render the current client index.html with transform
  app.use("*", async (req, res, next) => {
    try {
      const clientTemplatePath = path.resolve(process.cwd(), "client", "index.html");
      let template = await fs.promises.readFile(clientTemplatePath, "utf-8");

      // Cache-bust the entry during dev to avoid sticky SW/HTML caching
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const transformed = await vite.transformIndexHtml(req.originalUrl, template);

      res
        .status(200)
        .set({
          "Content-Type": "text/html",
          // Avoid any caching of the HTML shell in dev
          "Cache-Control": "no-store, must-revalidate",
        })
        .end(transformed);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  // In production, client build outputs to dist/public
  const distPublic = path.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPublic)) {
    throw new Error(
      `Could not find the build directory: ${distPublic}. Run the client build first.`
    );
  }

  app.use(express.static(distPublic, { immutable: true, maxAge: "1y" }));

  // HTML shell should not be cached too aggressively
  app.get("*", (_req, res) => {
    res.set("Cache-Control", "no-store, must-revalidate");
    res.sendFile(path.join(distPublic, "index.html"));
  });
}
