"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function PipeDetailsSkeleton() {
    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-48" />
                </div>

                <div className="flex gap-2">
                    <Skeleton className="h-6 w-24 rounded-full" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
                {/* Live Feed */}
                <Card className="lg:col-span-2 h-full flex flex-col">
                    <CardHeader className="pb-3 space-y-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-4 w-64" />
                    </CardHeader>

                    <CardContent className="flex-1 min-h-0 space-y-3 p-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-10 w-full rounded-md" />
                        ))}
                    </CardContent>
                </Card>

                {/* Configuration */}
                <Card className="h-fit">
                    <CardHeader>
                        <Skeleton className="h-5 w-32" />
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>

                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-16 w-full rounded-md" />
                        </div>

                        <Skeleton className="h-3 w-40" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
