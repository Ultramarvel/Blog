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

const profile = defineCollection({
  loader: glob({ pattern: 'profile.md', base: './src/content' }),
  schema: z.object({
    name: z.string().min(1),
    cardName: z.string().min(1),
    cardRoles: z.array(z.string().min(1)).min(1),
    role: z.string().min(1),
    tagline: z.string().min(1),
    shortBio: z.string().min(1),
    location: z.string().min(1),
    coordinates: z.string().min(1),
    status: z.string().min(1),
    current: z.array(z.string().min(1)).min(1),
    topics: z.array(z.string().min(1)).min(1),
    since: z.string().min(1),
    email: z.email(),
    profileNumber: z.string().min(1),
    updatedAt: z.coerce.date(),
  }),
});

export const collections = { posts, profile };
