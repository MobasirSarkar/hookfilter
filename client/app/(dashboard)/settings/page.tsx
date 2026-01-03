"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { User } from "lucide-react"

export default function SettingsPage() {
    return (
        <div className="container mx-auto py-10 space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-muted-foreground">Manage your account and API preferences.</p>
            </div>
            <Separator />

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>Update your personal information.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <Button variant="outline">Change Avatar</Button>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" defaultValue="user@example.com" disabled />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="name">Display Name</Label>
                        <Input id="name" defaultValue="John Doe" />
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Manage keys for programmatic access.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 bg-muted rounded-md flex justify-between items-center border">
                        <div>
                            <p className="font-mono text-sm">pk_live_51M...</p>
                            <p className="text-xs text-muted-foreground">Created: Dec 12, 2024</p>
                        </div>
                        <Button variant="destructive" size="sm">Revoke</Button>
                    </div>
                    <Button variant="outline">Generate New Key</Button>
                </CardContent>
            </Card>
        </div>
    )
}
