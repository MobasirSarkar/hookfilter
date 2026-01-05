"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutGrid, List } from "lucide-react"

import { DataTable } from "@/components/shared/data-tables/data-table"
import { columns } from "./columns"
import { usePipes } from "@/hooks/use-pipe"
import { ErrorView } from "@/components/shared/error-view"
import { AddPipeDialog } from "./add-pipe"
import { DeletePipeDialog } from "./delete-pipe"
import { UpdatePipeDialog } from "./edit-pipe"
import { PipeGrid } from "./pipe-grid" // Make sure this path is correct
import { Pipe } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function PipesPage() {
    const router = useRouter();

    // UI State
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [selectedPipe, setSelectedPipe] = useState<Pipe | null>(null)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [createOpen, setCreateOpen] = useState(false) // To trigger add dialog from empty state

    // Data State
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data, isLoading, isError, refetch } = usePipes(page, pageSize)

    const pipes = data?.pipes ?? []
    const pagination = data?.pagination ?? {
        page: page,
        page_size: pageSize,
        total_page: 1,
        total_data: 0
    }

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage)
        setPageSize(newPageSize)
    }

    // Handlers
    const handleView = (pipe: Pipe) => router.push(`/pipes/${pipe.id}`)

    const handleEdit = (pipe: Pipe) => {
        setSelectedPipe(pipe)
        setEditOpen(true)
    }

    const handleDelete = (pipe: Pipe) => {
        setSelectedPipe(pipe)
        setDeleteOpen(true)
    }

    if (isError) {
        return (
            <div className="container mx-auto py-10">
                <ErrorView
                    title="Failed to load pipes"
                    description="Please refresh or try again later."
                    actionLabel="Retry"
                    onAction={refetch}
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto py-10 space-y-8">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Pipes</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your webhook integrations and monitoring.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {/* View Switcher */}
                    <div className="flex items-center border rounded-md p-1 bg-muted/20">
                        <Button
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => setViewMode('table')}
                        >
                            <List className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* We control the dialog open state so the EmptyState in Grid can trigger it too */}
                    <AddPipeDialog />
                </div>
            </div>

            {/* Content Area */}
            {viewMode === 'table' ? (
                <DataTable
                    columns={columns}
                    data={pipes}
                    isLoading={isLoading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onRowClick={handleView}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            ) : (
                <PipeGrid
                    data={pipes}
                    isLoading={isLoading}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onCreate={() => document.getElementById("create-pipe-trigger")?.click()} // A trick to trigger the AddDialog if we don't expose state control props
                />
            )}

            {/* Modals */}
            <DeletePipeDialog
                open={deleteOpen}
                pipe={selectedPipe}
                onCloseAction={() => {
                    setDeleteOpen(false)
                    setSelectedPipe(null)
                }}
            />

            <UpdatePipeDialog
                open={editOpen}
                pipe={selectedPipe}
                onCloseAction={() => {
                    setEditOpen(false)
                    setSelectedPipe(null)
                }}
            />
        </div>
    )
}
