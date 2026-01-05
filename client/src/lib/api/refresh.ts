import { ApiResponse } from "@/lib/types";
import { LoginResponse } from "@/lib/schema/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL!;

export async function refreshAccessToken(): Promise<string> {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!res.ok) {
        throw new Error("Refresh failed");
    }

    const json = (await res.json()) as ApiResponse<LoginResponse>;

    if (!json.success || !json.data?.access_token) {
        throw new Error("Invalid refresh response");
    }

    return json.data.access_token;
}
