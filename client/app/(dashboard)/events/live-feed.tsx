"use client"

import { useEffect, useState, useRef } from "react"
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
import { StatusBadge } from "./status-badge"
import { PayloadViewer } from "./payload-viewer"
import { format } from "date-fns"

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

export function LiveFeed({ pipeId, token }: LiveFeedProps) {
    const [events, setEvents] = useState<WebEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<WebEvent | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    useEffect(() => {
        if (!token) return

        const protocol = window.location.protocol === "https:" ? "wss" : "ws"
        const wsUrl = `${protocol}://localhost:8080/ws?token=${token}`

        const ws = new WebSocket(wsUrl)
        wsRef.current = ws

        ws.onopen = () => {
            console.log("[WS] connected")
        }

        ws.onmessage = (message) => {
            try {
                const raw = JSON.parse(message.data)

                // 🔒 hard validation
                if (!raw.id || !raw.received_at || !raw.status_code) return

                const event: WebEvent = {
                    id: raw.id,
                    pipe_id: raw.pipe_id,
                    status_code: raw.status_code,
                    received_at: raw.received_at,
                    payload: raw.payload,
                    response_body: raw.response_body,
                }

                // optional: filter by pipe
                if (event.pipe_id !== pipeId) return

                setEvents((prev) => [event, ...prev])
            } catch (err) {
                console.error("[WS] invalid message", err)
            }
        }

        ws.onclose = () => {
            console.log("[WS] disconnected")
        }

        ws.onerror = (e) => {
        }

        return () => {
            ws.close()
        }
    }, [pipeId, token])

    return (
        <>
            <ScrollArea className="h-full w-full">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Event ID</TableHead>
                            <TableHead>Time</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                    Waiting for events…
                                </TableCell>
                            </TableRow>
                        ) : (
                            events.map((event) => (
                                <TableRow
                                    key={event.id}
                                    className="cursor-pointer hover:bg-muted/50"
                                    onClick={() => setSelectedEvent(event)}
                                >
                                    <TableCell>
                                        <StatusBadge code={event.status_code} status="" />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {event.id.slice(0, 8)}…
                                    </TableCell>
                                    <TableCell>
                                        {format(new Date(event.received_at), "HH:mm:ss")}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>

            <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <SheetContent className="w-200 overflow-y-auto p-2">
                    <SheetHeader>
                        <SheetTitle>Event Details</SheetTitle>
                        <SheetDescription>{selectedEvent?.id}</SheetDescription>
                    </SheetHeader>

                    {selectedEvent && (
                        <div className="space-y-6 mt-4">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Payload</h4>
                                <PayloadViewer data={selectedEvent.payload} />
                            </div>

                            <div className="bg-muted p-3 rounded-md">
                                <span className="text-xs text-muted-foreground">Status Code</span>
                                <p className="font-mono text-lg">
                                    {selectedEvent.status_code}
                                </p>
                            </div>

                            {selectedEvent.response_body && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Response</h4>
                                    <pre className="bg-muted p-3 rounded-md text-xs whitespace-pre-wrap">
                                        {JSON.stringify(selectedEvent.response_body, null, 2)}
                                    </pre>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
