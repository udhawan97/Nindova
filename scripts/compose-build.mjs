import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const output = resolve(root, "dist");
const siteOutput = resolve(root, "apps/site/dist");
const sessionOutput = resolve(root, "apps/session/dist");

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(siteOutput, output, { recursive: true });
await mkdir(resolve(output, "play"), { recursive: true });
await cp(resolve(sessionOutput, "index.html"), resolve(output, "play/index.html"));
await cp(resolve(sessionOutput, "assets"), resolve(output, "play/assets"), { recursive: true });
await cp(resolve(sessionOutput, "night-core.js"), resolve(output, "play/night-core.js"));
await cp(resolve(sessionOutput, "dawn-core.js"), resolve(output, "play/dawn-core.js"));
await cp(resolve(sessionOutput, "manifest.webmanifest"), resolve(output, "play/manifest.webmanifest"));
await cp(resolve(sessionOutput, "sw.js"), resolve(output, "play/sw.js"));
await cp(resolve(sessionOutput, "nindova.html"), resolve(output, "nindova.html"));

console.log("Composed dist/: landing, docs, /play/, and nindova.html");
