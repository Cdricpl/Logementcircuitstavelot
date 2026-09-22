/* Service worker : rend le site installable et consultable hors ligne.

   Stratégie « réseau d'abord » : la page fraîche gagne toujours, le cache
   ne sert que de secours quand la connexion manque. version.json n'est
   jamais mis en cache — c'est lui qui déclenche le rafraîchissement
   automatique, un cache le rendrait aveugle aux nouvelles versions.

   Le nom du cache porte l'identifiant du déploiement : chaque mise en
   ligne crée un cache neuf et efface les précédents. */
var CACHE = 'stavelot-__BUILD_ID__';

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(['./', './manifest.webmanifest', './icone-192.png', './icone-512.png']);
    }).then(function () { return self.skipWaiting() })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (cles) {
      return Promise.all(cles.map(function (k) { return k === CACHE ? null : caches.delete(k) }));
    }).then(function () { return self.clients.claim() })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== location.origin) return;            /* polices, Google Maps : au réseau */
  if (url.pathname.indexOf('version.json') >= 0) return; /* jamais en cache */
  e.respondWith(
    fetch(req).then(function (res) {
      if (res && res.ok) {
        var copie = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copie) });
      }
      return res;
    }).catch(function () {
      return caches.match(req).then(function (r) { return r || caches.match('./') });
    })
  );
});
