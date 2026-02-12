'use client'

import * as React from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Submission } from "@/lib/data"

interface SubmissionLightboxProps {
    readonly submission: Submission | null
    readonly open: boolean
    readonly onOpenChange: (open: boolean) => void
}

export function SubmissionLightbox({ submission, open, onOpenChange }: SubmissionLightboxProps) {
    // Prevent rendering if no submission is selected, but keep Dialog logic correct
    if (!submission && open) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black border-zinc-800 sm:max-w-4xl" showCloseButton={true}>
                <div className="sr-only">
                    <DialogTitle>{submission?.name} Submission</DialogTitle>
                    <DialogDescription>Details of the submission by {submission?.name}</DialogDescription>
                </div>

                <div className="relative w-full h-[80vh] flex flex-col md:flex-row">
                    {/* Image Carousel */}
                    <div className="w-full md:w-2/3 h-1/2 md:h-full bg-black relative flex items-center justify-center">
                        {submission?.signedImages && submission.signedImages.length > 0 ? (
                            <Carousel className="w-full h-full">
                                <CarouselContent className="h-full">
                                    {submission.signedImages.map((src, index) => (
                                        <CarouselItem key={src} className="h-full flex items-center justify-center relative pt-0">
                                            <div className="relative w-full h-full">
                                                <Image
                                                    src={src}
                                                    alt={`Submission image ${index + 1}`}
                                                    fill
                                                    className="object-contain"
                                                />
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {submission.signedImages.length > 1 && (
                                    <>
                                        <CarouselPrevious className="left-2 bg-black/50 hover:bg-black text-white border-0" />
                                        <CarouselNext className="right-2 bg-black/50 hover:bg-black text-white border-0" />
                                    </>
                                )}
                            </Carousel>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500">
                                No images
                            </div>
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="w-full md:w-1/3 h-1/2 md:h-full bg-zinc-900 p-6 flex flex-col overflow-y-auto border-l border-zinc-800">
                        <div className="mb-6 mt-8 md:mt-0">
                            <h2 className="text-2xl font-bold text-white mb-1">{submission?.name}</h2>
                            <p className="text-sm text-zinc-400">
                                {submission?.created_at ? new Date(submission.created_at).toLocaleDateString(undefined, {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                }) : ''}
                            </p>
                        </div>

                        <div className="prose prose-invert max-w-none">
                            <p className="whitespace-pre-wrap text-zinc-300 text-sm leading-relaxed">{submission?.message}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
