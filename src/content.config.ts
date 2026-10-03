import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string().min(1),
    summary: z.string().min(1),
    category: z.string().min(1),
    publishedAt: z.coerce.date(),
    readingMinutes: z.number().int().positive(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(true),
    author: z.string().default('林'),
    location: z.string().default('上海'),
    noteNumber: z.string().optional(),
  }),
});

export const collections = { posts };
