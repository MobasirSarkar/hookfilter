"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
    PaginationState,
    OnChangeFn,
} from "@tanstack/react-table"
import { useState } from "react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/lib/types"

// --- GENERIC PROPS INTERFACE ---
interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    pagination: Pagination
    onPageChange: (newPage: number, newPageSize: number) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    pagination,
    onPageChange
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])

    const paginationState: PaginationState = {
        pageIndex: pagination.page - 1,
        pageSize: pagination.page_size
    }

    const handlePaginationChange: OnChangeFn<PaginationState> = (updateOrValue) => {
        const nextState = typeof updateOrValue === 'function' ? updateOrValue(paginationState) : updateOrValue
        onPageChange(nextState.pageIndex + 1, nextState.pageSize)
    }
    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualSorting: true,
        rowCount: pagination.total_data,

        onPaginationChange: handlePaginationChange,
        onSortingChange: setSorting,

        state: {
            pagination: paginationState,
            sorting,
        },

        getCoreRowModel: getCoreRowModel(),
    })

    return (
        <div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    Loading data...
                                </TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* PAGINATION CONTROLS */}
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.total_page}
                </div>
                <div className="flex space-x-2">
                    <Button
                        onClick={() =>
                            handlePaginationChange({
                                pageIndex: paginationState.pageIndex - 1,
                                pageSize: paginationState.pageSize,
                            })
                        }
                        disabled={paginationState.pageIndex === 0}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage() || isLoading}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    )
}
