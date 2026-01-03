import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <header className="px-4 lg:px-6 h-14 flex items-center border-b">
                <Link className="flex items-center justify-center font-bold text-xl" href="#">
                    HookFilter
                </Link>
                <nav className="ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
                        Login
                    </Link>
                </nav>
            </header>
            <main className="flex-1">
                <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black text-white">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                                    Debug Webhooks with Confidence
                                </h1>
                                <p className="mx-auto max-w-175 text-gray-400 md:text-xl">
                                    Inspect, filter, and replay webhooks in real-time. Built for developers who need visibility into their event-driven architecture.
                                </p>
                            </div>
                            <div className="space-x-4">
                                <Link href="/register">
                                    <Button className="bg-white text-black hover:bg-gray-200" size="lg">
                                        Get Started
                                    </Button>
                                </Link>
                                <Link href="/playground">
                                    <Button variant="outline" size="lg" className="text-black border-white hover:bg-white/10 hover:text-white">
                                        Try Playground
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
                <p className="text-xs text-gray-500">© 2025 HookFilter Inc. All rights reserved.</p>
                <nav className="sm:ml-auto flex gap-4 sm:gap-6">
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Terms of Service
                    </Link>
                    <Link className="text-xs hover:underline underline-offset-4" href="#">
                        Privacy
                    </Link>
                </nav>
            </footer>
        </div>
    )
}
