const CACHE_NAME = "eurotrip-cache-v2"; // Incremente a versão para limpar o cache antigo
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/icon-192.png",
  "/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  // Tenta buscar na REDE primeiro para trazer sempre os dados atualizados
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        // Se a busca na rede deu certo, atualiza o cache e retorna a resposta nova
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return networkResponse;
      })
      .catch(() => {
        // Se falhar (ex: usuário estiver offline), busca do CACHE como alternativa
        return caches.match(event.request);
      })
  );
});
