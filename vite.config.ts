import { defineConfig } from "vite";

export default defineConfig({
  server: {
    proxy: {
      "/api/xc": {
        target: "https://xeno-canto.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/xc/, "/api/3/recordings"),
      },
      "/audio/xc": {
        target: "https://xeno-canto.org",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/audio\/xc/, ""),
      },
    },
  },
});
