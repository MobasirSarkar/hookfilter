"use client";

import { useEffect } from "react";
import { SidebarWrapper } from "@/components/layout/sidebar";
import { DashboardSkeleton } from "@/components/skeleton/dashboard";
import { useAuth } from "@/context/auth";
import { useRouter } from "next/navigation";
import { PipeBreadcrumbs } from "@/components/shared/navigation/pipe-breadcrumbs";

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
        <SidebarWrapper AvatarUrl={user.avatar_url}>
            <div className="sticky top-0 z-20 border-b bg-background px-6 py-4">
                <PipeBreadcrumbs />
            </div>
            <div className="px-6 py-6">
                {children}
            </div>
        </SidebarWrapper>
    );
}
