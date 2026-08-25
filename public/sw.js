/*
 * オフラインでも開けるようにするための Service Worker。
 *
 * PRECACHE と CACHE の2行は、ビルド後に scripts/build-sw.mjs が
 * 実際のファイル一覧とビルドごとのハッシュに書き換える。
 * （書き換え前でもそのまま動く値を入れてあるので、dist を作らずに読んでも壊れない）
 */
const PRECACHE = ['./index.html']; /* build:precache */
const CACHE = 'smokefree-dev'; /* build:cache */

const SHELL = new URL('./index.html', self.location.href).toString();

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      // 1つでも取れなければ install ごと失敗するので、個別に握りつぶす
      await Promise.all(
        PRECACHE.map((path) =>
          cache.add(new Request(new URL(path, self.location.href), { cache: 'reload' })).catch(
            () => undefined,
          ),
        ),
      );
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;

  // 画面遷移はネットワーク優先。オフラインならキャッシュしたシェルを返す。
  if (req.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put(SHELL, fresh.clone());
          return fresh;
        } catch {
          const cache = await caches.open(CACHE);
          const cached = await cache.match(SHELL, { ignoreVary: true });
          return cached ?? Response.error();
        }
      })(),
    );
    return;
  }

  // JS/CSS/画像はキャッシュ優先。裏で新しいものを取り込んでおく。
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      // Vite の出力は crossorigin 付きで読み込まれ、配信側が Vary: Origin を返すことがある。
      // 事前キャッシュ時のリクエストとヘッダが揃わずヒットしなくなるので Vary は見ない。
      const hit = await cache.match(req, { ignoreVary: true });
      const fetching = fetch(req)
        .then((res) => {
          if (res.ok) cache.put(req, res.clone());
          return res;
        })
        .catch(() => hit);
      return hit ?? fetching;
    })(),
  );
});
