import { getSession } from "@/lib/auth"
import { LoginForm } from "./login-form"
import { createAdminClient } from "@/lib/supabase"
import { logoutAdmin } from "@/app/actions"
import Image from "next/image"
import Link from "next/link"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubmissionCardActions } from "@/components/admin/submission-card-actions"

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
    const session = await getSession()
    if (!session) return <div className="flex min-h-screen items-center justify-center bg-black bg-grid-white/[0.05] p-4"><LoginForm /></div>

    const supabase = createAdminClient()

    const { data: submissions } = await supabase.from('submissions').select('*').order('created_at', { ascending: false })
    const { data: pageViews } = await supabase.from('page_views').select('*').order('visited_at', { ascending: false })

    // Process images
    const submissionsWithImages = await Promise.all((submissions || []).map(async (sub) => {
        // image_urls is text[], stored as paths
        const images = await Promise.all((sub.image_urls || []).map(async (path: string) => {
            // Assuming path is relative to bucket root, e.g. "filename.jpg"
            // If full URL was stored, strip query params etc. But our action stores just filename path.
            const { data } = await supabase.storage.from('contact-uploads').createSignedUrl(path, 3600)
            return data?.signedUrl
        }))
        return { ...sub, signedImages: images.filter(Boolean) as string[] }
    }))

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-8 space-y-8">
            <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800 sticky top-0 z-10 shadow-md">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-500">
                    Dashboard
                </h1>
                <form action={logoutAdmin}>
                    <Button variant="destructive">Logout</Button>
                </form>
            </div>

            <div className="flex justify-start">
                <Link href="/">
                    <Button variant="outline" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300">
                        ← Torna al Wall
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 col-span-1 md:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-xl text-orange-400">Visitor Analytics (Total: {pageViews?.length || 0})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="max-h-60 overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-zinc-700 hover:bg-zinc-800/50">
                                        <TableHead className="text-zinc-400">Source</TableHead>
                                        <TableHead className="text-zinc-400">Time</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(pageViews || []).length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={2} className="text-center text-zinc-500">No views yet.</TableCell>
                                        </TableRow>
                                    ) : (
                                        pageViews?.slice(0, 50).map((view) => (
                                            <TableRow key={view.id} className="border-zinc-700 hover:bg-zinc-800/50">
                                                <TableCell>{view.source}</TableCell>
                                                <TableCell>{new Date(view.visited_at).toLocaleString()}</TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <h2 className="text-2xl font-bold text-orange-400">Submissions</h2>
                    {submissionsWithImages?.length === 0 && <p className="text-zinc-500">No submissions yet.</p>}

                    <div className="grid grid-cols-1 gap-6">
                        {submissionsWithImages?.map((sub) => (
                            <Card key={sub.id} className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader>
                                    <div className="flex justify-end">
                                        <SubmissionCardActions submission={sub} />
                                    </div>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <CardTitle className="text-lg font-bold text-white">{sub.name}</CardTitle>
                                                {sub.is_visible ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider border border-green-500/20">
                                                        Public
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border border-zinc-700">
                                                        Hidden
                                                    </span>
                                                )}
                                            </div>
                                            <CardDescription>{new Date(sub.created_at).toLocaleString()}</CardDescription>
                                        </div>

                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="bg-zinc-950 p-4 rounded-md border border-zinc-800">
                                        <p className="whitespace-pre-wrap text-zinc-300 font-mono text-sm">{sub.message}</p>
                                    </div>
                                    {sub.signedImages.length > 0 && (
                                        <div className="flex gap-4 overflow-x-auto pb-4 pt-2">
                                            {sub.signedImages.map((url: string, i: number) => (
                                                <div key={url} className="relative h-48 w-48 flex-shrink-0 rounded-md overflow-hidden border border-zinc-700 bg-zinc-950">
                                                    <Image
                                                        src={url}
                                                        alt={`Submission image ${i + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
