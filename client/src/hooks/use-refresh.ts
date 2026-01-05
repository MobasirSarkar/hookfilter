import { useApi } from "@/lib/api/use-api";
import { LoginResponse } from "@/lib/schema/auth";
import { ApiResponse } from "@/lib/types";

export function useRefreshToken() {
    const api = useApi();

    return async function refresh() {
        const res = await api.post<ApiResponse<LoginResponse>, null>(
            "/auth/refresh",
            null,
            { credentials: "include" },
        );

        if (!res.success || !res.data?.access_token) {
            throw new Error("refresh failed");
        }

        return res.data.access_token;
    };
}
