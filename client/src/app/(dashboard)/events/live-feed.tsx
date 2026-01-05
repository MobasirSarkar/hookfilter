"use client"

import { useEffect, useState, useRef, useMemo } from "react"
import {
    useReactTable,
    getCoreRowModel,
    flexRender,
    createColumnHelper,
} from "@tanstack/react-table"
import { format, formatDistanceToNow } from "date-fns"
import {
    Copy,
    Clock,
    CheckCircle2,
    AlertCircle,
    MoreHorizontal,
    XCircle
} from "lucide-react"
import { toast } from "sonner"

import { ScrollArea } from "@/components/ui/scroll-area"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { PayloadViewer } from "./payload-viewer" // Assuming this exists from your code

// --- Types ---
interface WebEvent {
    id: string
    pipe_id: string
    status_code: number
    received_at: string
    payload: any
    response_body?: any
}

interface LiveFeedProps {
    pipeId: string
    token: string
}

// --- Helper Components ---

const StatusCell = ({ code }: { code: number }) => {
    const isSuccess = code >= 200 && code < 300
    const isError = code >= 400

    return (
        <div className="flex items-center gap-2">
            {isSuccess ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : isError ? (
                <XCircle className="h-4 w-4 text-red-500" />
            ) : (
                <AlertCircle className="h-4 w-4 text-amber-500" />
            )}
            <Badge
                variant={isSuccess ? "outline" : "destructive"}
                className={`font-mono text-xs font-normal ${isSuccess ? "border-emerald-200 text-emerald-700 bg-emerald-50" : ""
                    }`}
            >
                {code}
            </Badge>
        </div>
    )
}

const TimeCell = ({ dateStr }: { dateStr: string }) => {
    const date = new Date(dateStr)
    return (
        <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">
                {format(date, "HH:mm:ss")}
            </span>
            <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(date, { addSuffix: true })}
            </span>
        </div>
    )
}

// --- Main Component ---

export function LiveFeed({ pipeId, token }: LiveFeedProps) {
    const [events, setEvents] = useState<WebEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<WebEvent | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    // 1. WebSocket Connection Logic (Unchanged but optimized)
    useEffect(() => {
        if (!token) return

        const protocol = window.location.protocol === "https:" ? "wss" : "ws"
        const wsUrl = `${protocol}://localhost:8080/ws/pipes/${pipeId}?token=${token}`
        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onmessage = (message) => {
            try {
                const raw = JSON.parse(message.data)
                if (!raw.id || !raw.received_at || !raw.status_code) return

                // Filter logic
                if (raw.pipe_id && raw.pipe_id !== pipeId) return

                const event: WebEvent = {
                    id: raw.id,
                    pipe_id: raw.pipe_id,
                    status_code: raw.status_code,
                    received_at: raw.received_at,
                    payload: raw.payload,
                    response_body: raw.response_body,
                }

                setEvents((prev) => [event, ...prev])
            } catch (err) {
                console.error("[WS] invalid message", err)
            }
        }

        return () => ws.close()
    }, [pipeId, token])

    // 2. TanStack Table Configuration
    const columnHelper = createColumnHelper<WebEvent>()

    const columns = useMemo(() => [
        columnHelper.accessor("status_code", {
            header: "Status",
            cell: (info) => <StatusCell code={info.getValue()} />,
            size: 100,
        }),
        columnHelper.accessor("id", {
            header: "Event ID",
            cell: (info) => (
                <div className="flex items-center gap-2 group">
                    <span className="font-mono text-xs text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded">
                        {info.getValue().slice(0, 12)}
                    </span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                            e.stopPropagation()
                            navigator.clipboard.writeText(info.getValue())
                            toast.success("ID copied to clipboard")
                        }}
                    >
                        <Copy className="h-3 w-3" />
                    </Button>
                </div>
            ),
        }),
        columnHelper.accessor("received_at", {
            header: () => <div className="text-right">Timestamp</div>,
            cell: (info) => <TimeCell dateStr={info.getValue()} />,
        }),
    ], [columnHelper])

    const table = useReactTable({
        data: events,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    // 3. Render
    return (
        <div className="h-full flex flex-col bg-background rounded-lg border shadow-sm overflow-hidden">
            {/* Table Header / Toolbar area could go here */}

            <ScrollArea className="flex-1">
                <Table>
                    <TableHeader className="bg-muted/40 sticky top-0 z-10 backdrop-blur-sm">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b-slate-200/60">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 text-xs font-semibold tracking-wide uppercase text-muted-foreground/80 px-10">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-75 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                                        <div className="p-4 rounded-full bg-muted/30">
                                            <Clock className="h-8 w-8 opacity-50" />
                                        </div>
                                        <p className="text-sm font-medium">Waiting for events...</p>
                                        <p className="text-xs max-w-xs opacity-70">
                                            Send a request to your webhook URL to see it appear here in real-time.
                                        </p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.original.id === selectedEvent?.id ? "selected" : undefined}
                                    className="cursor-pointer transition-colors hover:bg-muted/40 data-[state=selected]:bg-muted/60"
                                    onClick={() => setSelectedEvent(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-10">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>

            {/* Details Sheet */}
            <Sheet open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
                <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col bg-slate-50/50">
                    {selectedEvent && (
                        <>
                            {/* Sheet Header */}
                            <div className="p-6 border-b bg-background">
                                <SheetHeader className="space-y-4">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <SheetTitle className="text-xl">Event Details</SheetTitle>
                                            <SheetDescription className="font-mono text-xs flex items-center gap-2">
                                                {selectedEvent.id}
                                                <Copy
                                                    className="h-3 w-3 cursor-pointer hover:text-foreground"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(selectedEvent.id)
                                                        toast.success("Copied ID")
                                                    }}
                                                />
                                            </SheetDescription>
                                        </div>
                                        <StatusCell code={selectedEvent.status_code} />
                                    </div>

                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            {format(new Date(selectedEvent.received_at), "PPP p")}
                                        </div>
                                    </div>
                                </SheetHeader>
                            </div>

                            {/* Sheet Body - Scrollable */}
                            <ScrollArea className="flex-1 p-6">
                                <div className="space-y-8">
                                    {/* Payload Section */}
                                    <section className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-semibold text-foreground">Request Payload</h4>
                                            <Badge variant="secondary" className="text-[10px] h-5">JSON</Badge>
                                        </div>
                                        <div className="rounded-lg border bg-background shadow-sm overflow-hidden">
                                            <PayloadViewer data={selectedEvent.payload} />
                                        </div>
                                    </section>

                                    {/* Response Section */}
                                    {selectedEvent.response_body && (
                                        <section className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="text-sm font-semibold text-foreground">Response Body</h4>
                                            </div>
                                            <div className="rounded-lg border bg-zinc-950 text-zinc-50 p-4 shadow-sm overflow-x-auto">
                                                <pre className="text-xs font-mono">
                                                    {JSON.stringify(selectedEvent.response_body, null, 2)}
                                                </pre>
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Sheet Footer (Optional actions) */}
                            <div className="p-4 border-t bg-background">
                                <Button variant="outline" className="w-full" onClick={() => setSelectedEvent(null)}>
                                    Close
                                </Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}
