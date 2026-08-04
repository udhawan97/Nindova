"use strict";

const CACHE_PREFIX = "nindova-session-";
const CACHE_NAME = `${CACHE_PREFIX}v5`;
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/nindova-icon.svg",
  "./assets/pwa-192.png",
  "./assets/pwa-512.png",
  "./assets/pwa-maskable-512.png",
];
const PRECACHE_URLS = new Set(PRECACHE.map((entry) => new URL(entry, self.location.href).href));

function canonicalPrecacheUrl(request) {
  const url = new URL(request.url);
  url.search = "";
  url.hash = "";
  return PRECACHE_URLS.has(url.href) ? url.href : null;
}

async function matchOwned(request) {
  if (!request) return undefined;
  const cache = await caches.open(CACHE_NAME);
  return cache.match(request);
}

async function refreshFromNetwork(request) {
  const response = await fetch(request);
  const cacheUrl = canonicalPrecacheUrl(request);
  if (cacheUrl && !response.ok) {
    const cached = await matchOwned(cacheUrl);
    if (cached) return cached;
  }
  if (cacheUrl && response.ok) {
    try {
      const cache = await caches.open(CACHE_NAME);
      const cacheTargets = request.mode === "navigate"
        ? [new URL("./", self.location.href).href, new URL("./index.html", self.location.href).href]
        : [cacheUrl];
      await Promise.all(cacheTargets.map((target) => cache.put(target, response.clone())));
    } catch {
      // A full or unavailable cache must never replace a valid network response.
    }
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys
        .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
        .map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(refreshFromNetwork(request).catch(async () => (
      await matchOwned(canonicalPrecacheUrl(request)) || matchOwned("./index.html")
    )));
    return;
  }

  const cacheUrl = canonicalPrecacheUrl(request);
  if (!cacheUrl) return;
  event.respondWith(refreshFromNetwork(request).catch(() => matchOwned(cacheUrl)));
});
