"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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


export default function LoginPage() {
    const router = useRouter();
    const { setAccessToken, setUser } = useAuth();

    const login = useLogin();

    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const payload = Object.fromEntries(formData) as {
            email: string;
            password: string;
        };

        login.mutate(payload, {
            onSuccess: async (accessToken) => {
                // 1️⃣ Store token in memory
                setAccessToken(accessToken);

                try {
                    // 2️⃣ Fetch current user
                    const res = await fetch("/users/me", {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    });

                    const json = await res.json();

                    if (!json.status || !json.data) {
                        throw new Error("Failed to fetch user");
                    }

                    // 3️⃣ Store user
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

                <form onSubmit={onSubmit}>
                    <CardContent>
                        <div className="grid w-full items-center gap-4">
                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    required
                                />
                            </div>

                            <div className="flex flex-col space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-2">
                        <Button className="w-full" disabled={login.isPending}>
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
