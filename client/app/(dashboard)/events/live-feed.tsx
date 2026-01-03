"use client"

import { useEffect, useState, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { StatusBadge } from "./status-badge"
import { PayloadViewer } from "./payload-viewer"
import { format } from "date-fns"

// Define the shape of a WebEvent based on your Go struct
interface WebEvent {
    id: string
    status: "success" | "failed" | "pending" | "processing"
    received_at: string
    payload: any
    response_body?: string
    response_status?: number
    attempt_count: number
}

interface LiveFeedProps {
    pipeId: string
}

export function LiveFeed({ pipeId }: LiveFeedProps) {
    const [events, setEvents] = useState<WebEvent[]>([])
    const [selectedEvent, setSelectedEvent] = useState<WebEvent | null>(null)
    const ws = useRef<WebSocket | null>(null)
    const token = localStorage.getItem("access_token")
    useEffect(() => {
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        const wsUrl = `${protocol}//${window.location.host}/ws?token=${token}`
        ws.current = new WebSocket(wsUrl)

        ws.current.onopen = () => {
            console.log("Connected to Pipe Live Feed")
        }

        ws.current.onmessage = (message) => {
            try {
                const newEvent: WebEvent = JSON.parse(message.data)
                setEvents((prev) => [newEvent, ...prev]) // Prepend new events
            } catch (e) {
                console.error("Failed to parse WS message", e)
            }
        }

        ws.current.onclose = () => console.log("Disconnected from Live Feed")

        return () => {
            ws.current?.close()
        }
    }, [pipeId])

    return (
        <>
            <ScrollArea className="h-full w-full">
                <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-10">
                        <TableRow>
                            <TableHead className="w-25">Status</TableHead>
                            <TableHead>Event ID</TableHead>
                            <TableHead>Time</TableHead>
                            <TableHead className="text-right">Attempts</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {events.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Waiting for events...
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
                                        <StatusBadge status={event.status} code={event.response_status} />
                                    </TableCell>
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {event.id.substring(0, 8)}...
                                    </TableCell>
                                    <TableCell className="text-sm">
                                        {format(new Date(event.received_at), "HH:mm:ss")}
                                    </TableCell>
                                    <TableCell className="text-right font-mono">
                                        {event.attempt_count}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </ScrollArea>

            {/* Side Sheet for Event Details */}
            <Sheet open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
                <SheetContent className="w-100 sm:w-150 overflow-y-auto">
                    <SheetHeader className="mb-4">
                        <SheetTitle>Event Details</SheetTitle>
                        <SheetDescription>
                            {selectedEvent?.id}
                        </SheetDescription>
                    </SheetHeader>

                    {selectedEvent && (
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-sm font-medium mb-2">Request Payload</h4>
                                <PayloadViewer data={selectedEvent.payload} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-muted p-3 rounded-md">
                                    <span className="text-xs text-muted-foreground">Status Code</span>
                                    <p className="font-mono text-lg">{selectedEvent.response_status || "N/A"}</p>
                                </div>
                                <div className="bg-muted p-3 rounded-md">
                                    <span className="text-xs text-muted-foreground">Attempts</span>
                                    <p className="font-mono text-lg">{selectedEvent.attempt_count}</p>
                                </div>
                            </div>

                            {selectedEvent.response_body && (
                                <div>
                                    <h4 className="text-sm font-medium mb-2">Response Body</h4>
                                    <div className="bg-muted p-3 rounded-md text-xs font-mono wrap-break-word whitespace-pre-wrap border">
                                        {selectedEvent.response_body}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </>
    )
}
