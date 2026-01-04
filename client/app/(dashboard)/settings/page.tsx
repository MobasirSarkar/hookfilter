"use client";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/auth";
import { DashboardSkeleton } from "@/components/skeleton/dashboard";

export default function SettingsPage() {
    const { authReady, user } = useAuth();

    if (!authReady || !user) return (
        <DashboardSkeleton />
    );

    return (
        <div className="container mx-auto py-10 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account and API preferences.
                </p>
            </div>

            <Separator />

            {/* Profile */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        Update your personal information.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <UserIcon className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Button variant="outline">Change Avatar</Button>
                    </div>

                    <div className="grid gap-2">
                        <Label>Email</Label>
                        <Input value={user.email} disabled />
                    </div>

                    <div className="grid gap-2">
                        <Label>Display Name</Label>
                        <Input defaultValue={user.username} />
                    </div>

                    <Button>Save Changes</Button>
                </CardContent>
            </Card>
        </div>
    );
}
