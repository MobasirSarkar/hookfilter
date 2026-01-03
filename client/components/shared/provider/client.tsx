"use client";

import { Toaster } from "sonner";
import type { User } from "@/lib/schema/user";
import Providers from "@/app/providers";
import { AuthProvider } from "@/context/auth";

export default function ClientProviders({
    children,
}: {
    children: React.ReactNode;
    initialUser?: User | null;
}) {
    return (
        <Providers>
            <AuthProvider>
                {children}
                <Toaster />
            </AuthProvider>
        </Providers>
    );
}
