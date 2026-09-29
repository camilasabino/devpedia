#!/usr/bin/env node
// Checks every internal link in the built site: the target page exists, and when the
// link carries a fragment, the target page has an element with that id. Run it after
// `npm run build`.
//
// Heading ids are generated from the heading text, so translating a guide changes its
// anchors — this is what catches an English guide still pointing at a Spanish fragment.
//
// Checks dist/ by default; pass another build directory to check that one instead
// (`node scripts/check-links.mjs path/to/dist`). Links to other origins are not followed.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const DIST = process.argv[2] ? resolve(process.argv[2]) : join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.error(`${DIST} not found — build the site first.`);
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...walk(path));
    } else if (name.endsWith('.html')) {
      out.push(path);
    }
  }
  return out;
}

const pages = walk(DIST);
const idsByRoute = new Map();

const routeOf = (path) => {
  const rel = relative(DIST, path).replaceAll('\\', '/');
  return `/${rel.replace(/index\.html$/, '')}`;
};

for (const path of pages) {
  const html = readFileSync(path, 'utf8');
  const ids = new Set();
  for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
    ids.add(match[1]);
  }
  idsByRoute.set(routeOf(path), ids);
}

const problems = [];

for (const path of pages) {
  const route = routeOf(path);
  const html = readFileSync(path, 'utf8');
  for (const match of html.matchAll(/\shref="(\/[^"]*)"/g)) {
    const href = match[1];
    if (href.startsWith('//')) {
      continue;
    }
    const [target, fragment] = href.split('#');
    const targetRoute = target === '' ? route : target.endsWith('/') ? target : `${target}/`;

    if (target !== '') {
      const isFile = /\.[a-z0-9]+$/i.test(target);
      if (isFile) {
        if (!existsSync(join(DIST, target.slice(1)))) {
          problems.push(`${route} -> missing file ${target}`);
        }
        continue;
      }
      if (!idsByRoute.has(targetRoute)) {
        problems.push(`${route} -> missing page ${targetRoute}`);
        continue;
      }
    }

    if (fragment) {
      const ids = idsByRoute.get(targetRoute);
      if (ids && !ids.has(decodeURIComponent(fragment))) {
        problems.push(`${route} -> missing anchor ${targetRoute}#${fragment}`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`${problems.length} broken internal link(s):`);
  for (const problem of [...new Set(problems)].sort()) {
    console.error(`  - ${problem}`);
  }
  process.exit(1);
}

console.log(`OK — every internal link and anchor resolves across ${pages.length} pages.`);
