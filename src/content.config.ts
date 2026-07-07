import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** Date of last substantial work, shown on cards and pages. */
    date: z.coerce.date(),
    tags: z.array(z.string()),
    repo: z.string().url().optional(),
    featured: z.boolean().default(false),
    /** Marks the standout project — gets a "flagship" badge on its card. */
    flagship: z.boolean().default(false),
    /** Sort key on the index page; lower comes first. */
    order: z.number().default(99),
    status: z.enum(['working', 'in-progress', 'archived']).default('working'),
    /** Whether it's a DTU course/group project or a personal one — used by the index filter. */
    kind: z.enum(['personal', 'coursework']).default('personal'),
    hero: z.string().optional(),
    heroAlt: z.string().optional(),
  }),
});

export const collections = { projects };
