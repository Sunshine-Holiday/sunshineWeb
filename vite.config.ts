import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  // define: {
  //   global: 'window', // Define `global` to point to `window` in the browser
  // },
  assetsInclude: ['**/*.MP4'],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: ['react-quill'],
    exclude: ["lucide-react"],
  },

  
  server: {
    host: true,
    proxy: {
      // Fallback if frontend ever uses relative /api/v1 paths
      "/api/v1": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});