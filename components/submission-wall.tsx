'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Submission } from '@/lib/data'
import { Card, CardContent } from '@/components/ui/card'
import { SubmissionLightbox } from './submission-lightbox'

interface SubmissionWallProps {
    readonly submissions: Submission[]
}

export function SubmissionWall({ submissions }: SubmissionWallProps) {
    const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
    const [lightboxOpen, setLightboxOpen] = useState(false)

    const handleSubmissionClick = (submission: Submission) => {
        setSelectedSubmission(submission)
        setLightboxOpen(true)
    }

    if (!submissions || submissions.length === 0) {
        return (
            <div className="text-center py-20 text-zinc-500">
                <p>No submissions yet. Be the first to join Tony&apos;s Wall!</p>
            </div>
        )
    }

    return (
        <>
            {/* Masonry Layout using CSS columns */}
            <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                {submissions.map((submission) => (
                    <div
                        key={submission.id}
                        className="break-inside-avoid"
                    >
                        <button
                            type="button"
                            className="w-full text-left focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-xl group"
                            onClick={() => handleSubmissionClick(submission)}
                        >
                            <Card className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-orange-500/50 transition-all hover:shadow-lg hover:shadow-orange-500/10">
                                <CardContent className="p-0">
                                    {/* Thumbnail Image */}
                                    {submission.signedImages.length > 0 ? (
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
                                    ) : (
                                        <div className="w-full aspect-[4/3] bg-zinc-800 flex items-center justify-center text-zinc-600">
                                            No Image
                                        </div>
                                    )}

                                    {/* Content Preview */}
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white text-lg truncate pr-2">{submission.name}</h3>
                                            <span className="text-xs text-zinc-500 whitespace-nowrap pt-1">
                                                {new Date(submission.created_at).toLocaleDateString()}
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
                    </div>
                ))}
            </div >

            <SubmissionLightbox
                submission={selectedSubmission}
                open={lightboxOpen}
                onOpenChange={setLightboxOpen}
            />
        </>
    )
}
