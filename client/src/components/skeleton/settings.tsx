import { Skeleton } from "@/components/ui/skeleton";

export function SettingsSkeleton() {
    return (
        <div className="container mx-auto py-10 space-y-8 max-w-4xl">
            {/* Header */}
            <div className="space-y-2">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-4 w-80" />
            </div>

            {/* Profile card */}
            <div className="border rounded-lg p-6 space-y-6">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-56" />
                </div>

                <div className="flex items-center gap-4">
                    <Skeleton className="h-16 w-16 rounded-full" />
                    <Skeleton className="h-9 w-32" />
                </div>

                <div className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
            </div>

            {/* API keys card */}
            <div className="border rounded-lg p-6 space-y-6">
                <div className="space-y-1">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-56" />
                </div>

                <div className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-9 w-40" />
                </div>
            </div>
        </div>
    );
}
