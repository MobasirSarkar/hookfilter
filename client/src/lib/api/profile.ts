import type { User } from "@/lib/schema/user";

export async function getCurrentUser(token: string): Promise<User> {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const json = await res.json();

    if (!res.ok || !json.data) {
        throw new Error("Failed to fetch user");
    }

    return json.data;
}
