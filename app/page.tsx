import { Suspense } from "react"
import { Hero } from "@/components/hero"
import { WallHeader } from "@/components/wall-header"
import { trackPageView } from "@/app/actions"
import { getSubmissions } from "@/lib/data"
import { SubmissionWall } from "@/components/submission-wall"

export const dynamic = 'force-dynamic'

// Tracking component to handle searchParams
async function Tracker({ searchParams }: { searchParams: { [key: string]: string | string[] | undefined } }) {
  const qrcode = searchParams?.qrcode

  if (qrcode && typeof qrcode === 'string') {
    // Fire and forget tracking
    await trackPageView(`${qrcode}`)
  }

  return null
}

export default async function Home(props: {
  readonly searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const searchParams = await props.searchParams
  const q = (searchParams.q as string) || ""
  const allSubmissions = await getSubmissions()

  const submissions = allSubmissions.filter((sub) => {
    return !q ||
      sub.name.toLowerCase().includes(q.toLowerCase()) ||
      sub.message.toLowerCase().includes(q.toLowerCase())
  })

  return (
    <main className="min-h-screen bg-black text-white pb-20">
      <Suspense fallback={null}>
        <Tracker searchParams={searchParams} />
      </Suspense>

      <Hero />
      <WallHeader />

      <section className="lg:py-12">
        <div className="container mx-auto px-4">
          <SubmissionWall submissions={submissions} />
        </div>
      </section>

      <footer className="py-8 text-center text-zinc-600 text-sm">
        © {new Date().getFullYear()} Tony Cazzony. All rights reserved.
      </footer>
    </main>
  )
}
