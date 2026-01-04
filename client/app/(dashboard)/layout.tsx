"use client";

import { useEffect } from "react";
import { SidebarWrapper } from "@/components/layout/sidebar";
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
        <SidebarWrapper AvatarUrl={user.avatar_url}>
            {children}
        </SidebarWrapper>
    );
}
