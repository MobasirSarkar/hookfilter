import { Sidebar } from "@/components/layout/sidebar"
import { UserNav } from "@/components/layout/user-nav"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-900">
                <Sidebar />
            </div>

            {/* Main Content */}
            <main className="md:pl-72">
                <div className="flex items-center justify-end p-4 border-b h-16">
                    <UserNav />
                </div>
                {children}
            </main>
        </div>
    )
}
