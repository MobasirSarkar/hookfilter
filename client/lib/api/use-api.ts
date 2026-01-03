"use client";

import { useAuth } from "@/context/auth";
import { createApiClient } from "./api.client";

export function useApi() {
    const { getToken } = useAuth();

    return createApiClient(getToken);
}
