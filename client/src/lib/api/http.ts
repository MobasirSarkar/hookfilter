"use client";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export class ApiError extends Error {
    status: number;
    data: any;

    constructor(message: string, status: number, data: any) {
        super(message);
        this.status = status;
        this.data = data;
    }
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
    if (!headers) return {};
    if (headers instanceof Headers)
        return Object.fromEntries(headers.entries());
    if (Array.isArray(headers)) return Object.fromEntries(headers);
    return headers;
}

export async function HTTP<T>(
    path: string,
    config: RequestInit & { token?: string } = {},
): Promise<T> {
    const { token, headers, body, ...rest } = config;

    const safeBase = BASE_URL.replace(/\/$/, "");
    const safePath = path.startsWith("/") ? path : `/${path}`;
    const url = `${safeBase}${safePath}`;

    const isFormData = body instanceof FormData;

    const finalHeaders: Record<string, string> = {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...normalizeHeaders(headers),
    };

    const res = await fetch(url, {
        ...rest,
        body,
        headers: finalHeaders,
    });

    if (res.status === 204) return {} as T;

    const data = await res.json().catch(() => null);

    if (!res.ok) {
        throw new ApiError(
            data?.error || data?.message || res.statusText,
            res.status,
            data,
        );
    }

    return data;
}
