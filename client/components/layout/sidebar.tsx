"use client"

import { Radio, Code2, Settings } from "lucide-react"
import { useState } from "react"
import { Sidebar, SidebarBody, SidebarLink } from "../ui/sidebar"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface SideBarWrapperProps {
    AvatarUrl: string | null;
    children: React.ReactNode
}

const routes = [
    {
        label: "Pipes",
        icon: (
            <Radio className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
        href: "/pipes",
    },
    {
        label: "Playground",
        icon: (
            <Code2 className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
        href: "/playground",
    },
    {
        label: "Settings",
        icon: (
            <Settings className="h-5 w-5 shrink-0 text-neutral-700 dark:text-neutral-200" />
        ),
        href: "/settings",
    },
]

export function SidebarWrapper({ AvatarUrl, children }: SideBarWrapperProps) {
    const [open, setOpen] = useState(false);
    return (
        <div
            className={cn(
                "mx-auto flex w-full flex-1 flex-col overflow-hidden rounded-md border border-neutral-500 bg-gray-50 md:flex-row dark:border-neutral-700 dark:bg-neutral-800",
                "h-screen",
            )}
        >
            <Sidebar open={open} setOpen={setOpen}>
                <SidebarBody className="jusitfy-between gap-10">
                    <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
                        {open ? <Logo /> : <LogoIcon />}
                        <div className="mt-8 flex flex-col gap-2">
                            {routes.map((link, idx) => (
                                <SidebarLink key={idx} link={link} />
                            ))}
                        </div>
                    </div>
                    <div>
                        <SidebarLink
                            link={{
                                label: "HookFilter",
                                href: "#",
                                icon: (
                                    <img
                                        src={AvatarUrl!}
                                        className="h-7 w-7 shrink-0 rounded-full"
                                        width={50}
                                        height={50}
                                        alt="Avatar"
                                    />
                                ),
                            }}
                        />
                    </div>
                </SidebarBody>
            </Sidebar>
            {children}
        </div >
    )
}

export const Logo = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
            <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="font-medium whitespace-pre text-black dark:text-white"
            >
                HookFilter
            </motion.span>
        </a>
    );
};
export const LogoIcon = () => {
    return (
        <a
            href="#"
            className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black"
        >
            <div className="h-5 w-6 shrink-0 rounded-tl-lg rounded-tr-sm rounded-br-lg rounded-bl-sm bg-black dark:bg-white" />
        </a>
    );
};
