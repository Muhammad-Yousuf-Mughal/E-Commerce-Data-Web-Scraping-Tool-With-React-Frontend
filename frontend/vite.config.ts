import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For dockerised dev: set VITE_PROXY_TARGET=http://backend:8000 so the Vite
// dev server proxies /api to the backend service. Local dev defaults to localhost.
const proxyTarget = process.env.VITE_PROXY_TARGET || "http://localhost:8000";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      "/api": {
        target: proxyTarget,
        changeOrigin: true,
        secure: false,
      },
    },
  },
  define: {
    "__APP_MODE__": JSON.stringify(mode),
  },
}));
