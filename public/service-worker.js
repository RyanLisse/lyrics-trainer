/* eslint-env serviceworker */
/// <reference lib="webworker" />
/**
 * @typedef {Event & {waitUntil: (promise: Promise<any>) => void}} ExtendableEvent
 * @typedef {Event & {request: Request, respondWith: (r: Promise<Response> | Response) => void}} FetchEvent
 */

// Bump the version whenever ASSETS changes so old caches are dropped.
const CACHE   = 'lyrics-trainer-v2';

// App shell. Every entry must exist: cache.addAll() rejects (and the
// install fails) if a single request 404s. The original list referenced
// a non-existent './lyrics.json', which silently disabled offline mode.
const ASSETS  = [
    './', './index.html', './style.css', './playlist-styles.css',
    './script.js', './lyrics-core.js',
    './playlist-api.js', './playlist-component.js',
    './manifest.json', './icon-192.png', './icon-512.png',
    './lyrics-list.json',
    './lyrics/sonnet_18.txt', './lyrics/casey_at_the_bat.txt'
];

// Lyrics and the playlist index change often: prefer the network, fall back to cache.
const isFreshContent = (url) =>
    url.pathname.endsWith('.txt') || url.pathname.endsWith('lyrics-list.json');

// install: cache app shell
/** @param {ExtendableEvent} e */
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE).then((c) => c.addAll(ASSETS))
    );
});

// activate: delete caches from older versions
/** @param {ExtendableEvent} e */
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
        )
    );
});

// network-first for lyrics, cache-first otherwise
/** @param {FetchEvent} e */
self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;

    e.respondWith(
        (async () => {
            if (isFreshContent(url)) {
                try {
                    const net = await fetch(req);
                    if (net.ok) {
                        const cache = await caches.open(CACHE);
                        // Store without the ?v= cache-buster so offline lookups match
                        await cache.put(url.origin + url.pathname, net.clone());
                    }
                    return net;
                } catch { /* offline: fall through to cache */ }
            }
            // The app adds ?v=<timestamp> to lyrics requests, so ignore the query string
            const cached = await caches.match(req, { ignoreSearch: true });
            return cached || fetch(req);
        })()
    );
});
