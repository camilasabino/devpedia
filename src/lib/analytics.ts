/**
 * Product analytics: DevPedia's event vocabulary and the one client-side path that
 * sends it to GA4.
 *
 * Events are declared in markup, not in per-component listeners:
 *
 *   - a page view event sits on `<body>` as `data-track-view` + `data-track-params`;
 *   - a tracked control carries `data-track` + `data-track-params`, and one delegated
 *     click listener (`initAnalytics`, run by BaseLayout) sends it.
 *
 * Only Search calls `track` directly, for the `search` event, which has no click.
 *
 * `track` is a no-op unless the GA bootstrap in BaseLayout defined `window.gtag`, which
 * it only does when GA_MEASUREMENT_ID is set, in production, on the canonical host. It
 * never throws: analytics must not break navigation, sharing or search.
 *
 * Parameters are conceptual ids and small enums, never slugs, paths, titles or search
 * text, so events pair across languages by id and carry no user-entered data.
 */

import type { Lang } from '@/i18n';
import type { GuideData, SubtopicData, TopicData } from './content-model';

export type PageKind = 'guide' | 'topic' | 'subtopic';
export type ShareMethod = 'copy' | 'linkedin' | 'x';

export interface EventParams {
  guide_view: { id: string; topic_id: string; subtopic_id?: string; lang: Lang };
  topic_view: { id: string; kind: 'topic' | 'subtopic'; topic_id?: string; lang: Lang };
  search: { lang: Lang; result_count: number };
  search_result_click: { id: string; kind: PageKind; lang: Lang; position: number };
  next_guide_click: { from_id: string; to_id: string; lang: Lang };
  share: { method: ShareMethod; id: string; lang: Lang };
  language_change: { from: Lang; to: Lang; id?: string; kind?: PageKind };
}

export type AnalyticsEvent = keyof EventParams;

/** One event with its parameters, as a value that can travel through markup. */
export type TrackedEvent = {
  [E in AnalyticsEvent]: { event: E; params: EventParams[E] };
}[AnalyticsEvent];
export type ViewEvent = Extract<TrackedEvent, { event: 'guide_view' | 'topic_view' }>;

const EVENTS: readonly AnalyticsEvent[] = [
  'guide_view',
  'topic_view',
  'search',
  'search_result_click',
  'next_guide_click',
  'share',
  'language_change',
];

export function guideView(
  guide: Pick<GuideData, 'id' | 'topic' | 'subtopic'>,
  lang: Lang,
): ViewEvent {
  return {
    event: 'guide_view',
    params: {
      id: guide.id,
      topic_id: guide.topic,
      ...(guide.subtopic && { subtopic_id: guide.subtopic }),
      lang,
    },
  };
}

export function topicView(
  node: Pick<TopicData, 'id'> | Pick<SubtopicData, 'id' | 'topic'>,
  lang: Lang,
): ViewEvent {
  return 'topic' in node
    ? { event: 'topic_view', params: { id: node.id, kind: 'subtopic', topic_id: node.topic, lang } }
    : { event: 'topic_view', params: { id: node.id, kind: 'topic', lang } };
}

/** The page a view event describes, which language_change reports as its `id`/`kind`. */
export function pageOf(view: ViewEvent): { id: string; kind: PageKind } {
  return view.event === 'guide_view'
    ? { id: view.params.id, kind: 'guide' }
    : { id: view.params.id, kind: view.params.kind };
}

/** Attributes that make a clickable element send `event` when it is activated. */
export function trackAttributes<E extends AnalyticsEvent>(
  event: E,
  params: EventParams[E],
): Record<string, string> {
  return { 'data-track': event, 'data-track-params': JSON.stringify(params) };
}

/** Attributes that make `<body>` send its view event once, when the page loads. */
export function viewAttributes(view: ViewEvent | undefined): Record<string, string> {
  return view
    ? { 'data-track-view': view.event, 'data-track-params': JSON.stringify(view.params) }
    : {};
}

/** Reads an event back from its attributes; anything malformed or unknown is ignored. */
export function readTracked(
  event: string | undefined,
  params: string | undefined,
): TrackedEvent | undefined {
  if (!event || !EVENTS.includes(event as AnalyticsEvent)) {
    return undefined;
  }
  try {
    const parsed: unknown = JSON.parse(params ?? '{}');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return undefined;
    }
    return { event, params: parsed } as TrackedEvent;
  } catch {
    return undefined;
  }
}

type Gtag = (command: 'event', name: string, params: object) => void;

function debugEnabled(): boolean {
  try {
    return localStorage.getItem('analytics-debug') === 'true';
  } catch {
    return false;
  }
}

/**
 * Sends one event to GA4 when analytics is active, and does nothing otherwise. With
 * `localStorage['analytics-debug'] = 'true'` every event is also logged to the console,
 * whether or not GA is loaded.
 */
export function track<E extends AnalyticsEvent>(event: E, params: EventParams[E]): void {
  try {
    if (debugEnabled()) {
      console.info('[analytics]', event, params);
    }
    const gtag = (globalThis as { gtag?: Gtag }).gtag;
    if (typeof gtag === 'function') {
      gtag('event', event, params);
    }
  } catch {
    // Analytics never interferes with the page.
  }
}

function send(tracked: TrackedEvent | undefined): void {
  if (tracked) {
    track(tracked.event, tracked.params as never);
  }
}

/**
 * Sends the page's view event and starts the delegated click listener. Called once per
 * page load by BaseLayout's module script, so neither can fire twice for one navigation.
 */
export function initAnalytics(doc: Document = document): void {
  const body = doc.body;
  send(readTracked(body.dataset.trackView, body.dataset.trackParams));

  doc.addEventListener('click', (event) => {
    const target =
      event.target instanceof Element ? event.target.closest<HTMLElement>('[data-track]') : null;
    if (target) {
      send(readTracked(target.dataset.track, target.dataset.trackParams));
    }
  });
}
