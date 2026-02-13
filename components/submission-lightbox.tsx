'use client'

import * as React from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import { Submission } from "@/lib/data"

import { Download } from "lucide-react"

interface SubmissionLightboxProps {
    readonly submission: Submission | null
    readonly open: boolean
    readonly onOpenChange: (open: boolean) => void
}

export function SubmissionLightbox({ submission, open, onOpenChange }: SubmissionLightboxProps) {
    // Prevent rendering if no submission is selected, but keep Dialog logic correct
    if (!submission && open) return null

    const handleDownload = async (url: string, index: number) => {
        try {
            const response = await fetch(url)
            const blob = await response.blob()
            const blobUrl = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = blobUrl
            link.download = `submission-${submission?.name || 'image'}-${index + 1}.jpg`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(blobUrl)
        } catch (error) {
            console.error('Download failed:', error)
            // Fallback to opening in new tab
            window.open(url, '_blank')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-full p-0 overflow-hidden bg-black border-zinc-800 sm:max-w-4xl max-h-[100dvh]" showCloseButton={true}>
                <div className="sr-only">
                    <DialogTitle>{submission?.name} Submission</DialogTitle>
                    <DialogDescription>Details of the submission by {submission?.name}</DialogDescription>
                </div>

                <div className="relative w-full h-[100dvh] flex flex-col md:flex-row overflow-hidden">
                    {/* Image Carousel */}
                    <div className="w-full md:w-2/3 h-[75%] md:h-full bg-black relative flex items-center justify-center">
                        {submission?.signedImages && submission.signedImages.length > 0 ? (
                            <Carousel className="w-full h-full flex flex-col">
                                <CarouselContent className="h-full ml-0">
                                    {submission.signedImages.map((src, index) => (
                                        <CarouselItem key={src} className="h-full flex items-center justify-center relative pl-0">
                                            <div className="relative w-full h-full p-4">
                                                <Image
                                                    src={src}
                                                    alt={`Submission image ${index + 1}`}
                                                    fill
                                                    className="object-contain"
                                                    priority
                                                />
                                                <Button
                                                    size="icon"
                                                    variant="secondary"
                                                    className="absolute bottom-6 right-6 rounded-full bg-black/60 hover:bg-black text-white border-0 backdrop-blur-sm z-20"
                                                    onClick={() => handleDownload(src, index)}
                                                    title="Scarica immagine"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </Button>
                                            </div>
                                        </CarouselItem>
                                    ))}
                                </CarouselContent>
                                {submission.signedImages.length > 1 && (
                                    <>
                                        <CarouselPrevious className="left-6 bg-black/60 hover:bg-black text-white border-0 backdrop-blur-sm z-20" />
                                        <CarouselNext className="right-6 bg-black/60 hover:bg-black text-white border-0 backdrop-blur-sm z-20" />
                                    </>
                                )}
                            </Carousel>
                        ) : (
                            <div className="flex items-center justify-center h-full text-zinc-500 italic">
                                la persona è timida e non ha inviato foto
                            </div>
                        )}
                    </div>

                    {/* Details Panel */}
                    <div className="w-full md:w-1/3 h-[25%] md:h-full bg-zinc-900 p-6 flex flex-col overflow-y-auto border-l border-zinc-800">
                        <div className="md:mt-0">
                            <h2 className="text-2xl font-bold text-white mb-1">{submission?.name}</h2>
                            <p className="text-sm text-zinc-400">
                                {submission?.created_at ? (
                                    <>
                                        {new Date(submission.created_at).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                        <span className="ml-2 opacity-60">
                                            {new Date(submission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </>
                                ) : ''}
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
