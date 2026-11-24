import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const upstream = env.TARS_UPSTREAM?.replace(/\/$/, "");
  const proxy = upstream
    ? {
        "/api": { target: upstream, changeOrigin: true, secure: true },
        "/stream": { target: upstream, changeOrigin: true, secure: true },
      }
    : undefined;

  return {
    server: {
      port: 5173,
      host: "127.0.0.1",
      strictPort: true,
      proxy,
    },
    publicDir: "public",
  };
});