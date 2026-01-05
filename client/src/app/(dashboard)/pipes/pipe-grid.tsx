"use client"

import { Plus, Webhook, Box, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination, Pipe } from "@/lib/types"
import { PipeCard } from "@/components/cards/pipe-card"

interface PipeGridProps {
    data: Pipe[]
    isLoading?: boolean
    pagination: Pagination
    onPageChange: (page: number, size: number) => void
    onEdit: (pipe: Pipe) => void
    onDelete: (pipe: Pipe) => void
    onView: (pipe: Pipe) => void
    onCreate: () => void
}

export function PipeGrid({
    data,
    isLoading,
    pagination,
    onPageChange,
    onEdit,
    onDelete,
    onView,
    onCreate
}: PipeGridProps) {

    // 1. Modern Skeleton Loading
    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="flex flex-col space-y-3">
                        <Skeleton className="h-40 w-full rounded-xl" />
                        <div className="space-y-2 px-1">
                            <Skeleton className="h-4 w-62.5" />
                            <Skeleton className="h-3 w-50" />
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    // 2. "Linear-Style" Empty State
    // Uses a subtle dot pattern background for a technical feel
    if (!isLoading && data.length === 0) {
        return (
            <div className="relative flex flex-col items-center justify-center min-h-125 rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(#dadce0_1px,transparent_1px)] bg-size-[16px_16px] mask-[radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

                <div className="relative z-10 flex flex-col items-center text-center max-w-sm px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="mb-6 p-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                        <div className="bg-zinc-50 p-3 rounded-xl">
                            <Webhook className="h-8 w-8 text-zinc-400" />
                        </div>
                    </div>

                    <h3 className="text-xl font-semibold tracking-tight text-zinc-900 mb-2">
                        No pipes active
                    </h3>

                    <p className="text-sm text-zinc-500 mb-8 leading-relaxed">
                        You haven't set up any webhook pipes yet. Connect your first source to start processing events.
                    </p>

                    <Button onClick={onCreate} className="rounded-full px-8 shadow-lg hover:shadow-xl transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Create New Pipe
                    </Button>
                </div>
            </div>
        )
    }

    // 3. Main Grid Layout
    return (
        <div className="flex flex-col min-h-150 space-y-8 animate-in fade-in duration-500">

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((pipe) => (
                    // Wrapper div to ensure uniform height and hover positioning
                    <div key={pipe.id} className="h-full">
                        <PipeCard
                            pipe={pipe}
                            onView={onView}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    </div>
                ))}
            </div>

            {/* 4. Minimalist Pagination Footer */}
            <div className="mt-auto border-t border-zinc-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Showing {data.length} of {pagination.total_data} pipes
                </p>

                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-zinc-100 shadow-sm">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                        onClick={() => onPageChange(pagination.page - 1, pagination.page_size)}
                        disabled={pagination.page === 1}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div className="px-4 text-sm font-medium text-zinc-600">
                        Page {pagination.page}
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                        onClick={() => onPageChange(pagination.page + 1, pagination.page_size)}
                        disabled={pagination.page >= Math.ceil(pagination.total_data / pagination.page_size)}
                    >
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
