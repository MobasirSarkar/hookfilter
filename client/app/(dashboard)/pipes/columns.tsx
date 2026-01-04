"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pipe } from "@/lib/types" // Your interface
import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

// Strict Type Safety: This column def ONLY accepts 'Pipe' objects
export const columns: ColumnDef<Pipe>[] = [
    {
        accessorKey: "id",
        header: "Sr No.",
        cell: ({ row }) => (
            <div className="px-2">
                {row.index + 1}
            </div>
        )
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
        )
    },
    {
        accessorKey: "target_url",
        header: "Destination",
        cell: ({ row }) => {
            const url = row.getValue("target_url") as string
            return <span className="text-gray-500 truncate block w-40">••••••••</span>
        }
    },
    {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => {
            return new Date(row.getValue("created_at")).toLocaleDateString()
        },
    },
    // Actions Column
    {
        id: "actions",
        cell: ({ row }) => {
            const pipe = row.original // Full typed 'Pipe' object
            return (
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            )
        },
    },
]
