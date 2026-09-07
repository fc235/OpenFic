importScripts("/sw-precache.js");

const CACHE_PREFIX = "openfic-shell-";
const CACHE_NAME = `${CACHE_PREFIX}${self.__OPENFIC_BUILD_ID || "legacy"}`;
const PRECACHE_PATHS = new Set(self.__PRECACHE_LIST || []);

const BACKEND_PATHS = [
  "/api/",
  "/socket.io/",
  "/covers/",
  "/icons/",
  "/character-images/",
  "/agent-attachments/",
];
const CACHEABLE_STATIC_PATHS = ["/assets/", "/fonts/", "/frontend-fonts/"];

self.addEventListener("install", (event) => {
  const precacheList = self.__PRECACHE_LIST || [];
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(precacheList))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

function isBackendRequest(url) {
  return BACKEND_PATHS.some((p) => url.pathname.startsWith(p));
}

function isCacheableStaticRequest(url) {
  return PRECACHE_PATHS.has(url.pathname) ||
    CACHEABLE_STATIC_PATHS.some((path) => url.pathname.startsWith(path));
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" && request.method !== "HEAD") {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (isBackendRequest(url)) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put("/index.html", copy));
          return response;
        })
        .catch(() => caches.match("/index.html")),
    );
    return;
  }

  if (!isCacheableStaticRequest(url)) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        return cached;
      }
      return fetch(request).then((response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
