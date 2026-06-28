import { defineConfig } from "vite";
import { cpSync } from "node:fs";
import { resolve } from "node:path";

function copyStaticAssets() {
  return {
    name: "copy-static-assets",
    closeBundle() {
      cpSync(resolve("assets"), resolve("dist/assets"), {
        recursive: true,
        force: true,
      });
      cpSync(resolve("docs/demo"), resolve("dist/docs/demo"), {
        recursive: true,
        force: true,
      });
    },
  };
}

export default defineConfig({
  root: ".",
  base: "./",
  publicDir: false,
  plugins: [copyStaticAssets()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    open: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "esnext",
  },
});
