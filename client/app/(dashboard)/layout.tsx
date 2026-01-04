"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { UserNav } from "@/components/layout/user-nav";
import { DashboardSkeleton } from "@/components/skeleton/dashboard";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { authReady, user } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authReady && !user) {
            router.replace("/login");
        }
    }, [authReady, user, router]);

    if (!authReady) {
        return <DashboardSkeleton />;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
                <Sidebar />
            </div>

            <main className="md:pl-72">
                <div className="flex items-center justify-end p-4 border-b h-16">
                    <UserNav user={user} />
                </div>
                {children}
            </main>
        </div>
    );
}
