import { z } from "zod";

export const PipeConfigSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 chars"),
    slug: z.string().regex(/^[a-z0-9-]+$/, "Slug must be kebab-case"),
    target_url: z.url("Must be a valid URL"),
    jq_filter: z.string().optional(),
});

export type PipeConfig = z.infer<typeof PipeConfigSchema>;
