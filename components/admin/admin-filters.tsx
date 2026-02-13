'use client'

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search } from "lucide-react"
import { useTransition, useEffect, useState } from "react"

export function AdminFilters() {
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

    const handleVisibilityChange = (value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        if (value === 'all') {
            params.delete('visibility')
        } else {
            params.set('visibility', value)
        }
        startTransition(() => {
            router.replace(`${pathname}?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                    placeholder="Cerca per nome o messaggio..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className="pl-10 bg-zinc-900 border-zinc-800 focus:border-orange-500/50"
                />
            </div>
            <div className="w-full md:w-48">
                <Select
                    defaultValue={searchParams.get('visibility') || 'all'}
                    onValueChange={handleVisibilityChange}
                >
                    <SelectTrigger className="bg-zinc-900 border-zinc-800 focus:ring-orange-500/50">
                        <SelectValue placeholder="Visibilità" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                        <SelectItem value="all">Tutti</SelectItem>
                        <SelectItem value="public">Pubblici</SelectItem>
                        <SelectItem value="hidden">Nascosti</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {isPending && (
                <div className="flex items-center text-xs text-zinc-500 animate-pulse">
                    Filtraggio...
                </div>
            )}
        </div>
    )
}
