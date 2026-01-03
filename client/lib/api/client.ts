const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 1. Custom Error to expose Status Code to the UI
export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

type FetchOptions = RequestInit & {
    headers?: Record<string, string>;
};

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};

    if (headers instanceof Headers) {
        return Object.fromEntries(headers.entries());
    }

    if (Array.isArray(headers)) {
        return Object.fromEntries(headers);
    }

    return headers;
}

async function http<T>(path: string, config: RequestInit = {}): Promise<T> {
    const token =
        typeof window !== "undefined"
            ? localStorage.getItem("access_token")
            : null;

    const safeBase = BASE_URL.replace(/\/$/, "");
    const safePath = path.startsWith("/") ? path : `/${path}`;
    const url = `${safeBase}${safePath}`;

    const isFormData = config.body instanceof FormData;

    const baseHeaders: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
    };

    const headers: Record<string, string> = {
        ...baseHeaders,
        ...normalizeHeaders(config.headers),
    };
    const response = await fetch(url, {
        ...config,
        headers,
    });

    if (response.status === 204) {
        return {} as T;
    }

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new ApiError(
            data?.error || data?.message || response.statusText,
            response.status,
            data,
        );
    }

    return data;
}

export async function Get<T>(path: string, config?: FetchOptions): Promise<T> {
    return http<T>(path, { method: "GET", ...config });
}

export async function Post<TResponse, TBody extends BodyInit | object>(
    path: string,
    body: TBody,
    config?: FetchOptions,
): Promise<TResponse> {
    // 5. Smart Body Serialization
    const isFormData = body instanceof FormData;

    return http<TResponse>(path, {
        method: "POST",
        body: isFormData ? (body as FormData) : JSON.stringify(body),
        ...config,
    });
}

export async function Put<TResponse, TBody extends BodyInit | object>(
    path: string,
    body: TBody,
    config?: FetchOptions,
): Promise<TResponse> {
    const isFormData = body instanceof FormData;

    return http<TResponse>(path, {
        method: "PUT",
        body: isFormData ? (body as FormData) : JSON.stringify(body),
        ...config,
    });
}

export async function Del<T>(path: string, config?: FetchOptions): Promise<T> {
    return http<T>(path, { method: "DELETE", ...config });
}
