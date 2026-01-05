"use client";

import { useAuth } from "@/context/auth";
import { useApi } from "@/lib/api/use-api";
import { pipeKeys } from "@/lib/keys/query";
import { ApiResponse, Pipe } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// Fetch pipes (list)
export function usePipes(page = 1, limit = 10) {
    const api = useApi();
    const { accessToken } = useAuth();

    return useQuery({
        queryKey: [...pipeKeys.lists(), page, limit],
        enabled: !!accessToken,
        queryFn: async () => {
            const res = await api.get<ApiResponse<Pipe[]>>(
                `/pipes?page=${page}&limit=${limit}`,
            );

            if (!res.success || !res.data) {
                throw new Error(
                    res.error || res.message || "Failed to fetch pipes",
                );
            }

            return {
                pipes: res.data,
                pagination: res.metadata?.pagination ?? {
                    page,
                    page_size: limit,
                    total_page: 0,
                    total_data: 0,
                },
            };
        },
        placeholderData: (previousData) => previousData,
        staleTime: 30_000,
        gcTime: 5 * 60_000,
    });
}

export function usePipe(id: string) {
    const api = useApi();

    return useQuery({
        queryKey: pipeKeys.detail(id),
        enabled: !!id,
        queryFn: async () => {
            const res = await api.get<ApiResponse<Pipe>>(`/pipes/${id}`);

            if (!res.success || !res.data) {
                throw new Error(res.error || res.message || "Pipe not found");
            }

            return res.data;
        },
    });
}

export function useCreatePipe() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPipe: {
            name: string;
            slug: string;
            target_url: string;
            jq_filter?: string;
        }) => {
            const res = await api.post<ApiResponse<Pipe>, typeof newPipe>(
                "/pipes",
                newPipe,
            );

            if (!res.success || !res.data) {
                throw new Error(
                    res.error || res.message || "Failed to create pipe",
                );
            }

            return res.data;
        },

        onSuccess: () => {
            toast.success("Pipe created successfully");
            queryClient.invalidateQueries({ queryKey: pipeKeys.lists() });
        },

        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useUpdatePipe() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (newPipe: {
            id: string;
            name: string;
            slug: string;
            target_url: string;
            jq_filter?: string;
        }) => {
            const res = await api.post<ApiResponse<Pipe>, typeof newPipe>(
                "/pipes",
                newPipe,
            );

            if (!res.success || !res.data) {
                throw new Error(
                    res.error || res.message || "Failed to create pipe",
                );
            }

            return res.data;
        },

        onSuccess: () => {
            toast.success("Pipe created successfully");
            queryClient.invalidateQueries({ queryKey: pipeKeys.lists() });
        },

        onError: (error: Error) => {
            toast.error(error.message);
        },
    });
}

export function useDeletePipe() {
    const api = useApi();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (pipeId: string) => {
            const res = await api.del<ApiResponse<{ success: boolean }>>(
                `/pipes/${pipeId}`,
            );

            if (!res.success) {
                throw new Error(
                    res.error || res.message || "Failed to delete pipe",
                );
            }

            return true;
        },

        onSuccess: () => {
            toast.success("Pipe deleted");
            queryClient.invalidateQueries({ queryKey: pipeKeys.lists() });
        },
    });
}
