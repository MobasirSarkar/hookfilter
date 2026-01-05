import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"

interface StatusBadgeProps {
    status: string
    code?: number
}

export function StatusBadge({ status, code }: StatusBadgeProps) {
    if (status === "success" || (code && code >= 200 && code < 300)) {
        return (
            <Badge variant="outline" className="border-green-500 text-green-500 gap-1 pr-2">
                <CheckCircle2 className="w-3 h-3" />
                {code || "200"}
            </Badge>
        )
    }

    if (status === "failed" || (code && code >= 400)) {
        return (
            <Badge variant="destructive" className="gap-1 pr-2">
                <XCircle className="w-3 h-3" />
                {code || "ERR"}
            </Badge>
        )
    }

    if (status === "processing") {
        return (
            <Badge variant="secondary" className="gap-1 pr-2 animate-pulse">
                <Clock className="w-3 h-3" />
                Running
            </Badge>
        )
    }

    return (
        <Badge variant="outline" className="gap-1 pr-2">
            <AlertCircle className="w-3 h-3" />
            {status}
        </Badge>
    )
}
