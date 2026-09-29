import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob, type Loader } from 'astro/loaders';

// Identity comes from the `id` field, never from the file path or the slug: by default
// the glob loader would adopt a `slug` field as the entry id. See src/lib/content-model.ts
// for what id, slug and order each mean. The build and the unit tests validate the
// cross-entry rules (pairing, references, uniqueness); these schemas only cover the
// shape of a single entry.
//
// The glob loader lets a later file with the same id silently replace an earlier one,
// so the wrapper records which files claimed each id and fails the load on a clash.
function byDeclaredId(pattern: string, base: string): Loader {
  const filesById = new Map<string, Set<string>>();
  const loader = glob({
    pattern,
    base,
    generateId: ({ entry, data }) => {
      const id = String(data.id);
      filesById.set(id, (filesById.get(id) ?? new Set()).add(entry));
      return id;
    },
  });
  return {
    ...loader,
    load: async (context) => {
      filesById.clear();
      await loader.load(context);
      const clashes = [...filesById].filter(([, files]) => files.size > 1);
      if (clashes.length > 0) {
        const detail = clashes
          .map(([id, files]) => `"${id}" in ${[...files].join(', ')}`)
          .join('; ');
        throw new Error(`Duplicate ids in ${base}: ${detail}`);
      }
    },
  };
}

const kebabCase = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'must be kebab-case');

const sectionSchema = z.object({
  id: kebabCase,
  title: z.string().min(1),
});

const topicSchema = z.object({
  id: kebabCase,
  slug: kebabCase,
  order: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().min(1),
  icon: z.string(),
  sections: z.array(sectionSchema).optional(),
});

const subtopicSchema = topicSchema.extend({
  topic: kebabCase,
});

const guideSchema = z.object({
  id: kebabCase,
  slug: kebabCase,
  order: z.number().int().positive(),
  topic: kebabCase,
  subtopic: kebabCase.optional(),
  section: kebabCase.optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  created: z.coerce.date(),
  lastUpdated: z.coerce.date(),
  cover: z.string().optional(),
});

const yamlIn = (base: string) => byDeclaredId('*.yaml', base);
const guidesIn = (base: string) => byDeclaredId('**/*.{md,mdx}', base);

export const collections = {
  topicsEs: defineCollection({ loader: yamlIn('./src/content/topics/es'), schema: topicSchema }),
  topicsEn: defineCollection({ loader: yamlIn('./src/content/topics/en'), schema: topicSchema }),
  subtopicsEs: defineCollection({
    loader: yamlIn('./src/content/subtopics/es'),
    schema: subtopicSchema,
  }),
  subtopicsEn: defineCollection({
    loader: yamlIn('./src/content/subtopics/en'),
    schema: subtopicSchema,
  }),
  guidesEs: defineCollection({ loader: guidesIn('./src/content/guides/es'), schema: guideSchema }),
  guidesEn: defineCollection({ loader: guidesIn('./src/content/guides/en'), schema: guideSchema }),
};
