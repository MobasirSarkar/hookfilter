import { z } from "zod";

export const PlaygroundRequestSchema = z.object({
    payload: z.any(),
    filter: z.string().min(1, { message: "Aleast use . filter " }),
});

export type PlaygroundRequest = z.infer<typeof PlaygroundRequestSchema>;

export const PlaygroundResponseSchema = z.object({
    result: z.any(),
});

export type PlaygroundResponse = z.infer<typeof PlaygroundResponseSchema>;
