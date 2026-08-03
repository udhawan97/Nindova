import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import ts from "typescript";
import { defineConfig, type Plugin } from "vite";

async function emitTypedModule(source: string, output: string) {
  const code = await readFile(source, "utf8");
  const result = ts.transpileModule(code, {
    fileName: source,
    reportDiagnostics: true,
    compilerOptions: {
      target: ts.ScriptTarget.ES2024,
      module: ts.ModuleKind.ES2022,
    },
  });
  const errors = result.diagnostics?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error) ?? [];
  if (errors.length) throw new Error(`TypeScript emit failed for ${source}`);
  await writeFile(output, result.outputText);
}

function emitPortableHtml(): Plugin {
  return {
    name: "nindova-portable-html",
    async closeBundle() {
      const assetDirectory = resolve("dist/assets");
      const nightCoreSource = resolve("src/night-core.ts");
      const rasoiCoreSource = resolve("src/rasoi-core.ts");
      const dawnCoreSource = resolve("src/dawn-core.ts");
      const manifestSource = resolve("manifest.webmanifest");
      const workerSource = resolve("sw.js");
      const iconSource = resolve("assets/nindova-icon.svg");
      await mkdir(assetDirectory, { recursive: true });
      await emitTypedModule(nightCoreSource, resolve("dist/night-core.js"));
      await emitTypedModule(rasoiCoreSource, resolve("dist/rasoi-core.js"));
      await emitTypedModule(dawnCoreSource, resolve("dist/dawn-core.js"));
      await copyFile(manifestSource, resolve("dist/manifest.webmanifest"));
      await copyFile(workerSource, resolve("dist/sw.js"));
      await copyFile(iconSource, resolve(assetDirectory, "nindova-icon.svg"));

      const indexPath = resolve("dist/index.html");
      const html = await readFile(indexPath, "utf8");
      const manifestNormalized = html.replace(
        /<link rel="manifest" href="[^"]+" data-portable-remove>/,
        '<link rel="manifest" href="./manifest.webmanifest">',
      );
      if (manifestNormalized === html) throw new Error("Installable manifest reference was not normalized");
      const moduleTag = manifestNormalized.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
      if (!moduleTag) throw new Error("Compiled Session module was not found");
      const modulePath = resolve("dist", moduleTag[1].replace(/^\.\//, ""));
      const moduleCode = (await readFile(modulePath, "utf8")).replaceAll("</script", "<\\/script");
      const installable = manifestNormalized.replace(moduleTag[0], `<script type="module">${moduleCode}</script>`);
      if (installable === manifestNormalized) throw new Error("Compiled Session module was not inlined");
      await writeFile(indexPath, installable);
      await rm(modulePath);
      const portable = installable
        .replace('<link rel="manifest" href="./manifest.webmanifest">', "")
        .replace(/<script data-portable-remove>[\s\S]*?<\/script>/, "");
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
