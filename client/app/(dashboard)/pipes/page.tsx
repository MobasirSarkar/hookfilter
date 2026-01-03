"use client"

import { useState } from "react"
import { DataTable } from "@/components/shared/data-tables/data-table"
import { columns } from "./columns"
import { usePipes } from "@/hooks/use-pipe"

export default function PipesPage() {
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)

    const { data, isLoading, isError } = usePipes(page, pageSize)

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

    if (isError) return <div>Failed to load.</div>

    return (
        <div className="container mx-auto py-10">
            <h1 className="text-3xl font-bold mb-8">My Pipes</h1>
            <DataTable
                columns={columns}
                data={pipes}
                isLoading={isLoading}
                pagination={pagination}
                onPageChange={handlePageChange}
            />
        </div>
    )
}
