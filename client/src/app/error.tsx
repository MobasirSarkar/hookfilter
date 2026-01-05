"use client";

import { useEffect } from "react";
import { ErrorView } from "@/components/shared/error-view";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("App error:", error);
    }, [error]);

    return (
        <ErrorView
            title="Application Error"
            description="Something broke while loading this page."
            actionLabel="Retry"
            onAction={reset}
        />
    );
}

