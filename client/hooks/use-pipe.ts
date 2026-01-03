import { Del, Get, Post } from "@/lib/api/client";
import { pipeKeys } from "@/lib/keys/query";
import { ApiResponse, Pipe } from "@/lib/types";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

// fetch
export function usePipes(page = 1, limit = 10) {
    return useQuery({
        queryKey: [...pipeKeys.lists(), page, limit],
        queryFn: () =>
            Get<ApiResponse<Pipe[]>>(`/pipes?page=${page}&limit=${limit}`),
        placeholderData: (previousData) => previousData,
    });
}

export function usePipe(id: string) {
    return useQuery({
        queryKey: pipeKeys.detail(id),
        queryFn: () => Get<Pipe[]>(`/pipes/${id}`),
        enabled: !!id,
    });
}

export function useCreatePipe() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newPipe: {
            name: string;
            slug: string;
            target_url: string;
        }) => Post<Pipe, typeof newPipe>("/pipes", newPipe),

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
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (pipeId: string) =>
            Del<{ success: boolean }>(`/api/pipes/${pipeId}`),

        onSuccess: () => {
            toast.success("Pipe deleted");
            queryClient.invalidateQueries({ queryKey: pipeKeys.lists() });
        },
    });
}
