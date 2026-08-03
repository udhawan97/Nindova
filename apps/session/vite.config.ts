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
      const nightCoreSource = resolve("night-core.js");
      const dawnCoreSource = resolve("dawn-core.js");
      const manifestSource = resolve("manifest.webmanifest");
      const workerSource = resolve("sw.js");
      const iconSource = resolve("assets/nindova-icon.svg");
      await mkdir(assetDirectory, { recursive: true });
      await copyFile(spriteSource, spriteOutput);
      await copyFile(nightCoreSource, resolve("dist/night-core.js"));
      await copyFile(dawnCoreSource, resolve("dist/dawn-core.js"));
      await copyFile(manifestSource, resolve("dist/manifest.webmanifest"));
      await copyFile(workerSource, resolve("dist/sw.js"));
      await copyFile(iconSource, resolve(assetDirectory, "nindova-icon.svg"));

      const indexPath = resolve("dist/index.html");
      const html = await readFile(indexPath, "utf8");
      const installable = html.replace(
        /<link rel="manifest" href="[^"]+" data-portable-remove>/,
        '<link rel="manifest" href="./manifest.webmanifest">',
      );
      if (installable === html) throw new Error("Installable manifest reference was not normalized");
      await writeFile(indexPath, installable);
      const sprite = await readFile(spriteSource);
      const nightCore = await readFile(nightCoreSource, "utf8");
      const dawnCore = await readFile(dawnCoreSource, "utf8");
      const portable = installable.replace(
        "./assets/focal-sprites.png",
        `data:image/png;base64,${sprite.toString("base64")}`,
      )
        .replace('<script src="./night-core.js"></script>', `<script>${nightCore}</script>`)
        .replace('<script src="./dawn-core.js"></script>', `<script>${dawnCore}</script>`)
        .replace('<link rel="manifest" href="./manifest.webmanifest">', "")
        .replace(/\/\* The installable build is static[\s\S]*?\nif\(location\.protocol\.startsWith\('http'\)[\s\S]*?\n}\n/, "");
      if (portable === installable) throw new Error("Portable sprite reference was not inlined");
      if (portable.includes('<script src="./night-core.js"></script>')) throw new Error("Portable night core was not inlined");
      if (portable.includes('<script src="./dawn-core.js"></script>')) throw new Error("Portable Dawn core was not inlined");
      if (portable.includes("manifest.webmanifest") || portable.includes("serviceWorker.register")) throw new Error("Portable artifact retained PWA dependencies");
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
