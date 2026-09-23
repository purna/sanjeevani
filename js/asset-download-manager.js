(function () {
  const memorySvg = new Map();
  const CACHE_NAME = 'story-downloads-v1';

  function storyFolder() {
    const parts = location.pathname.split('/').filter(Boolean);
    return /\.html?$/i.test(parts.at(-1) || '') ? (parts.at(-2) || '') : (parts.at(-1) || '');
  }

  function localize(entry) {
    const folder = storyFolder();
    return folder && entry.startsWith(`${folder}/`) ? entry.slice(folder.length + 1) : entry;
  }

  async function cacheFile(entry) {
    const local = localize(entry);
    const url = new URL(local, location.href);
    const cache = 'caches' in window ? await caches.open(CACHE_NAME) : null;
    if (cache && await cache.match(url, { ignoreSearch: true })) return { entry, cached: true };
    const response = await fetch(url);
    if (!response.ok) throw new Error(`${local} returned ${response.status}`);
    if (cache) await cache.put(url, response.clone());
    if (/\.svg(?:$|\?)/i.test(local)) memorySvg.set(local, await response.clone().text());
    return { entry, cached: false };
  }

  async function downloadFiles(entries, onProgress) {
    const unique = [...new Set((entries || []).filter(Boolean))];
    let completed = 0;
    const failures = [];
    const queue = [...unique];
    const workers = Array.from({ length: Math.min(6, queue.length || 1) }, async () => {
      while (queue.length) {
        const entry = queue.shift();
        try { await cacheFile(entry); }
        catch (error) { failures.push({ entry, error: error.message }); }
        completed += 1;
        if (onProgress) onProgress({ completed, total: unique.length, entry, failures: failures.length });
      }
    });
    await Promise.all(workers);
    return { completed, total: unique.length, failures };
  }

  async function prepare(options = {}) {
    const response = await fetch(options.manifestUrl || 'precache-manifest.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('The story download list could not be loaded.');
    const manifest = await response.json();
    return downloadFiles(manifest.urls || [], options.onProgress);
  }

  async function downloadAudio(entries) {
    return downloadFiles((entries || []).filter(entry => /\.(?:ogg|mp3|wav)(?:$|\?)/i.test(entry)));
  }

  async function getSvg(entry) {
    const local = localize(entry);
    if (memorySvg.has(local)) return memorySvg.get(local);
    const url = new URL(local, location.href);
    const cached = 'caches' in window ? await caches.match(url, { ignoreSearch: true }) : null;
    const response = cached || await fetch(url);
    if (!response.ok) throw new Error(`SVG unavailable: ${local}`);
    const text = await response.text();
    memorySvg.set(local, text);
    return text;
  }

  window.AssetDownloadManager = { prepare, downloadFiles, downloadAudio, getSvg, localize };
})();
