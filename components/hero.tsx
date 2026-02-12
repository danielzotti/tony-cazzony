import Image from "next/image"

export function Hero() {
    return (
        <section className="flex flex-col items-center justify-center py-20 bg-background text-foreground text-center space-y-8 animate-in fade-in duration-700">
            {/* Title Image */}
            <div className="relative w-full max-w-3xl h-40 md:h-64">
                <Image
                    src="/tony-cazzony-titolo.png"
                    alt="Tony Cazzoni"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Claim */}
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600 drop-shadow-sm">
                Vuoi fare il caxxone anche tu?
            </h2>
        </section>
    )
}
