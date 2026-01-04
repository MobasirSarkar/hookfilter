"use client";

import { useApi } from "@/lib/api/use-api";
import {
    LoginForm,
    LoginFormSchema,
    LoginResponse,
    RegisterForm,
    RegisterFormSchema,
    RegisterResponse,
} from "@/lib/schema/auth";
import { ApiResponse } from "@/lib/types";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export function useLogin() {
    const api = useApi();
    return useMutation({
        mutationFn: async (input: LoginForm) => {
            const parsed = LoginFormSchema.safeParse(input);
            if (!parsed.success) {
                throw new Error(parsed.error.issues[0].message);
            }

            const res = await api.post<ApiResponse<LoginResponse>, LoginForm>(
                "/auth/sign-in",
                parsed.data,
            );

            if (!res.success || !res.data?.access_token) {
                throw new Error(res.error || res.message || "Login failed");
            }

            return res.data.access_token;
        },

        onError: (err: Error) => {
            toast.error(err.message || "Invalid email or password");
        },
    });
}

export function useRegister() {
    const api = useApi();
    return useMutation({
        mutationFn: async (input: RegisterForm) => {
            const parsed = RegisterFormSchema.safeParse(input);
            if (!parsed.success) {
                throw new Error(parsed.error.issues[0].message);
            }

            const res = await api.post<
                ApiResponse<RegisterResponse>,
                RegisterForm
            >("/auth/sign-up", parsed.data);

            if (!res.success || !res.data?.access_token) {
                throw new Error(
                    res.error || res.message || "registration failed",
                );
            }

            return res.data.access_token;
        },

        onError: (err: Error) => {
            toast.error(err.message || "Invalid email or password or username");
        },
    });
}
