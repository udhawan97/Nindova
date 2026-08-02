import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const root = resolve(import.meta.dirname, "..");
const tempParent = resolve(root, ".tmp");
const output = resolve(root, "artifacts/seed-observational");
const sourcePath = resolve(root, "reference/test-demo.mjs");
const seedPath = resolve(root, "reference/nindova-demo.html");

await mkdir(tempParent, { recursive: true });
await mkdir(output, { recursive: true });
const temp = await mkdtemp(resolve(tempParent, "seed-observational-"));
const disposablePath = resolve(temp, "test-demo.mjs");

const source = await readFile(sourcePath, "utf8");
const suppliedTarget = source.match(/page\.goto\('([^']+)'\)/)?.[1];
if (!suppliedTarget?.startsWith("file://")) {
  throw new Error("The supplied observational test no longer has the expected local file target");
}
const portable = source
  .replace(suppliedTarget, pathToFileURL(seedPath).href)
  .replaceAll("path: 'shots/", `path: '${output}/`);

await writeFile(disposablePath, portable, "utf8");

const child = spawn(process.execPath, [disposablePath], {
  cwd: temp,
  env: { ...process.env, NO_PROXY: "*" },
  shell: false,
  stdio: ["ignore", "pipe", "pipe"],
});

let transcript = "";
child.stdout.on("data", (chunk) => {
  const text = chunk.toString();
  transcript += text;
  process.stdout.write(text);
});
child.stderr.on("data", (chunk) => {
  const text = chunk.toString();
  transcript += text;
  process.stderr.write(text);
});

const exitCode = await new Promise((done) => child.on("close", done));
await writeFile(resolve(output, "run.log"), transcript, "utf8");

if (!temp.startsWith(`${tempParent}/`)) {
  throw new Error("Refusing to remove an observational temp directory outside .tmp");
}
await rm(temp, { recursive: true, force: true });

if (exitCode !== 0) process.exitCode = Number(exitCode ?? 1);
