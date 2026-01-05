import { HTTP } from "./http";
import { refreshAccessToken } from "@/lib/api/refresh";

let refreshPromise: Promise<string> | null = null;

export function createApiClient(
    getToken: () => string | null,
    setAccessToken: (t: string | null) => void,
    logout: () => void,
) {
    async function request<T>(
        path: string,
        config: RequestInit = {},
        retry = true,
    ): Promise<T> {
        try {
            return await HTTP<T>(path, {
                ...config,
                token: getToken() ?? undefined,
            });
        } catch (err: any) {
            // ⛔ only handle auth errors
            if (err.status !== 401 || !retry) {
                throw err;
            }

            try {
                // 🔒 single-flight refresh
                if (!refreshPromise) {
                    refreshPromise = refreshAccessToken();
                }

                const newToken = await refreshPromise;
                refreshPromise = null;

                setAccessToken(newToken);

                // 🔁 retry original request once
                return request<T>(path, config, false);
            } catch {
                refreshPromise = null;
                logout();
                throw new Error("Session expired");
            }
        }
    }

    return {
        get: <T>(path: string, config?: RequestInit) =>
            request<T>(path, {
                ...config,
                method: "GET",
                credentials: "include",
            }),

        post: <T, B extends BodyInit | object | null>(
            path: string,
            body: B,
            config?: RequestInit,
        ) =>
            request<T>(path, {
                ...config,
                method: "POST",
                body: body instanceof FormData ? body : JSON.stringify(body),
                credentials: "include",
            }),

        put: <T, B extends BodyInit | object>(
            path: string,
            body: B,
            config?: RequestInit,
        ) =>
            request<T>(path, {
                ...config,
                method: "PUT",
                body: body instanceof FormData ? body : JSON.stringify(body),
                credentials: "include",
            }),

        del: <T>(path: string, config?: RequestInit) =>
            request<T>(path, {
                ...config,
                method: "DELETE",
                credentials: "include",
            }),
    };
}
