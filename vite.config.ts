import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    exclude: ["lucide-react"],
  },
  build: {
    target: "es2022", // Update the target to ES2022 or later
  },
  server: {
    host: true,
    proxy: {
      "/api/v1": {
        target: "http://192.168.0.100:4000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ""),
      },
    },
  },
});