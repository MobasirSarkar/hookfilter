"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
    Field,
    FieldContent,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

import { useAuth } from "@/context/auth";
import { useLogin } from "@/hooks/use-auth";
import { useApi } from "@/lib/api/use-api";
import { LoginFormSchema, type LoginForm } from "@/lib/schema/auth";
import type { ApiResponse } from "@/lib/types";
import type { User } from "@/lib/schema/user";

export default function LoginPage() {
    const router = useRouter();
    const { setAccessToken, setUser } = useAuth();
    const api = useApi();
    const login = useLogin();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(LoginFormSchema),
    });

    const onSubmit = async (values: LoginForm) => {
        login.mutate(values, {
            onSuccess: async (token) => {
                try {
                    setAccessToken(token);
                    const res = await api.get<ApiResponse<User>>("/users/me");
                    if (!res.success || !res.data) {
                        throw new Error("Failed to fetch user");
                    }
                    setUser(res.data);
                    toast.success("Logged in successfully");
                    router.replace("/pipes");
                } catch (err: any) {
                    toast.error(err.message || "Login failed");
                }
            },
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-90">
                <CardHeader>
                    <CardTitle>Login</CardTitle>
                    <CardDescription>
                        Enter your email to access your pipes.
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <CardContent>
                        <FieldGroup>
                            <Field>
                                <FieldLabel>Email</FieldLabel>
                                <FieldContent>
                                    <Input
                                        type="email"
                                        autoComplete="email"
                                        placeholder="name@example.com"
                                        {...register("email")}
                                    />
                                </FieldContent>
                                {errors.email && (
                                    <FieldError>{errors.email.message}</FieldError>
                                )}
                            </Field>

                            <Field>
                                <FieldLabel>Password</FieldLabel>
                                <FieldContent>
                                    <Input
                                        type="password"
                                        autoComplete="current-password"
                                        {...register("password")}
                                    />
                                </FieldContent>
                                {errors.password && (
                                    <FieldError>{errors.password.message}</FieldError>
                                )}
                            </Field>
                        </FieldGroup>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                        <Button
                            type="submit"
                            className="w-full"
                            disabled={login.isPending}
                        >
                            {login.isPending ? "Logging in..." : "Login"}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Don&apos;t have an account?{" "}
                            <Link href="/register" className="underline">
                                Register
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
