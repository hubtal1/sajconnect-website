import { defineCollection, z } from "astro:content";

const jobs = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    locale: z.enum(["de", "en", "pt-br"]),
    location: z.string(),
    employmentType: z.enum(["full-time", "part-time", "contract", "internship"]),
    department: z.string().optional(),
    summary: z.string(),
    publishedAt: z.coerce.date(),
    closesAt: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    locale: z.enum(["de", "en", "pt-br"]),
    description: z.string(),
    author: z.string(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    cover: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { jobs, blog };
