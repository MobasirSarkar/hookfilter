"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
import { useProfile } from "@/hooks/use-profile";
import { LoginFormSchema, type LoginForm } from "@/lib/schema/auth";

export default function LoginPage() {
    const router = useRouter();
    const { accessToken, setAccessToken, setUser, user } = useAuth();

    const login = useLogin();
    const profile = useProfile(!!accessToken);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginForm>({
        resolver: zodResolver(LoginFormSchema),
    });

    /* // Redirect once profile is loaded
    useEffect(() => {
        if (profile.data && !user) {
            setUser(profile.data);
            toast.success("Logged in successfully");
            router.push("/pipes");
        }
    }, [profile.data, user, setUser, router]);
*/
    useEffect(() => {
        console.log("accessToken updated:", accessToken);
    }, [accessToken]);

    const onSubmit = (values: LoginForm) => {
        login.mutate(values, {
            onSuccess: (token) => {
                setAccessToken(token);
                toast.success("Logged in successfully");
                router.push("/pipes");
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
                            {/* Email */}
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

                            {/* Password */}
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
                            disabled={login.isPending || profile.isLoading}
                        >
                            {login.isPending || profile.isLoading
                                ? "Logging in..."
                                : "Login"}
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
