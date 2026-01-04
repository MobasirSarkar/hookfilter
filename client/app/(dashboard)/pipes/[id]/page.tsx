"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { usePipe } from "@/hooks/use-pipe" // Importing your hook
import { CopyCurlButton } from "../copy-curl-button"
import { LiveFeed } from "../../events/live-feed"
import { useAuth } from "@/context/auth"
import { PipeDetailsSkeleton } from "@/components/skeleton/pipeDetails"

export default function PipeDetailsPage() {
    const { authReady, accessToken } = useAuth()

    if (!authReady && accessToken === null) {
        return <PipeDetailsSkeleton />
    }
    const { id } = useParams()

    const { data: response, isLoading, isError } = usePipe(id as string)

    const pipe = response;

    // 3. Loading State
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-muted-foreground animate-pulse">Loading Pipe Details...</div>
            </div>
        )
    }

    // 4. Error or Not Found State
    if (isError || !pipe) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="text-destructive font-medium">Pipe not found or failed to load.</div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{pipe.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        Pipe ID: <span className="font-mono text-xs">{pipe.id}</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={pipe.jq_filter ? "default" : "secondary"}>
                        {pipe.jq_filter ? "JQ Active" : "No Filter"}
                    </Badge>
                    <CopyCurlButton slug={pipe.slug} />
                </div>
            </div>

            <Separator />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

                {/* Left Col: Live Feed (Takes up 2/3 space) */}
                <Card className="lg:col-span-2 h-full flex flex-col">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                            Live Events
                        </CardTitle>
                        <CardDescription>Real-time delivery logs for this pipe.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 p-0">
                        {/* Pass pipe ID to subscribe to WS channel */}
                        <LiveFeed pipeId={pipe.id} token={accessToken || ""} />
                    </CardContent>
                </Card>

                {/* Right Col: Configuration */}
                <Card className="h-fit">
                    <CardHeader>
                        <CardTitle>Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="text-sm font-medium">Target URL</label>
                            <div className="text-sm text-muted-foreground break-all bg-muted p-2 rounded mt-1">
                                {pipe.target_url}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium">JQ Filter</label>
                            <div className="text-sm font-mono bg-muted p-2 rounded mt-1 overflow-x-auto">
                                {pipe.jq_filter || "select(.)"}
                            </div>
                        </div>
                        <div className="pt-4">
                            <div className="text-xs text-muted-foreground">
                                Created: {new Date(pipe.created_at).toLocaleDateString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
