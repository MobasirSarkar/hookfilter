import { HTTP } from "./http";

export function createApiClient(getToken: () => string | null) {
    async function request<T>(
        path: string,
        config: RequestInit = {},
    ): Promise<T> {
        return HTTP<T>(path, {
            ...config,
            token: getToken() ?? undefined,
        });
    }

    return {
        get: <T>(path: string, config?: RequestInit) =>
            request<T>(path, { ...config, method: "GET" }),

        post: <T, B extends BodyInit | object>(
            path: string,
            body: B,
            config?: RequestInit,
        ) =>
            request<T>(path, {
                ...config,
                method: "POST",
                body: body instanceof FormData ? body : JSON.stringify(body),
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
            }),

        del: <T>(path: string, config?: RequestInit) =>
            request<T>(path, { ...config, method: "DELETE" }),
    };
}
