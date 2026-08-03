import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

function emitPortableHtml(): Plugin {
  return {
    name: "nindova-portable-html",
    async closeBundle() {
      const assetDirectory = resolve("dist/assets");
      const spriteSource = resolve("assets/focal-sprites.png");
      const spriteOutput = resolve(assetDirectory, "focal-sprites.png");
      await mkdir(assetDirectory, { recursive: true });
      await copyFile(spriteSource, spriteOutput);

      const indexPath = resolve("dist/index.html");
      const html = await readFile(indexPath, "utf8");
      const sprite = await readFile(spriteSource);
      const portable = html.replace(
        "./assets/focal-sprites.png",
        `data:image/png;base64,${sprite.toString("base64")}`,
      );
      if (portable === html) throw new Error("Portable sprite reference was not inlined");
      await writeFile(resolve("dist/nindova.html"), portable);
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
