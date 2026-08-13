import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
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

function emitHouseArtifacts(): Plugin {
  return {
    name: "nindova-house-artifacts",
    async closeBundle() {
      const assetDirectory = resolve("dist/assets");
      const brandAssetDirectory = resolve("../site/public/brand");
      await mkdir(assetDirectory, { recursive: true });
      await emitTypedModule(resolve("src/salon-catalog.ts"), resolve("dist/salon-catalog.js"));
      await emitTypedModule(resolve("src/classic-studies.ts"), resolve("dist/classic-studies.js"));
      await emitTypedModule(resolve("src/stack-architect.ts"), resolve("dist/stack-architect.js"));
      await emitTypedModule(resolve("src/salon-table-lifecycle.ts"), resolve("dist/salon-table-lifecycle.js"));
      await emitTypedModule(resolve("src/house-navigation.ts"), resolve("dist/house-navigation.js"));
      await emitTypedModule(resolve("src/house-state.ts"), resolve("dist/house-state.js"));
      await emitTypedModule(resolve("src/sector-sprint-session.ts"), resolve("dist/sector-sprint-session.js"));
      await emitTypedModule(resolve("src/house-session-codec.ts"), resolve("dist/house-session-codec.js"));
      await Promise.all(["pwa-192.png", "pwa-512.png", "pwa-maskable-512.png"].map((name) => (
        copyFile(resolve(brandAssetDirectory, name), resolve(assetDirectory, name))
      )));
      await copyFile(resolve(brandAssetDirectory, "favicon.svg"), resolve("dist/favicon.svg"));
      const files = (await readdir(resolve("dist"), { recursive: true, withFileTypes: true }))
        .filter((entry) => entry.isFile())
        .map((entry) => relative(resolve("dist"), resolve(entry.parentPath, entry.name)).replaceAll("\\", "/"))
        .filter((path) => path !== "sw.js")
        .sort()
        .map((path) => `./${path}`);
      const workerTemplate = await readFile(resolve("public/sw.js"), "utf8");
      const worker = workerTemplate.replace("__NINDOVA_PRECACHE__", JSON.stringify(["./", ...files]));
      if (worker === workerTemplate) throw new Error("House worker precache placeholder was not replaced");
      await writeFile(resolve("dist/sw.js"), worker);
    },
  };
}

export default defineConfig({
  base: "./",
  build: {
    assetsInlineLimit: 0,
    emptyOutDir: true,
  },
  plugins: [emitHouseArtifacts()],
});
