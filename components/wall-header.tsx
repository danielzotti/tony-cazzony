'use client'

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"
import { useEffect, useState, useTransition } from "react"

export function WallHeader() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const [isPending, startTransition] = useTransition()
    const [q, setQ] = useState(searchParams.get('q') || '')

    // Handle text search with debouncing
    useEffect(() => {
        const currentQ = searchParams.get('q') || ''
        if (q === currentQ) return

        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString())
            if (q) {
                params.set('q', q)
            } else {
                params.delete('q')
            }
            startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`, { scroll: false })
            })
        }, 300)

        return () => clearTimeout(timer)
    }, [q, pathname, router, searchParams])

    return (
        <div className="sticky top-0 z-40 w-full bg-black/80 backdrop-blur-md border-b border-zinc-800/50 py-4 mb-8 translate-y-[-1px]">
            <div className="container mx-auto px-4 flex flex-col items-center space-y-4">
                <h3 className="text-2xl md:text-4xl font-extrabold uppercase text-transparent bg-gradient-to-r from-green-500 to-pink-500 bg-clip-text drop-shadow-[0_0_10px_rgba(0,0,0,0.5)]">
                    Wall of Shame
                </h3>

                <div className="relative w-full max-w-md mx-auto">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Cerca nel Wall..."
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        className="pl-10 bg-zinc-900/50 border-zinc-800 focus:border-green-500/50 text-center backdrop-blur-sm"
                    />
                    {isPending && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-4 w-4 text-green-500 animate-spin" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
