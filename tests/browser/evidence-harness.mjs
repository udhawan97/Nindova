import { spawn } from "node:child_process";
import { createServer } from "node:net";
import { resolve } from "node:path";
import { chromium } from "@playwright/test";

async function availablePort() {
  return new Promise((resolvePort, reject) => {
    const probe = createServer();
    let settled = false;
    const finish = ({ error, port }) => {
      if (settled) return;
      settled = true;
      probe.removeListener("error", fail);
      const complete = (closeError) => {
        if (error || closeError) reject(error ?? closeError);
        else resolvePort(port);
      };
      if (probe.listening) probe.close(complete);
      else complete();
    };
    const fail = (error) => finish({ error });
    probe.once("error", fail);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (!address || typeof address === "string") {
        finish({ error: new Error("preview port probe returned no TCP address") });
        return;
      }
      finish({ port: address.port });
    });
  });
}

async function waitForPreviewReady(server, readyText) {
  await new Promise((resolveReady, reject) => {
    let stderr = "";
    const finish = (outcome, value) => {
      clearTimeout(timer);
      server.removeListener("error", fail);
      server.removeListener("exit", exit);
      server.stderr.removeListener("data", stderrData);
      server.stdout.removeListener("data", stdoutData);
      outcome(value);
    };
    const fail = (error) => finish(reject, error);
    const exit = (code) => fail(new Error(`preview server exited with ${code}: ${stderr.trim()}`));
    const stderrData = (chunk) => { stderr += chunk.toString(); };
    const stdoutData = (chunk) => {
      if (chunk.toString().includes(readyText)) finish(resolveReady);
    };
    const timer = setTimeout(
      () => fail(new Error(`preview server did not start: ${stderr.trim()}`)),
      5_000,
    );
    server.once("error", fail);
    server.once("exit", exit);
    server.stderr.on("data", stderrData);
    server.stdout.on("data", stdoutData);
  });
}

async function startPreview(
  { root, previewRoot, port, environment = {}, readyText = "Nindova preview" },
  { spawnProcess = spawn, awaitReady = waitForPreviewReady } = {},
) {
  const selectedPort = port ?? await availablePort();
  const server = spawnProcess(process.execPath, [resolve(root, "scripts/serve.mjs"), previewRoot], {
    cwd: root,
    env: { ...process.env, ...environment, NINDOVA_PREVIEW_PORT: String(selectedPort) },
    stdio: ["ignore", "pipe", "pipe"],
  });
  try {
    await awaitReady(server, readyText);
  } catch (error) {
    const cleanupErrors = await attemptAll([() => stopPreview(server)]);
    if (cleanupErrors.length > 0) {
      throw new AggregateError([error, ...cleanupErrors], "Preview startup and rollback both failed");
    }
    throw error;
  }
  return { server, port: selectedPort };
}

async function stopPreview(server) {
  if (!server) return;
  const hasExited = () => server.exitCode !== null || server.signalCode != null;
  if (hasExited()) return;
  const waitForExit = () => new Promise((resolveExit) => {
    const finish = (exited) => {
      clearTimeout(timer);
      server.removeListener("exit", onExit);
      resolveExit(exited);
    };
    const onExit = () => finish(true);
    const timer = setTimeout(() => finish(false), 2_000);
    server.once("exit", onExit);
    if (hasExited()) finish(true);
  });
  const termExit = waitForExit();
  server.kill("SIGTERM");
  if (await termExit || hasExited()) return;
  const killExit = waitForExit();
  server.kill("SIGKILL");
  if (await killExit || hasExited()) return;
  throw new Error("preview server did not exit after SIGKILL");
}

async function attemptAll(actions) {
  const failures = [];
  for (const action of actions) {
    try {
      await action();
    } catch (error) {
      failures.push(error);
    }
  }
  return failures;
}

function throwFailures(failures, message) {
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1) throw new AggregateError(failures, message);
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
} = {}, {
  spawnProcess = spawn,
  awaitPreviewReady = waitForPreviewReady,
  launchBrowser = (options) => chromium.launch(options),
} = {}) {
  let preview = null;
  let browser = null;
  try {
    preview = previewRoot
      ? await startPreview(
        { root, previewRoot, port, environment: previewEnvironment },
        { spawnProcess, awaitReady: awaitPreviewReady },
      )
      : null;
    browser = await launchBrowser(launchOptions);
  } catch (error) {
    const rollbackFailures = await attemptAll([
      () => browser?.close(),
      () => stopPreview(preview?.server),
      ...cleanup.toReversed(),
    ]);
    if (rollbackFailures.length > 0) {
      throw new AggregateError([error, ...rollbackFailures], "Browser evidence startup and rollback failed");
    }
    throw error;
  }
  const contexts = new Set();
  const errors = [];
  const requests = [];
  let closePromise = null;

  async function failClosed(error, message) {
    try {
      await close();
    } catch (teardownError) {
      const teardownFailures = teardownError instanceof AggregateError ? teardownError.errors : [teardownError];
      throw new AggregateError([error, ...teardownFailures], message);
    }
    throw error;
  }

  async function adapt(browserContext, candidate) {
    const adapter = normalizeAdapter(candidate);
    if (adapter.argument === undefined) await browserContext.addInitScript(adapter.script);
    else await browserContext.addInitScript(adapter.script, adapter.argument);
  }

  async function context(contextOptions = {}, adapters = []) {
    try {
      const browserContext = await browser.newContext(contextOptions);
      contexts.add(browserContext);
      browserContext.on("close", () => contexts.delete(browserContext));
      for (const adapter of adapters) await adapt(browserContext, adapter);
      return browserContext;
    } catch (error) {
      return failClosed(error, "Browser context acquisition and teardown failed");
    }
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
    try {
      const browserPage = await browserContext.newPage();
      const evidence = watchPage(browserPage, options);
      return { page: browserPage, ...evidence };
    } catch (error) {
      return failClosed(error, "Browser page acquisition and teardown failed");
    }
  }

  async function open({ contextOptions = {}, adapters = [], pageOptions = {}, target, gotoOptions } = {}) {
    const browserContext = await context(contextOptions, adapters);
    const opened = await page(browserContext, pageOptions);
    let response = null;
    if (target) {
      try {
        response = await opened.page.goto(target, gotoOptions);
      } catch (error) {
        return failClosed(error, "Browser navigation acquisition and teardown failed");
      }
    }
    return { context: browserContext, ...opened, response };
  }

  function close() {
    closePromise ??= (async () => {
      const failures = await attemptAll([
        ...[...contexts].map((browserContext) => () => browserContext.close()),
        () => browser.close(),
        () => stopPreview(preview?.server),
        ...cleanup.toReversed(),
      ]);
      throwFailures(failures, "Browser evidence teardown failed");
    })();
    return closePromise;
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
