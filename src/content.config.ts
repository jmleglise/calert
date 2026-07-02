import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    language: z.literal('fr').default('fr'),
    canonicalSlug: z.string().optional(),
    translationKey: z.string().optional(),
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
    keywords: z.array(z.string()).default([]),
  }),
});

export const collections = { blog };
