'use client'

import { useRouter, usePathname, useSearchParams } from "next/navigation"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ContactForm } from "@/components/contact-form"

export function Hero() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const isOpen = searchParams.get("contact") === "true"

    const handleOpenChange = (open: boolean) => {
        if (open) {
            router.replace(`${pathname}?contact=true`, { scroll: false })
        } else {
            router.replace(pathname, { scroll: false })
        }
    }

    return (
        <section className="flex flex-col items-center justify-center pt-10 px-4 bg-background text-foreground text-center space-y-8 animate-in fade-in duration-700">
            {/* Title Image */}
            <div className="relative w-full max-w-xl h-32 md:h-64 mx-2">
                <Image
                    src="/tony-cazzony-logo.png"
                    alt="Tony Cazzony Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            <div className="relative w-full max-w-3xl h-40 md:h-64 mx-2">

                <Image
                    src="/tony-cazzony-titolo.png"
                    alt="Tony Cazzony"
                    fill
                    className="object-contain"
                    priority
                />
            </div>

            {/* Claim margin:0 */}
            <h2 className="mb-0 text-3xl md:text-5xl relative text-shadow-xl top-[-50px] rotate-[-9deg] md:left-[150px] left-[75px] font-extrabold tracking-tight text-transparent bg-gradient-to-r text-white drop-shadow-[0_0_10px_rgba(0,0,0,0.9)] shadow-black">
                Muja edition!
            </h2>

            <Dialog open={isOpen} onOpenChange={handleOpenChange}>
                <DialogTrigger asChild>
                    <Button size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold text-xl px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105">
                        FAI SENTIRE LA TUA VOCE!
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-600">
                            Condividi la tua Muja!
                        </DialogTitle>
                        <DialogDescription className="text-center text-zinc-400">
                            Mandaci i tuoi scatti migliori o insultaci con amore.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <ContactForm onSuccess={() => handleOpenChange(false)} />
                    </div>
                </DialogContent>
            </Dialog>
        </section >
    )
}
