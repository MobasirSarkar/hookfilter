import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="h-screen flex">
            {/* Sidebar */}
            <aside className="hidden md:flex md:w-72 md:flex-col bg-gray-900 p-4 gap-4">
                <Skeleton className="h-8 w-32 bg-gray-700" />
                <div className="space-y-3 mt-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <Skeleton
                            key={i}
                            className="h-10 w-full bg-gray-800"
                        />
                    ))}
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 md:pl-72">
                {/* Top bar */}
                <div className="h-16 border-b flex items-center justify-end px-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-4 w-96" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <Skeleton key={i} className="h-32 w-full" />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
