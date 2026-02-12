import { Suspense } from "react"
import { Hero } from "@/components/hero"
import { Slideshow } from "@/components/slideshow"
import { ContactForm } from "@/components/contact-form"
import { trackPageView } from "@/app/actions"

// Tracking component to handle searchParams
async function Tracker({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const qrcode = searchParams?.qrcode

  if (qrcode && typeof qrcode === 'string') {
    // Fire and forget tracking
    // We don't await strictly to avoid blocking UI, 
    // but in Server Components usually we just call it.
    // However, Server Actions should be awaited if we want result, 
    // but here we just want side effect.
    // Note: Writing to DB in render is generally bad practice (GET request side effect).
    // but for simple tracking it's often done or use useEffect.
    // Better pattern: useEffect in a client component or a specialized route.
    // But requirement says "Check for search parameter... trigger Server Action".
    // I'll call it here but wrap in a way that doesn't block critical path hopefully.
    // Actually, calling server action from Server Component is just a function call.
    // It's fine for this demo.
    await trackPageView(`qrcode-${qrcode}`)
  }

  return null
}

export default async function Home(props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Suspense fallback={null}>
        <Tracker searchParams={searchParams} />
      </Suspense>

      <Hero />

      <section className="py-12 bg-zinc-950">
        <div className="container mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-8 text-orange-500">
            Tony&apos;s Life
          </h3>
          <Slideshow />
        </div>
      </section>

      <section className="py-20 px-4 bg-zinc-900 bg-gradient-to-t from-black to-zinc-900">
        <div className="container mx-auto">
          <ContactForm />
        </div>
      </section>

      <footer className="py-8 text-center text-zinc-600 text-sm">
        © {new Date().getFullYear()} Tony Cazzoni. All rights reserved.
      </footer>
    </main>
  )
}
