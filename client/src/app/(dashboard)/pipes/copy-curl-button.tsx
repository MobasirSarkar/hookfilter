"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

// Changed prop name to 'slug' to be more explicit about what is needed
export function CopyCurlButton({ slug }: { slug: string }) {
    const [copied, setCopied] = useState(false)

    // 1. Construct the Ingest URL using the BASE_URL and the slug directly
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
    const ingestUrl = `${baseUrl}/u/${slug}`

    const curlCommand = `curl -X POST ${ingestUrl} \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello World", "timestamp": 123456789}'`

    const handleCopy = () => {
        navigator.clipboard.writeText(curlCommand)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="w-4 h-4" />
                    Test Payload
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl flex flex-col">
                <DialogHeader>
                    <DialogTitle>Send Test Event</DialogTitle>
                    <DialogDescription>
                        Send a POST request to this URL to trigger your pipe.
                    </DialogDescription>
                </DialogHeader>

                {/* Visual URL Display */}
                <div className="bg-muted p-2 rounded text-sm font-mono break-all border mb-2">
                    {ingestUrl}
                </div>

                <div className="relative">
                    <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg text-sm overflow-x-auto whitespace-pre-wrap font-mono border">
                        {curlCommand}
                    </pre>
                    <Button
                        size="icon"
                        variant="secondary"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={handleCopy}
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
