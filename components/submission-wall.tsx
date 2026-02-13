'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Submission } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { SubmissionLightbox } from './submission-lightbox'
import { Loader2 } from 'lucide-react'

interface SubmissionWallProps {
    readonly submissions: Submission[]
}

export function SubmissionWall({ submissions }: SubmissionWallProps) {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const [visibleCount, setVisibleCount] = useState(10)
    const loaderRef = useRef<HTMLDivElement>(null)

    const selectedId = searchParams.get('submission')
    const selectedSubmission = submissions.find(s => s.id === selectedId) || null
    const lightboxOpen = !!selectedSubmission

    const visibleSubmissions = submissions.slice(0, visibleCount)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && visibleCount < submissions.length) {
                    setVisibleCount(prev => Math.min(prev + 10, submissions.length))
                }
            },
            { threshold: 0.1, rootMargin: '100px' }
        )

        if (loaderRef.current) {
            observer.observe(loaderRef.current)
        }

        return () => observer.disconnect()
    }, [visibleCount, submissions.length])

    // Reset visibility when submissions change (e.g. searching)
    useEffect(() => {
        setVisibleCount(10)
    }, [submissions])

    const handleOpenChange = (open: boolean) => {
        const params = new URLSearchParams(searchParams.toString())
        if (!open) {
            params.delete('submission')
            const query = params.toString()
            const url = query ? `${pathname}?${query}` : pathname
            router.replace(url, { scroll: false })
        }
    }

    const handleSubmissionClick = (submission: Submission) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('submission', submission.id)
        router.push(`${pathname}?${params.toString()}`, { scroll: false })
    }

    if (!submissions || submissions.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-500">
                <p>Non ho trovato nulla! Clicca su "Fai sentire la tua voce e pubblica sul Tony Cazzony&apos;s Wall of Shame!</p>
            </div>
        )
    }

    return (
        <>
            {/* Standard Grid that guarantees chronological order on all devices */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
                {visibleSubmissions.map((submission) => (
                    <SubmissionCard
                        key={submission.id}
                        submission={submission}
                        onClick={handleSubmissionClick}
                    />
                ))}
            </div>

            {/* Infinite Scroll Loader */}
            {visibleCount < submissions.length && (
                <div ref={loaderRef} className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                </div>
            )}

            <SubmissionLightbox
                submission={selectedSubmission}
                open={lightboxOpen}
                onOpenChange={handleOpenChange}
            />
        </>
    )
}

function SubmissionCard({ submission, onClick }: { readonly submission: Submission, readonly onClick: (s: Submission) => void }) {
    return (
        <button
            type="button"
            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl group"
            onClick={() => onClick(submission)}
        >
            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
                <CardContent className="p-0">
                    {submission.signedImages.length > 0 && (
                        <div className="relative w-full aspect-[4/3] overflow-hidden">
                            <Image
                                src={submission.signedImages[0]}
                                alt={`Submission by ${submission.name}`}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-110"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            {submission.signedImages.length > 1 && (
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
                                    +{submission.signedImages.length - 1}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white text-lg truncate pr-2">{submission.name}</h3>
                            <span className="text-xs text-zinc-500 whitespace-nowrap pt-1">
                                {new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(submission.created_at))}
                            </span>
                        </div>

                        {submission.message && (
                            <p className="text-zinc-400 text-sm line-clamp-4 text-ellipsis leading-relaxed">
                                {submission.message}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </button>
    )
}
