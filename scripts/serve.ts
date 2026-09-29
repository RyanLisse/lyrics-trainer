/**
 * Tiny static file server for public/ (replaces the `serve` npm package).
 * Usage: bun scripts/serve.ts [port]   (default 5173, or $PORT)
 */
import { join, normalize } from 'node:path';

const root = join(import.meta.dir, '..', 'public');
const port = Number(process.argv[2] ?? process.env.PORT ?? 5173);

const server = Bun.serve({
    port,
    hostname: '0.0.0.0', // reachable from phones on the same network
    async fetch(req) {
        const { pathname } = new URL(req.url);
        const rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
        const path = join(root, rel.endsWith('/') ? join(rel, 'index.html') : rel);
        if (!path.startsWith(root)) return new Response('Forbidden', { status: 403 });

        const file = Bun.file(path);
        if (!(await file.exists())) return new Response('Not found', { status: 404 });
        return new Response(file, { headers: { 'Cache-Control': 'no-cache' } });
    },
});

console.log(`Serving public/ at http://localhost:${server.port}`);
