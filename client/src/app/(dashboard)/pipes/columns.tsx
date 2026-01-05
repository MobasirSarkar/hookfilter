// columns.ts
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pipe } from "@/lib/types"
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

export const columns: ColumnDef<Pipe>[] = [
    {
        header: "Sr No.",
        cell: ({ row, table }) => {
            const { pageIndex, pageSize } = table.getState().pagination
            return pageIndex * pageSize + row.index + 1
        },
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "slug",
        header: "Slug",
        cell: ({ row }) => (
            <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">
                {row.getValue("slug")}
            </code>
        ),
    },
    {
        accessorKey: "target_url",
        header: "Destination",
        cell: () => (
            <span className="text-gray-500 truncate block w-40">••••••••</span>
        ),
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) =>
            new Date(row.getValue("created_at")).toLocaleDateString(),
    },
    {
        id: "actions",
        cell: ({ row, table }) => {
            const pipe = row.original
            const meta = table.options.meta as {
                onEdit?: (pipe: Pipe) => void
                onDelete?: (pipe: Pipe) => void
                onView?: (pipe: Pipe) => void
            }

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onClick={() => table.options.meta?.onView?.(pipe)}
                        >
                            View Pipe
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => meta?.onEdit?.(pipe)}>
                            Edit Pipe
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => meta?.onDelete?.(pipe)}
                        >
                            Delete Pipe
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        },
    },
]
