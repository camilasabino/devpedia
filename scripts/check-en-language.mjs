#!/usr/bin/env node
// Flags likely Spanish left over in the English edition: in the English guide sources
// and in the rendered English pages. Build first; a missing dist/ directory is skipped.
// Some Spanish is legitimate (the example domain's proper nouns, Argentine and Chilean
// tax document names), so the allowlist below records each accepted exception rather
// than widening the check.

import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;

// Words that are Spanish but belong in the English edition.
const ALLOWED = new Set([
  'andesshop',
  'reservaresto',
  'patagoniaenvíos',
  'patagoniaenvios',
  'envíos',
  'boleta',
  'electrónica',
  'factura',
  'correo',
  'argentino',
  'español',
]);

// Cheap Spanish markers: accented letters, inverted punctuation, and a few
// high-frequency function words that never appear in English prose.
const ACCENTED = /[áéíóúüñ¿¡]/i;
const FUNCTION_WORDS =
  /\b(el|la|los|las|un|una|unos|unas|del|al|que|para|por|con|sin|como|pero|porque|cuando|donde|este|esta|esto|esos|esas|todo|toda|más|muy|ser|está|están|hay|tiene|tienen|puede|pueden|debe|deben|hacer|desde|entre|sobre|también|sólo|solo|cada|otro|otra|mismo|misma)\b/i;

function walk(dir, filter) {
  const out = [];
  if (!existsSync(dir)) {
    return out;
  }
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...walk(path, filter));
    } else if (filter(name)) {
      out.push(path);
    }
  }
  return out;
}

const findings = [];

function scanText(label, text) {
  for (const [index, line] of text.split('\n').entries()) {
    const stripped = line.replace(/`[^`]*`/g, '').replace(/https?:\/\/\S+/g, '');
    // Mermaid node ids are short uppercase tokens ("AL", "EL"); lowercasing them
    // would otherwise read as Spanish function words.
    const words = (stripped.match(/[\p{L}]+/gu) ?? [])
      .filter((word) => word !== word.toUpperCase() || word.length > 3)
      .map((word) => word.toLowerCase());
    const suspicious = words.filter(
      (word) => !ALLOWED.has(word) && (ACCENTED.test(word) || FUNCTION_WORDS.test(` ${word} `)),
    );
    if (suspicious.length > 0) {
      findings.push(
        `${label}:${index + 1}  ${[...new Set(suspicious)].join(', ')}  |  ${line.trim().slice(0, 110)}`,
      );
    }
  }
}

for (const path of walk(join(ROOT, 'src/content/guides/en'), (n) => n.endsWith('.mdx'))) {
  scanText(relative(ROOT, path), readFileSync(path, 'utf8'));
}

// The rendered English pages catch interface strings the sources can't.
const renderedPages = walk(join(ROOT, 'dist/en'), (n) => n.endsWith('.html'));
for (const path of renderedPages) {
  const html = readFileSync(path, 'utf8');
  const visible = html
    .replace(/<script[\s\S]*?<\/script>/g, ' ')
    .replace(/<style[\s\S]*?<\/style>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ');
  scanText(relative(ROOT, path), visible);
}

if (findings.length > 0) {
  console.error(`${findings.length} line(s) with possible Spanish left in the English editions:`);
  for (const finding of findings) {
    console.error(`  - ${finding}`);
  }
  process.exit(1);
}

console.log('OK — no unexpected Spanish found in the English editions.');
