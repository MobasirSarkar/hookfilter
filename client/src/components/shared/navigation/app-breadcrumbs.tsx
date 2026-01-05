"use client"

import * as React from "react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

type Crumb = {
    label: string
    href?: string
}

interface AppBreadcrumbsProps {
    resolveLabel?: (segment: string) => string | undefined
    loading?: boolean
}

export function AppBreadcrumbs({
    resolveLabel,
    loading = false,
}: AppBreadcrumbsProps) {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    const crumbs: Crumb[] = segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/")
        const resolved = resolveLabel?.(segment)

        return {
            label: resolved ?? prettify(segment),
            href,
        }
    })

    if (loading) {
        return <BreadcrumbSkeleton />
    }

    return (
        <Breadcrumb>
            <BreadcrumbList>
                {crumbs.map((crumb, index) => {
                    const isLast = index === crumbs.length - 1

                    return (
                        <React.Fragment key={crumb.href}>
                            <BreadcrumbItem>
                                {isLast ? (
                                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink href={crumb.href}>
                                        {crumb.label}
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                            {!isLast && <BreadcrumbSeparator />}
                        </React.Fragment>
                    )
                })}
            </BreadcrumbList>
        </Breadcrumb>
    )
}

function prettify(segment: string) {
    return segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase())
}


function BreadcrumbSkeleton() {
    return (
        <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <span>/</span>
            <Skeleton className="h-4 w-24" />
        </div>
    )
}
