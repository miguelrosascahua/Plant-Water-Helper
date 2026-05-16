self.addEventListener("install", event => {
  console.log("Plant Water Helper installed");
});

self.addEventListener("fetch", event => {
  event.respondWith(fetch(event.request));
});
