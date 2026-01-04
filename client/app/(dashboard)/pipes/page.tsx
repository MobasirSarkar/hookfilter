"use client"

import { useState } from "react"
import { DataTable } from "@/components/shared/data-tables/data-table"
import { columns } from "./columns"
import { usePipes } from "@/hooks/use-pipe"
import { DataTableSkeleton } from "@/components/skeleton/dataTable"
import { ErrorView } from "@/components/shared/error-view"
import { useRouter } from "next/navigation"

export default function PipesPage() {
    const router = useRouter();
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
    if (isLoading) {
        return <DataTableSkeleton columns={columns.length} />
    }

    const handlePageChange = (newPage: number, newPageSize: number) => {
        setPage(newPage)
        setPageSize(newPageSize)
    }

    if (isError) {
        return (
            <ErrorView
                title="Failed to load pipes"
                description="Please refresh or try again later."
                actionLabel="Retry"
                onAction={refetch}
            />
        );
    }

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">My Pipes</h1>
            <DataTable
                columns={columns}
                data={pipes}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
                onRowClick={(pipe) => router.push(`/pipes/${pipe.id}`)}
            />
        </div>
    )
}
