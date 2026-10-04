
# sitemap-lastmod-from-git

Search engines learn to ignore `<lastmod>` when every URL shares the same date. This tiny script reads the last git commit date of each page file and writes a JSON map you can use when building your sitemap.

Built by [Veloce Digital](https://velocedigital.co). No dependencies.

## Usage
1. Copy `gen-page-dates.mjs` into your project's `scripts/` folder.
2. Add to `package.json`:
```json
   "scripts": {
     "dates": "node scripts/gen-page-dates.mjs",
     "prebuild": "node scripts/gen-page-dates.mjs"
   }
```
3. Run `npm run dates`. It writes `src/data/page-dates.json`:
```json
   { "index": "2026-10-02", "pricing": "2026-09-30" }
```
4. Read it in your sitemap endpoint, and omit `<lastmod>` when a page has no entry rather than inventing one:
```ts
   import pageDates from '../data/page-dates.json';
   const dates = pageDates as Record<string, string>;
   const lm = dates[path === '/' ? 'index' : path.replace(/^\//, '')];
   // <url><loc>...</loc>{lm && <lastmod>{lm}</lastmod>}</url>
```

## Behaviour
- Files with uncommitted changes get today's date.
- On a shallow clone (some CI hosts) the script skips and keeps the committed JSON, so builds never break and never get invented dates. Run it locally and commit the JSON.
- Assumes pages live in `src/pages/*.astro`. Change `PAGES` at the top of the script for other layouts.

## License
MIT
