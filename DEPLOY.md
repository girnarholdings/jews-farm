# Deploying jews.farm

Static site, no backend. Build output is `dist/`.

## Build
```bash
npm install
npm run build      # -> dist/
```

## Deploy
Upload `dist/` to any static host:
- **Cloudflare Pages / Netlify / Vercel**: point at the repo, build command `npm run build`, output dir `dist/`.
- **Plain server**: `scp -r dist/* deploy@jews.farm:/var/www/html/` (or set `root` to `dist/` in nginx).
- `base: './'` (vite.config.ts) keeps paths relative, so it works at a root or any subpath.

## Domain
Point `jews.farm` (A/AAAA or CNAME) at the host. Enable **HTTPS** — required for the PWA manifest and iOS "Add to Home Screen".

## Mobile / iOS WebKit
- Touch-first (tap/pan/pinch via pointer events), DPR-capped canvas, `viewport-fit=cover`, safe-area insets, `apple-mobile-web-app-capable`.
- PWA: `manifest.webmanifest` + `icons/apple-touch-icon.png` (180) + `icons/icon-512.png`.
- No service worker yet (online-only). Add one to enable offline + installable PWA.

## Performance
~14 kB gzip JS, procedural canvas art (zero image downloads), single canvas + dirty-region-capable render loop. Fast first load + 60fps.
