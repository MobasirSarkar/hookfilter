"use client";

import { useApi } from "@/lib/api/use-api";
import { PlaygroundRequest, PlaygroundResponse } from "@/lib/schema/playground";
import { ApiResponse } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function usePlayground() {
    const api = useApi();

    return useMutation({
        mutationFn: (input: PlaygroundRequest) =>
            api.post<ApiResponse<PlaygroundResponse>, PlaygroundRequest>(
                "/jq/playground",
                input,
            ),

        onError: (error: Error) => {
            toast.error(error.message || "Falied to process JQ");
        },
    });
}
