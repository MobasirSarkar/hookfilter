"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GridBackgroundProps {
    children: React.ReactNode;
    className?: string;
}

export function GridBackground({ children, className }: GridBackgroundProps) {
    return (
        <div
            className={cn(
                "relative w-full min-h-[calc(100vh-3.5rem)]", // minus header height
                "bg-white dark:bg-black",
                className
            )}
        >
            {/* Grid */}
            <div
                className={cn(
                    "absolute inset-0",
                    "bg-size-[40px_40px]",
                    "bg-[linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)]",
                    "dark:bg-[linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]"
                )}
            />

            {/* Radial fade */}
            <div className="pointer-events-none absolute inset-0 bg-white dark:bg-black mask-[radial-gradient(ellipse_at_center,transparent_25%,black)]" />

            {/* Centering layer */}
            <div className="relative z-10 flex h-full items-center justify-center">
                {children}
            </div>
        </div>
    );
}
