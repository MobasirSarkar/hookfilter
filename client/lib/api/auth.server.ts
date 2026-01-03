import "server-only";

import { MeResponseSchema, User } from "../schema/user";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function getCurrentUser(): Promise<User | null> {
    const res = await fetch(`${BASE_URL}/users/me`, {
        headers: {
            Accept: "application/json",
        },
        credentials: "include",
        cache: "no-store",
    });

    if (!res.ok) return null;

    const json = await res.json();
    const parsed = MeResponseSchema.safeParse(json);

    if (!parsed.success) {
        console.error("Invalid /users/me response");
        return null;
    }
    return parsed.data.data;
}
