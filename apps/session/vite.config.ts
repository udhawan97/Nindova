import { copyFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

function emitPortableHtml(): Plugin {
  return {
    name: "nindova-portable-html",
    async closeBundle() {
      await copyFile(resolve("dist/index.html"), resolve("dist/nindova.html"));
    },
  };
}

export default defineConfig({
  base: "./",
  build: {
    assetsInlineLimit: 0,
    emptyOutDir: true,
  },
  plugins: [emitPortableHtml()],
});
