"use client"

import { formatDistanceToNow } from "date-fns"
import {
    MoreHorizontal,
    Play,
    Settings,
    Trash2,
    Webhook
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Pipe } from "@/lib/types"

interface PipeCardProps {
    pipe: Pipe
    onView: (pipe: Pipe) => void
    onEdit: (pipe: Pipe) => void
    onDelete: (pipe: Pipe) => void
}

export function PipeCard({ pipe, onView, onEdit, onDelete }: PipeCardProps) {
    return (
        <div className="group relative flex flex-col justify-between rounded-xs border border-zinc-200 bg-white p-5 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-900/5">

            {/* 1. Header: Status & Actions */}
            <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                    {/* Icon Box */}
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-100 bg-zinc-50 text-zinc-500 shadow-sm group-hover:border-zinc-200 group-hover:bg-white group-hover:text-primary transition-colors">
                        <Webhook className="h-5 w-5" />
                    </div>

                    <div>
                        <h3 className="font-semibold leading-none tracking-tight text-zinc-900">
                            {pipe.name}
                        </h3>
                        <div className="mt-1.5 flex items-center gap-2">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                            </span>
                            <p className="font-mono text-[10px] text-zinc-400">
                                /{pipe.slug}
                            </p>
                        </div>
                    </div>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-700 -mr-2 -mt-2"
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Manage Pipe</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEdit(pipe)}>
                            <Settings className="mr-2 h-4 w-4" /> Settings
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onDelete(pipe)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* 2. Content: Technical Details */}
            <div className="space-y-4">
                <div className="rounded-md bg-zinc-50 px-3 py-2 border border-zinc-100 group-hover:border-zinc-200 transition-colors">
                    <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400 mb-1">
                        Target URL
                    </p>
                    <p className="font-mono text-xs text-zinc-600 truncate" title={pipe.target_url}>
                        {pipe.target_url}
                    </p>
                </div>
            </div>

            {/* 3. Footer: Meta & CTA */}
            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                <p className="text-xs text-zinc-400 font-medium">
                    Created {formatDistanceToNow(new Date(pipe.created_at || new Date()))} ago
                </p>

                <Button
                    onClick={() => onView(pipe)}
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 rounded-full px-4 text-xs font-medium hover:bg-zinc-900 hover:text-white transition-colors"
                >
                    <Play className="h-3 w-3" />
                    Console
                </Button>
            </div>

            {/* Hover Effect Overlay (Optional shine) */}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-transparent group-hover:ring-zinc-900/5" />
        </div>
    )
}
