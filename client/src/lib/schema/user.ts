import { z } from "zod";

export const UserSchema = z.object({
    id: z.uuidv4(),
    email: z.email(),
    username: z.string(),
    avatar_url: z.url().nullable(),
    created_at: z.string(),
});

export type User = z.infer<typeof UserSchema>;

export const MeResponseSchema = z.object({
    data: UserSchema,
});
