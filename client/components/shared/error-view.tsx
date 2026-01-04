"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorViewProps {
    title?: string;
    description?: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function ErrorView({
    title = "Something went wrong",
    description = "An unexpected error occurred. Please try again.",
    actionLabel = "Try again",
    onAction,
}: ErrorViewProps) {
    return (
        <div className="flex min-h-[60vh] items-center justify-center">
            <Card className="max-w-md w-full">
                <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
                    <h2 className="text-xl font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">{description}</p>

                    {onAction && (
                        <Button onClick={onAction} className="mt-2">
                            {actionLabel}
                        </Button>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
