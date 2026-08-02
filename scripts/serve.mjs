import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { createServer } from "node:http";

const root = resolve(process.argv[2] ?? "dist");
const host = "127.0.0.1";
const port = Number(process.env.NINDOVA_PREVIEW_PORT ?? 4173);
const mime = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".woff2", "font/woff2"],
]);

createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${host}:${port}`);
  const decoded = decodeURIComponent(requestUrl.pathname);
  const candidate = resolve(root, `.${decoded}`);

  if (candidate !== root && !candidate.startsWith(`${root}${sep}`)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const info = await stat(candidate);
    const file = info.isDirectory() ? resolve(candidate, "index.html") : candidate;
    await stat(file);
    response.writeHead(200, {
      "Content-Type": mime.get(extname(file)) ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, host, () => {
  console.log(`Nindova preview: http://${host}:${port}`);
});
