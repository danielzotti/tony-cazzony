'use client'

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface AdminPaginationProps {
    currentPage: number
    totalPages: number
}

export function AdminPagination({ currentPage, totalPages }: Readonly<AdminPaginationProps>) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', pageNumber.toString())
        return `${pathname}?${params.toString()}`
    }

    const handlePageChange = (pageNumber: number) => {
        router.push(createPageUrl(pageNumber))
    }

    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-center gap-2 mt-8 py-4 border-t border-zinc-800">
            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Precedente
            </Button>

            <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        className={
                            currentPage === page
                                ? "bg-orange-500 hover:bg-orange-600 text-white border-orange-500"
                                : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                        }
                    >
                        {page}
                    </Button>
                ))}
            </div>

            <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
            >
                Successivo
                <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
        </div>
    )
}
