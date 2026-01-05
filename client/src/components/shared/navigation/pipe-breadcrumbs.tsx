"use client"

import { AppBreadcrumbs } from "./app-breadcrumbs"
import { usePipe } from "@/hooks/use-pipe"
import { useParams } from "next/navigation"

export function PipeBreadcrumbs() {
    const { id } = useParams()
    const { data: pipe, isLoading } = usePipe(id as string)

    return (
        <AppBreadcrumbs
            loading={isLoading}
            resolveLabel={(segment) => {
                if (segment === "pipes") return "Pipes"
                if (segment === id) return pipe?.name
                return undefined
            }}
        />
    )
}
