"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

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
import { useRegister } from "@/hooks/use-auth";
import { Field, FieldContent, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { useForm } from "react-hook-form";
import { RegisterForm, RegisterFormSchema } from "@/lib/schema/auth";
import { zodResolver } from "@hookform/resolvers/zod";


export default function LoginPage() {
    const router = useRouter();
    const { setAccessToken, setUser } = useAuth();

    const registerUser = useRegister();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterForm>({
        resolver: zodResolver(RegisterFormSchema),
    });

    const onSubmit = (values: RegisterForm) => {
        registerUser.mutate(values, {
            onSuccess: async (accessToken) => {
                setAccessToken(accessToken);
                try {
                    const res = await fetch("/users/me", {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });
                    const json = await res.json();
                    if (!json.status || !json.data) {
                        throw new Error("Failed to fetch user");
                    }
                    setUser(json.data);
                    toast.success("Logged in successfully");
                    router.push("/pipes");
                } catch (err: any) {
                    toast.error(err.message || "Failed to load user");
                }
            },
        });
    };


    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50">
            <Card className="w-87.5">
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

                            {/* Username */}
                            <Field>
                                <FieldLabel>Username</FieldLabel>
                                <FieldContent>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        {...register("username")}
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
                        <Button className="w-full" disabled={registerUser.isPending}>
                            {registerUser.isPending ? "Registering..." : "Register"}
                        </Button>

                        <p className="text-xs text-center text-muted-foreground mt-2">
                            Already have an account?{" "}
                            <Link href="/login" className="underline">
                                Login
                            </Link>
                        </p>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
