import { z } from "zod";

export const LoginFormSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
});

export const RegisterFormSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
    username: z
        .string()
        .min(4, { message: "username must be at least 4 characters" }),
    password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters" }),
});

export type LoginForm = z.infer<typeof LoginFormSchema>;
export type RegisterForm = z.infer<typeof RegisterFormSchema>;

export interface LoginResponse {
    access_token: string;
}

export interface RegisterResponse {
    access_token: string;
}
