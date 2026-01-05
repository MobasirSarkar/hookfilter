"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    SortingState,
    PaginationState,
} from "@tanstack/react-table"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Pagination, Pipe } from "@/lib/types"
import { DataTableSkeleton } from "@/components/skeleton/dataTable"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    isLoading?: boolean
    pagination: Pagination
    onPageChange: (newPage: number, newPageSize: number) => void
    onRowClick?: (row: TData) => void
    onEdit: (pipe: Pipe) => void
    onDelete: (pipe: Pipe) => void
    onView: (pipe: Pipe) => void
}

export function DataTable<TData, TValue>({
    columns,
    data,
    isLoading,
    pagination,
    onPageChange,
    onRowClick,
    onEdit,
    onDelete,
    onView,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>([])

    const pageCount = Math.ceil(pagination.total_data / pagination.page_size)

    const paginationState: PaginationState = {
        pageIndex: pagination.page - 1,
        pageSize: pagination.page_size
    }

    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualSorting: true,
        pageCount: pageCount,
        rowCount: pagination.total_data,
        state: {
            pagination: paginationState,
            sorting,
        },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        onPaginationChange: (updater) => {
            if (typeof updater === "function") {
                const newState = updater(paginationState)
                onPageChange(newState.pageIndex + 1, newState.pageSize)
            } else {
                onPageChange(updater.pageIndex + 1, updater.pageSize)
            }
        },
        meta: {
            onEdit,
            onDelete,
            onView
        }
    })

    return (
        <div className="space-y-4">
            <div className="rounded-md border bg-background">
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
                            // Skeleton Loading State
                            Array.from({ length: pagination.page_size }).map((_, i) => (
                                <TableRow key={i}>
                                    {columns.map((col, j) => (
                                        <TableCell key={j}>
                                            <DataTableSkeleton columns={col.cell?.length || 8} />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                                    onClick={() => row.getIsSelected() && "selected"}
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
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Advanced Pagination Controls */}
            <div className="flex items-center justify-between px-2">
                <div className="flex-1 text-sm text-muted-foreground">
                    Total {pagination.total_data} rows
                </div>
                <div className="flex items-center space-x-6 lg:space-x-8">
                    <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium">Rows per page</p>
                        <Select
                            value={`${pagination.page_size}`}
                            onValueChange={(value) => {
                                onPageChange(1, Number(value)) // Reset to page 1 on size change
                            }}
                        >
                            <SelectTrigger className="h-8 w-17.5">
                                <SelectValue placeholder={pagination.page_size} />
                            </SelectTrigger>
                            <SelectContent side="top">
                                {[10, 20, 30, 50, 100].map((pageSize) => (
                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                        {pageSize}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex w-25 items-center justify-center text-sm font-medium">
                        Page {pagination.page} of {pageCount}
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onPageChange(1, pagination.page_size)}
                            disabled={pagination.page === 1 || isLoading}
                        >
                            <span className="sr-only">Go to first page</span>
                            <ChevronsLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPageChange(pagination.page - 1, pagination.page_size)}
                            disabled={pagination.page === 1 || isLoading}
                        >
                            <span className="sr-only">Go to previous page</span>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="h-8 w-8 p-0"
                            onClick={() => onPageChange(pagination.page + 1, pagination.page_size)}
                            disabled={pagination.page === pageCount || isLoading}
                        >
                            <span className="sr-only">Go to next page</span>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            className="hidden h-8 w-8 p-0 lg:flex"
                            onClick={() => onPageChange(pageCount, pagination.page_size)}
                            disabled={pagination.page === pageCount || isLoading}
                        >
                            <span className="sr-only">Go to last page</span>
                            <ChevronsRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
