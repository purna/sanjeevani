const STORY_CACHE_VERSION = 'v5';
const STORY_SCOPE = new URL('./', self.location.href);
const STORY_FOLDER = STORY_SCOPE.pathname.split('/').filter(Boolean).pop() || 'story';
const STORY_CACHE = `${STORY_FOLDER}-comic-${STORY_CACHE_VERSION}`;

function localPath(entry) {
  const prefix = `${STORY_FOLDER}/`;
  return entry.startsWith(prefix) ? entry.slice(prefix.length) : entry;
}

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(STORY_CACHE);
    let manifest = { urls: [] };
    try {
      const response = await fetch('precache-manifest.json');
      if (response.ok) manifest = await response.json();
      else console.warn('precache-manifest.json not found, skipping precache');
    } catch (error) {
      console.warn('Failed to load precache-manifest.json:', error);
    }
    for (const entry of manifest.urls || []) {
      const request = new URL(localPath(entry), STORY_SCOPE);
      try {
        const asset = await fetch(request);
        if (asset.ok) await cache.put(request, asset.clone());
      } catch (error) {
        // Silent: assets may not be reachable on file:// or in dev
      }
    }
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name !== STORY_CACHE && name !== 'story-downloads-v1').map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(STORY_SCOPE.pathname)) return;

  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).catch(async () =>
      (await caches.match(event.request)) ||
      (await caches.match(new URL('index.html', STORY_SCOPE)))
    ));
    return;
  }

  // For data/precache manifest fetches, always go to network (don't serve stale)
  if (url.pathname.includes('/precache-manifest.json') || url.pathname.includes('/data/manifest.json')) {
    return;
  }

  event.respondWith(caches.match(event.request, { ignoreSearch: true }).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) {
      const clone = response.clone();
      caches.open(STORY_CACHE).then(cache => cache.put(event.request, clone));
    }
    return response;
  })));
});
