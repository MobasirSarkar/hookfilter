"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Radio, Code2, Settings } from "lucide-react"

const routes = [
    {
        label: "Pipes",
        icon: Radio,
        href: "/pipes",
        color: "text-sky-500",
    },
    {
        label: "Playground",
        icon: Code2,
        href: "/playground",
        color: "text-violet-500",
    },
    {
        label: "Settings",
        icon: Settings,
        href: "/settings",
        color: "text-gray-500",
    },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                <Link href="/pipes" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        {/* Logo placeholder */}
                        <div className="bg-white rounded-full w-full h-full flex items-center justify-center text-black font-bold">
                            H
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold">HookFilter</h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname.startsWith(route.href) ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    )
}
