import { defineConfig } from "vite";
import { fileURLToPath, URL } from "node:url";
export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    port: 4400,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:8001" },
  },
  preview: {
    port: 4400,
    strictPort: true,
    proxy: { "/api": "http://127.0.0.1:8001" },
  },
});
