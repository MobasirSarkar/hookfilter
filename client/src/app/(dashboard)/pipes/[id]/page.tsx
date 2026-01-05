"use client"

import { useParams } from "next/navigation"
import { format } from "date-fns"
import {
    Activity,
    Calendar,
    Globe,
    Hash,
    Settings2,
    Share2
} from "lucide-react"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"

import { usePipe } from "@/hooks/use-pipe"
import { useAuth } from "@/context/auth"
import { CopyCurlButton } from "../copy-curl-button"
import { LiveFeed } from "../../events/live-feed"

// A helper for configuration rows
const ConfigItem = ({
    label,
    value,
    icon: Icon,
    mono = false
}: {
    label: string,
    value: string,
    icon: any,
    mono?: boolean
}) => (
    <div className="group">
        <div className="flex items-center gap-2 mb-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
            <Icon className="h-3.5 w-3.5" />
            {label}
        </div>
        <div className={`text-sm text-zinc-900 break-all bg-zinc-50/50 border border-zinc-100 rounded-md px-3 py-2 ${mono ? 'font-mono text-xs' : ''}`}>
            {value}
        </div>
    </div>
)

export default function PipeDetailsPage() {
    const { authReady, accessToken } = useAuth()
    const { id } = useParams()
    const { data: pipe, isLoading, isError } = usePipe(id as string)

    // 1. Loading State (Full Page Skeleton)
    if ((!authReady && accessToken === null) || isLoading) {
        return (
            <div className="container max-w-7xl mx-auto py-10 space-y-8">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 rounded-lg" />
                        <Skeleton className="h-4 w-40 rounded-lg" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <Skeleton className="lg:col-span-8 h-150 rounded-xl" />
                    <Skeleton className="lg:col-span-4 h-100 rounded-xl" />
                </div>
            </div>
        )
    }

    // 2. Error State
    if (isError || !pipe) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="p-4 bg-red-50 rounded-full">
                    <Activity className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900">Pipe Not Found</h2>
                <p className="text-zinc-500">The pipe you are looking for does not exist or has been deleted.</p>
            </div>
        )
    }

    return (
        <div className="container max-w-7xl mx-auto py-8 lg:py-12 space-y-8 animate-in fade-in duration-500">

            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                            {pipe.name}
                        </h1>
                        <Badge
                            variant="outline"
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide border ${pipe.jq_filter
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-zinc-200 bg-zinc-50 text-zinc-500"
                                }`}
                        >
                            {pipe.jq_filter ? "Processing Active" : "Passthrough"}
                        </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-500">
                        <div className="flex items-center gap-1.5 font-mono text-xs text-zinc-400" title="Pipe ID">
                            <Hash className="h-3.5 w-3.5" />
                            {pipe.id}
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5" />
                            Created {format(new Date(pipe.created_at), "MMM d, yyyy")}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <CopyCurlButton slug={pipe.slug} />
                </div>
            </div>

            <Separator className="bg-zinc-100" />

            {/* --- MAIN CONTENT GRID --- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)] min-h-150">

                {/* 1. Live Console (Left - Larger) */}
                <div className="lg:col-span-8 flex flex-col h-full">
                    <div className="flex-1 flex flex-col rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                        {/* Console Header */}
                        <div className="px-5 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <span className="relative flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
                                </span>
                                <h3 className="text-sm font-semibold text-zinc-900">Live Event Log</h3>
                            </div>
                            <div className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                                Realtime
                            </div>
                        </div>

                        {/* Console Body */}
                        <div className="flex-1 bg-white relative">
                            <div className="absolute inset-0">
                                <LiveFeed pipeId={pipe.id} token={accessToken || ""} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Configuration Sidebar (Right - Smaller) */}
                <div className="lg:col-span-4 space-y-6 h-fit">
                    <Card className="border-zinc-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-zinc-100 bg-zinc-50/30">
                            <div className="flex items-center gap-2 text-zinc-900">
                                <Settings2 className="h-4 w-4" />
                                <h3 className="font-semibold text-sm">Configuration</h3>
                            </div>
                        </div>

                        <div className="p-5 space-y-6">
                            <ConfigItem
                                label="Target Endpoint"
                                value={pipe.target_url}
                                icon={Globe}
                            />

                            <ConfigItem
                                label="Public Slug"
                                value={pipe.slug}
                                icon={Share2}
                                mono
                            />

                            {/* Code Block for JQ Filter */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">
                                    <Activity className="h-3.5 w-3.5" />
                                    JQ Transformation
                                </div>
                                <div className="relative rounded-lg border border-zinc-200 bg-zinc-50 overflow-hidden">
                                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-zinc-300" />
                                    <pre className="p-3 text-xs font-mono text-zinc-700 overflow-x-auto whitespace-pre-wrap">
                                        {pipe.jq_filter || "select(.)"}
                                    </pre>
                                </div>
                                <p className="text-[10px] text-zinc-400 leading-relaxed">
                                    {pipe.jq_filter
                                        ? "Events matching this filter will be modified before forwarding."
                                        : "No filter applied. Events are forwarded as-is."}
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    )
}
