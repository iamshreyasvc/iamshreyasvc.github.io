import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const updates = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/updates' }),
	schema: z.object({
		date: z.string(),
		order: z.number(),
	}),
});

const research = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/research' }),
	schema: z.object({
		title: z.string(),
		tags: z.array(z.string()),
		featured: z.boolean().optional(),
	}),
});

const projects = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
	schema: z.object({
		order: z.number(),
		placeholder: z.boolean().optional(),
		title: z.string().optional(),
	}),
});

export const collections = {
	updates,
	research,
	projects,
};
