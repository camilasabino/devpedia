// The query text only identifies a settled search, so the same one is reported once.
// Flushing returns a result count and never the query.

export interface SettledSearchState {
  pending: { query: string; resultCount: number } | null;
  reportedQuery: string;
}

export interface SettledSearchReport {
  resultCount: number;
}

export interface FlushedSearch {
  state: SettledSearchState;
  report: SettledSearchReport | null;
}

export function initialSettledSearch(): SettledSearchState {
  return { pending: null, reportedQuery: '' };
}

export function notePendingSearch(
  state: SettledSearchState,
  query: string,
  resultCount: number,
): SettledSearchState {
  return {
    ...state,
    pending: { query: query.trim().toLowerCase(), resultCount },
  };
}

export function clearPendingSearch(state: SettledSearchState): SettledSearchState {
  if (!state.pending) {
    return state;
  }
  return { ...state, pending: null };
}

export function flushSettledSearch(state: SettledSearchState): FlushedSearch {
  const pending = state.pending;
  if (!pending) {
    return { state, report: null };
  }
  if (pending.query === state.reportedQuery) {
    return { state: { ...state, pending: null }, report: null };
  }
  return {
    state: { pending: null, reportedQuery: pending.query },
    report: { resultCount: pending.resultCount },
  };
}
