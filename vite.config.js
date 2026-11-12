import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

const projectRoot = import.meta.dirname;

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, projectRoot, ""), ...process.env };
  const apiTarget =
    env.API_PROXY_TARGET || `http://127.0.0.1:${env.PORT || 3000}`;

  return {
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@": path.resolve(projectRoot, "src") } },
    envDir: projectRoot,
    root: projectRoot,
    publicDir: path.resolve(projectRoot, "public"),
    build: {
      outDir: path.resolve(projectRoot, "dist"),
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.FRONTEND_PORT || 5173),
      strictPort: true,
      proxy: {
        "/api": { target: apiTarget, changeOrigin: true },
        "/uploads": { target: apiTarget, changeOrigin: true },
      },
      fs: { strict: true, deny: ["**/.*"] },
    },
  };
});
