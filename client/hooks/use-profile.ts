"use client";
import { useApi } from "@/lib/api/use-api";
import { User } from "@/lib/schema/user";
import { ApiResponse } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";

export function useProfile(enabled: boolean) {
    const api = useApi();
    return useQuery({
        queryKey: ["me"],
        enabled,
        queryFn: async () => {
            const res = await api.get<ApiResponse<User>>("/users/me");

            if (!res.success || !res.data) {
                throw new Error(
                    res.error || res.message || "failed to fetch user",
                );
            }

            return res.data;
        },
        retry: false,
    });
}
