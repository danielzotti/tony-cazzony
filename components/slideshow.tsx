'use client'

import * as React from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

// Placeholder images - replacing with real ones later
const images = [
    "/tony-cazzony-logo.png", // Use logo as placeholder for now
    "/tony-cazzony-logo.png",
    "/tony-cazzony-logo.png",
]

export function Slideshow() {
    const plugin = React.useRef(
        Autoplay({ delay: 3000, stopOnInteraction: true })
    )

    return (
        <div className="w-full max-w-4xl mx-auto px-4 py-8">
            <Carousel
                plugins={[plugin.current]}
                className="w-full"
                onMouseEnter={plugin.current.stop}
                onMouseLeave={plugin.current.reset}
            >
                <CarouselContent>
                    {images.map((src, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3 p-2">
                            <div className="p-1">
                                <Card className="overflow-hidden border-2 border-zinc-800 bg-zinc-900 shadow-xl">
                                    <CardContent className="flex aspect-square items-center justify-center p-0 relative">
                                        <Image
                                            src={src}
                                            alt={`Slide ${index + 1}`}
                                            fill
                                            className="object-cover transition-transform hover:scale-105 duration-500"
                                        />
                                    </CardContent>
                                </Card>
                            </div>
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>
        </div>
    )
}
