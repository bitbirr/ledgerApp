import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    // Custom plugin to handle Chrome DevTools files
    {
      name: 'chrome-devtools-filter',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Block Chrome DevTools specific requests
          if (req.url?.includes('.well-known/appspecific/com.chrome.devtools') ||
              req.url?.includes('chrome-extension://') ||
              req.url?.includes('devtools://')) {
            res.statusCode = 404;
            res.end();
            return;
          }
          next();
        });
      },
      load(id) {
        // Skip processing Chrome DevTools files
        if (id.includes('.well-known/appspecific/com.chrome.devtools') ||
            id.includes('chrome-extension://')) {
          return 'export default {}';
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port: parseInt(process.env.PORT || '3099', 10),
    host: '0.0.0.0',
    fs: {
      strict: true,
      deny: ["**/.*", "**/.well-known/**"],
    },
  },
  // Enhanced Chrome DevTools handling
  optimizeDeps: {
    exclude: [
      '/.well-known/appspecific/com.chrome.devtools.json',
      'chrome-extension://*',
      'devtools://*'
    ]
  },
  // Add custom plugin to handle Chrome DevTools files
  define: {
    __CHROME_DEVTOOLS_FIX__: 'true'
  }
});
