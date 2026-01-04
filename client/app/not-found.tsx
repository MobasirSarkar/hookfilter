"use client"
import { ErrorView } from "@/components/shared/error-view";

export default function NotFound() {
    return (
        <ErrorView
            title="Page not found"
            description="The page you’re looking for doesn’t exist."
            actionLabel="Go home"
            onAction={() => (window.location.href = "/pipes")}
        />
    );
}
