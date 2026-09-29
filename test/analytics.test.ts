import { afterEach, describe, expect, it, vi } from 'vitest';
import { ContentIndex } from '../src/lib/content-model';
import {
  guideView,
  pageOf,
  readTracked,
  topicView,
  track,
  trackAttributes,
  viewAttributes,
} from '../src/lib/analytics';
import { loadModel } from './real-content';

const index = new ContentIndex(loadModel());

describe('view events', () => {
  it('identify a guide by its conceptual id, never by its localized slug', () => {
    // The Spanish slug of `creational-patterns` is `patrones-creacionales`.
    const guide = index.guide('es', 'creational-patterns')!;
    expect(guide.slug).not.toBe(guide.id);
    expect(guideView(guide, 'es')).toEqual({
      event: 'guide_view',
      params: { id: 'creational-patterns', topic_id: 'design', subtopic_id: 'design-patterns', lang: 'es' },
    });
  });

  it('omit subtopic_id for a guide directly under its topic', () => {
    const { params } = guideView(index.guide('en', 'architectural-drivers')!, 'en');
    expect(params).toEqual({ id: 'architectural-drivers', topic_id: 'architecture', lang: 'en' });
  });

  it('are the same in both editions except for lang', () => {
    for (const guide of index.model.es.guides) {
      const es = guideView(guide, 'es').params;
      const en = guideView(index.guide('en', guide.id)!, 'en').params;
      expect({ ...es, lang: 'en' }).toEqual(en);
    }
  });

  it('distinguish topics from subtopics with an explicit kind', () => {
    expect(topicView(index.topic('es', 'testing')!, 'es')).toEqual({
      event: 'topic_view',
      params: { id: 'testing', kind: 'topic', lang: 'es' },
    });
    expect(topicView(index.subtopic('en', 'claude-code')!, 'en')).toEqual({
      event: 'topic_view',
      params: { id: 'claude-code', kind: 'subtopic', topic_id: 'ai-engineering', lang: 'en' },
    });
  });

  it('name the page they describe', () => {
    expect(pageOf(guideView(index.guide('es', 'solid')!, 'es'))).toEqual({ id: 'solid', kind: 'guide' });
    expect(pageOf(topicView(index.subtopic('es', 'claude-code')!, 'es'))).toEqual({ id: 'claude-code', kind: 'subtopic' });
  });
});

describe('event attributes', () => {
  it('round-trip through markup with their types intact', () => {
    const attrs = trackAttributes('search_result_click', { id: 'solid', kind: 'guide', lang: 'en', position: 3 });
    expect(attrs['data-track']).toBe('search_result_click');
    expect(readTracked(attrs['data-track'], attrs['data-track-params'])).toEqual({
      event: 'search_result_click',
      params: { id: 'solid', kind: 'guide', lang: 'en', position: 3 },
    });
  });

  it('put a view event on the page, and nothing when there is none', () => {
    const attrs = viewAttributes(topicView(index.topic('en', 'design')!, 'en'));
    expect(readTracked(attrs['data-track-view'], attrs['data-track-params'])?.event).toBe('topic_view');
    expect(viewAttributes(undefined)).toEqual({});
  });

  it('ignore unknown events and malformed parameters', () => {
    expect(readTracked('page_view', '{}')).toBeUndefined();
    expect(readTracked(undefined, '{}')).toBeUndefined();
    expect(readTracked('share', '{not json')).toBeUndefined();
    expect(readTracked('share', '[]')).toBeUndefined();
  });
});

describe('track', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing and does not throw when GA is not loaded', () => {
    expect(() => track('share', { method: 'copy', id: 'solid', lang: 'es' })).not.toThrow();
  });

  it('sends the event through gtag when it exists', () => {
    const gtag = vi.fn();
    vi.stubGlobal('gtag', gtag);
    track('next_guide_click', { from_id: 'solid', to_id: 'general-design-principles', lang: 'es' });
    expect(gtag).toHaveBeenCalledOnce();
    expect(gtag).toHaveBeenCalledWith('event', 'next_guide_click', {
      from_id: 'solid',
      to_id: 'general-design-principles',
      lang: 'es',
    });
  });

  it('swallows a failing gtag', () => {
    vi.stubGlobal('gtag', () => {
      throw new Error('blocked');
    });
    expect(() => track('search', { lang: 'en', result_count: 0 })).not.toThrow();
  });
});
