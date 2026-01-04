"use client"

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GridBackground } from "@/components/backgrounds/grid-backgrounds";
import { IconBrandGithub, IconWebhook } from "@tabler/icons-react";
import { useAuth } from "@/context/auth";

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <Hero />
            <Footer />
        </div>
    );
}

const Hero = () => {
    return (
        <main className="flex">
            <GridBackground>
                <section className="w-full max-w-3xl px-6 text-center space-y-6">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
                        Debug Webhooks with Confidence
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 md:text-xl">
                        Inspect, filter, and replay webhooks in real time.
                        Built for developers who need visibility into
                        event-driven systems.
                    </p>

                    <div className="flex justify-center gap-4 pt-4">
                        <Link href="/register">
                            <Button size="lg">Get Started</Button>
                        </Link>
                        <Link href="/playground">
                            <Button size="lg" variant="outline">
                                Try Playground
                            </Button>
                        </Link>
                    </div>
                </section>
            </GridBackground>
        </main>
    )
}


const Header = () => {
    const { user } = useAuth()
    return (
        <header className="sticky top-0 z-50 min-w-screen border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="container flex h-15 mx-auto">
                <div className="mr-4 flex">
                    <Link href="/" className="mr-6 flex items-center space-x-2">
                        <IconWebhook className="h-6 w-6" />
                        <span className="hidden font-bold sm:inline-block">
                            HookFilter
                        </span>
                    </Link>
                </div>

                {/* Right Actions Section */}
                <div className="flex flex-1 items-center justify-end space-x-2">
                    <nav className="flex items-center space-x-10">

                        <Button variant="ghost" size="icon" asChild className="border border-neutral-100">
                            <Link
                                href="https://github.com/MobasirSarkar/hookfilter"
                                target="_blank"
                                rel="noreferrer"
                            >
                                <IconBrandGithub className="h-5 w-5" />
                                <span className="sr-only">GitHub</span>
                            </Link>
                        </Button>

                        {/* Login Link - Primary Button variant */}
                        {user ? (
                            <Button asChild size="sm">
                                <Link href="/pipes">Dashboard</Link>
                            </Button>
                        ) : (
                            <Button asChild size="sm">
                                <Link href="/login">Login</Link>
                            </Button>
                        )}

                    </nav>
                </div>
            </div>
        </header>
    );
}

const Footer = () => {
    return (
        <footer className="border-t py-6 px-4 md:px-6 flex flex-col sm:flex-row items-center gap-2">
            <p className="text-xs text-gray-500">
                © 2025 HookFilter Inc. All rights reserved.
            </p>
            <nav className="sm:ml-auto flex gap-4">
                <Link className="text-xs hover:underline" href="#">
                    Terms
                </Link>
                <Link className="text-xs hover:underline" href="#">
                    Privacy
                </Link>
            </nav>
        </footer>
    )
}
