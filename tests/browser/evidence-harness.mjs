import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

async function availablePort() {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    probe.once("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        reject(new Error("preview port probe returned no TCP address"));
        return;
      }
      probe.close(() => resolvePort(address.port));
    });
  });
}

async function startPreview({ root, previewRoot, port, environment = {}, readyText = "Nindova preview" }) {
  const selectedPort = port ?? await availablePort();
  const server = spawn(process.execPath, [resolve(root, "scripts/serve.mjs"), previewRoot], {
    cwd: root,
    env: { ...process.env, ...environment, NINDOVA_PREVIEW_PORT: String(selectedPort) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  await new Promise((resolveReady, reject) => {
    let stderr = "";
    const timer = setTimeout(() => reject(new Error(`preview server did not start: ${stderr.trim()}`)), 5_000);
    const fail = (error) => {
      clearTimeout(timer);
      reject(error);
    };
    server.once("error", fail);
    server.once("exit", (code) => fail(new Error(`preview server exited with ${code}: ${stderr.trim()}`)));
    server.stderr.on("data", (chunk) => { stderr += chunk.toString(); });
    server.stdout.on("data", (chunk) => {
      if (!chunk.toString().includes(readyText)) return;
      clearTimeout(timer);
      server.removeListener("error", fail);
      resolveReady();
    });
  });
  return { server, port: selectedPort };
}

async function stopPreview(server) {
  if (!server || server.exitCode !== null) return;
  const exited = new Promise((resolveExit) => server.once("exit", resolveExit));
  server.kill("SIGTERM");
  await Promise.race([exited, new Promise((resolveWait) => setTimeout(resolveWait, 2_000))]);
  if (server.exitCode === null) server.kill("SIGKILL");
}

function normalizeAdapter(adapter) {
  return typeof adapter === "function" ? { script: adapter, argument: undefined } : adapter;
}

export async function createBrowserEvidenceHarness({
  root,
  previewRoot,
  port,
  previewEnvironment,
  launchOptions = {},
  cleanup = [],
} = {}) {
  const preview = previewRoot ? await startPreview({ root, previewRoot, port, environment: previewEnvironment }) : null;
  const browser = await chromium.launch(launchOptions);
  const contexts = new Set();
  const errors = [];
  const requests = [];
  let closed = false;

  async function adapt(browserContext, candidate) {
    const adapter = normalizeAdapter(candidate);
    if (adapter.argument === undefined) await browserContext.addInitScript(adapter.script);
    else await browserContext.addInitScript(adapter.script, adapter.argument);
  }

  async function context(contextOptions = {}, adapters = []) {
    const browserContext = await browser.newContext(contextOptions);
    contexts.add(browserContext);
    browserContext.on("close", () => contexts.delete(browserContext));
    for (const adapter of adapters) await adapt(browserContext, adapter);
    return browserContext;
  }

  function watchPage(page, { errorPrefix = "" } = {}) {
    const pageErrors = [];
    const pageRequests = [];
    const recordError = (message) => {
      const entry = `${errorPrefix}${message}`;
      errors.push(entry);
      pageErrors.push(entry);
    };
    page.on("console", (message) => { if (message.type() === "error") recordError(message.text()); });
    page.on("pageerror", (error) => recordError(error.message));
    page.on("request", (request) => {
      requests.push(request.url());
      pageRequests.push(request.url());
    });
    return { errors: pageErrors, requests: pageRequests };
  }

  async function page(browserContext, options = {}) {
    const browserPage = await browserContext.newPage();
    const evidence = watchPage(browserPage, options);
    return { page: browserPage, ...evidence };
  }

  async function open({ contextOptions = {}, adapters = [], pageOptions = {}, target, gotoOptions } = {}) {
    const browserContext = await context(contextOptions, adapters);
    const opened = await page(browserContext, pageOptions);
    const response = target ? await opened.page.goto(target, gotoOptions) : null;
    return { context: browserContext, ...opened, response };
  }

  async function close() {
    if (closed) return;
    closed = true;
    await Promise.allSettled([...contexts].map((browserContext) => browserContext.close()));
    await browser.close();
    await stopPreview(preview?.server);
    for (const dispose of cleanup.toReversed()) await dispose();
  }

  return Object.freeze({
    get port() { return preview?.port ?? null; },
    get origin() { return preview ? `http://127.0.0.1:${preview.port}` : null; },
    errors,
    requests,
    adapt,
    context,
    page,
    open,
    watchPage,
    close,
  });
}
