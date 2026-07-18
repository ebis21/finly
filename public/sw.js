// Service worker Finly — konserwatywny, bezpieczny dla wdrożonej strony.
// Strategia: nawigacje = sieć najpierw (offline -> powłoka z cache);
// zasoby statyczne (hash w nazwie) = cache najpierw + odświeżanie w tle.
// Zapytania do innych domen (np. Supabase) są ignorowane.
const CACHE = "finly-v1";
const APP_SHELL = ["/", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => undefined)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

function putInCache(request, response) {
  const copy = response.clone();
  caches
    .open(CACHE)
    .then((cache) => cache.put(request, copy))
    .catch(() => undefined);
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // np. Supabase — nie ruszamy

  // Nawigacje: sieć najpierw (świeże dane online), offline -> powłoka z cache.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          putInCache(request, response);
          return response;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match("/"))
        )
    );
    return;
  }

  // Zasoby statyczne z hashem w nazwie: cache najpierw, w tle odśwież.
  const isStatic =
    url.pathname.startsWith("/_next/static") ||
    url.pathname.startsWith("/icon-") ||
    url.pathname === "/logo.png";
  if (isStatic) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request)
          .then((response) => {
            putInCache(request, response);
            return response;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});
