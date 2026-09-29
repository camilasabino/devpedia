const CONTAINED_LENGTH_RATIO = 0.7;
const TYPO_RATIO = 0.25;

export function normalizeSearchText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

export function tokenizeSearchText(value: string): string[] {
  const withBoundaries = value
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
  return normalizeSearchText(withBoundaries).match(/[\p{L}\p{N}]+/gu) ?? [];
}

export function termMatchesCandidate(queryTerm: string, candidate: string): boolean {
  if (!queryTerm || !candidate) return false;
  if (candidate.includes(queryTerm)) return true;
  if (queryTerm.includes(candidate) && candidate.length / queryTerm.length >= CONTAINED_LENGTH_RATIO) {
    return true;
  }
  const maxEdits = Math.max(1, Math.floor(queryTerm.length * TYPO_RATIO));
  return levenshtein(queryTerm, candidate) <= maxEdits;
}

export function pagefindResultMatchesQuery(
  query: string,
  data: { excerpt?: string; content?: string; meta?: { title?: string } },
): boolean {
  const terms = tokenizeSearchText(query).filter((term) => term.length >= 2);
  if (terms.length === 0) return true;

  const excerpt = stripTags(data.excerpt ?? '');
  const candidates = [
    ...tokenizeSearchText(excerpt),
    ...tokenizeSearchText(data.meta?.title ?? ''),
    ...tokenizeSearchText(data.content ?? ''),
  ];
  if (candidates.length === 0) return false;

  return terms.every((term) => candidates.some((candidate) => termMatchesCandidate(term, candidate)));
}

function stripTags(value: string): string {
  return value.replace(/<[^>]+>/g, ' ');
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const row = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    let previous = i - 1;
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const current = row[j];
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, previous + cost);
      previous = current;
    }
  }
  return row[b.length];
}
