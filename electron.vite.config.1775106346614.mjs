// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
var electron_vite_config_default = defineConfig({
  main: {
    assetsInclude: ["**/*.glb", "**/*.hdr"]
  },
  preload: {
    assetsInclude: ["**/*.glb", "**/*.hdr"]
  },
  renderer: {
    assetsInclude: ["**/*.glb", "**/*.hdr"],
    publicDir: "./src/renderer/src/assets",
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@/components": resolve("@/components"),
        "@/hooks": resolve("@/hooks"),
        "@/resources": resolve("./resources"),
        "@/lib": resolve("@/lib")
      }
    },
    plugins: [
      //
      react(),
      tailwindcss(),
      {
        name: "configure-response-headers",
        configureServer: (server) => {
          server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            next();
          });
        }
      }
    ]
  }
});
export {
  electron_vite_config_default as default
};
