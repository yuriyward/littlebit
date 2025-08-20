import { defineCollection, reference, z } from "astro:content";
import type { icons as lucideIcons } from "@iconify-json/lucide/icons.json";
import type { icons as simpleIcons } from "@iconify-json/simple-icons/icons.json";
import { file, glob } from "astro/loaders";

const other = defineCollection({
  loader: glob({ base: "src/content/other", pattern: "**/*.{md,mdx}" }),
});

const lucideIconSchema = z.object({
  type: z.literal("lucide"),
  name: z.custom<keyof typeof lucideIcons>(),
});

const simpleIconSchema = z.object({
  type: z.literal("simple-icons"),
  name: z.custom<keyof typeof simpleIcons>(),
});

const quickInfo = defineCollection({
  loader: file("src/content/info.json"),
  schema: z.object({
    id: z.number(),
    icon: z.union([lucideIconSchema, simpleIconSchema]),
    text: z.string(),
  }),
});

const socials = defineCollection({
  loader: file("src/content/socials.json"),
  schema: z.object({
    id: z.number(),
    icon: z.union([lucideIconSchema, simpleIconSchema]),
    text: z.string(),
    link: z.string().url(),
  }),
});

const workExperience = defineCollection({
  loader: file("src/content/work.json"),
  schema: z.object({
    id: z.number(),
    title: z.string(),
    company: z.string(),
    duration: z.string(),
    description: z.string(),
    technologies: z.array(z.string()).optional(),
  }),
});

const skills = defineCollection({
  loader: file("src/content/skills.json"),
  schema: z.object({
    id: z.number(),
    category: z.string(),
    skills: z.array(z.object({
      name: z.string(),
      level: z.number().min(0).max(100),
    })),
  }),
});

const tags = defineCollection({
  loader: file("src/content/tags.json"),
  schema: z.object({
    id: z.string(),
  }),
});

const posts = defineCollection({
  loader: glob({ base: "src/content/posts", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      createdAt: z.coerce.date(),
      updatedAt: z.coerce.date().optional(),
      description: z.string(),
      tags: z.array(reference("tags")),
      draft: z.boolean().optional().default(false),
      image: image(),
    }),
});

const projects = defineCollection({
  loader: glob({ base: "src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.coerce.date(),
      image: image(),
      link: z.string().url().optional(),
      category: z.enum(['consulting', 'professional', 'open-source', 'personal']).optional(),
      type: z.enum(['consulting', 'professional', 'open-source', 'personal']).optional(),
      featured: z.boolean().optional(),
      technologies: z.array(z.string()).optional(),
      status: z.enum(['completed', 'ongoing', 'maintained', 'archived']).optional(),
      client: z.string().optional(),
      duration: z.string().optional(),
      team_size: z.string().optional(),
      role: z.string().optional(),
      challenges: z.array(z.string()).optional(),
      outcomes: z.array(z.string()).optional(),
      info: z.array(
        z.object({
          text: z.string(),
          icon: z.union([lucideIconSchema, simpleIconSchema]),
          link: z.string().url().optional(),
        })
      ),
    }),
});

export const collections = { tags, posts, projects, other, quickInfo, socials, workExperience, skills };
