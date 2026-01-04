"use client";

import { useAuth } from "@/context/auth";
import { createApiClient } from "./api.client";
import { logoutRequest } from "./logout";

export function useApi() {
    const { getToken, setAccessToken, setUser } = useAuth();

    return createApiClient(getToken, setAccessToken, () =>
        logout(setAccessToken, setUser),
    );
}

function hardLogout(
    setAccessToken: (t: string | null) => void,
    setUser: (u: null) => void,
) {
    setAccessToken(null);
    setUser(null);
    window.location.href = "/login";
}

export async function logout(
    setAccessToken: (t: string | null) => void,
    setUser: (u: null) => void,
) {
    try {
        await logoutRequest();
    } catch {
    } finally {
        hardLogout(setAccessToken, setUser);
    }
}
