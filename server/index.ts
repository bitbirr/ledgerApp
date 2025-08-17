import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import http from 'http';
import { registerRoutes } from './routes.ts';
import { setupVite, serveStatic, log } from './vite';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// tiny API logger
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJson: unknown;

  const origJson = res.json;
  res.json = function (body, ...args) {
    capturedJson = body;
    return origJson.apply(res, [body, ...args]);
  };

  res.on('finish', () => {
    const duration = Date.now() - start;
    if (path.startsWith('/api')) {
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJson) line += ` :: ${JSON.stringify(capturedJson)}`;
      if (line.length > 80) line = line.slice(0, 79) + '…';
      log(line);
    }
  });

  next();
});

(async () => {
  // attach routes
  await registerRoutes(app);

  // error handler AFTER routes
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
  });

  // create server, then wire Vite (dev) or static (prod)
  const server = http.createServer(app);

  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, '0.0.0.0', () => log(`serving on port ${port}`));
})();
