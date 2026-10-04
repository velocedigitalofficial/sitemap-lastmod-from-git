// Writes src/data/page-dates.json: { "<page file name without extension>": "YYYY-MM-DD" }
// using the date of the last git commit that touched that page's source file.
import { execSync } from 'node:child_process';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const PAGES = 'src/pages';
const OUT = 'src/data/page-dates.json';
const sh = (c) => execSync(c, { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();

try {
  if (sh('git rev-parse --is-shallow-repository') === 'true') throw new Error('shallow clone');
} catch (e) {
  console.log(`[page-dates] skipped (${e.message}); keeping existing ${OUT}`);
  process.exit(0);
}

const today = new Date().toISOString().slice(0, 10);
const dirty = new Set(
  sh('git status --porcelain -- ' + PAGES)
    .split('\n').filter(Boolean)
    .map((l) => l.slice(3).trim().replace(/^.*-> /, ''))
);
const out = {};
for (const f of readdirSync(PAGES).filter((f) => f.endsWith('.astro')).sort()) {
  const path = join(PAGES, f);
  const d = dirty.has(path) ? today : sh(`git log -1 --format=%cs -- "${path}"`);
  if (d) out[f.replace(/\.astro$/, '')] = d;
}
mkdirSync('src/data', { recursive: true });
const next = JSON.stringify(out, null, 2) + '\n';
if (!existsSync(OUT) || readFileSync(OUT, 'utf8') !== next) writeFileSync(OUT, next);
console.log(`[page-dates] ${Object.keys(out).length} pages written to ${OUT}`);
