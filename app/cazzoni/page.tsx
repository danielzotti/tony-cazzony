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
import { AdminFilters } from "@/components/admin/admin-filters"
import { AdminPagination } from "@/components/admin/admin-pagination"

export const dynamic = 'force-dynamic'

const ITEMS_PER_PAGE = 10

export default async function AdminPage({
    searchParams,
}: {
    readonly searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const params = await searchParams
    const q = (params.q as string) || ""
    const visibility = (params.visibility as string) || "all"
    const currentPage = Number(params.page) || 1

    const session = await getSession()
    if (!session) return <div className="flex min-h-screen items-center justify-center bg-black bg-grid-white/[0.05] p-4"><LoginForm /></div>

    const supabase = createAdminClient()

    // We fetch ALL submissions to filter them in memory because of the complex signed logic and text filtering
    // BUT we will also query for the range if we wanted better performance.
    // Given the small number of expected submissions, local filtering + slicing is more robust for now 
    // to maintain the "Show X of Y" logic accurately with search.

    const { data: submissions } = await supabase.from('submissions').select('*').order('created_at', { ascending: false })
    const { data: pageViews } = await supabase.from('page_views').select('*').order('visited_at', { ascending: false })

    // Group page views by source
    const viewsBySource = (pageViews || []).reduce((acc: Record<string, number>, view) => {
        acc[view.source] = (acc[view.source] || 0) + 1
        return acc
    }, {})

    const sortedSources = Object.entries(viewsBySource).sort((a, b) => b[1] - a[1])

    // Process images and filter
    const allSubmissions = await Promise.all((submissions || []).map(async (sub) => {
        const images = await Promise.all((sub.image_urls || []).map(async (path: string) => {
            const { data } = await supabase.storage.from('contact-uploads').createSignedUrl(path, 3600)
            return data?.signedUrl
        }))
        return { ...sub, signedImages: images.filter(Boolean) as string[] }
    }))

    const filteredSubmissions = allSubmissions.filter((sub) => {
        const matchesQuery = !q ||
            sub.name.toLowerCase().includes(q.toLowerCase()) ||
            sub.message.toLowerCase().includes(q.toLowerCase())

        const matchesVisibility = visibility === "all" ||
            (visibility === "public" && sub.is_visible) ||
            (visibility === "hidden" && !sub.is_visible)

        return matchesQuery && matchesVisibility
    })

    const totalPages = Math.ceil(filteredSubmissions.length / ITEMS_PER_PAGE)
    const paginatedSubmissions = filteredSubmissions.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    )

    return (
        <div className="min-h-screen bg-black text-zinc-100 p-8 space-y-8">
            <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-lg border border-zinc-800 shadow-md">
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
                    <CardContent className="space-y-6">
                        {/* Summary by Source */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Count per Source</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {sortedSources.map(([source, count]) => (
                                    <div key={source} className="bg-zinc-950 p-3 rounded-md border border-zinc-800">
                                        <div className="text-xs text-zinc-500 mb-1 truncate" title={source}>{source}</div>
                                        <div className="text-xl font-bold text-white">{count}</div>
                                    </div>
                                ))}
                                {sortedSources.length === 0 && (
                                    <div className="col-span-full text-zinc-500 italic text-sm">Nessun dato disponibile</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Recent Activity (Last 50)</h3>
                            <div className="max-h-60 overflow-y-auto border border-zinc-800 rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-zinc-700 hover:bg-zinc-800/50">
                                            <TableHead className="text-zinc-400">Source</TableHead>
                                            <TableHead className="text-zinc-400 text-right">Time</TableHead>
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
                                                    <TableCell className="font-medium">{view.source}</TableCell>
                                                    <TableCell className="text-right text-zinc-400">
                                                        {new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(view.visited_at))}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Submissions */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <h2 className="text-2xl font-bold text-orange-400">Submissions</h2>
                        <span className="text-zinc-500 text-sm">Mostrati {paginatedSubmissions.length} (Pagina {currentPage} di {totalPages})</span>
                    </div>

                    <AdminFilters />

                    {filteredSubmissions.length === 0 && (
                        <div className="text-center py-10 bg-zinc-900/50 rounded-lg border border-dashed border-zinc-800 text-zinc-500">
                            Nessun post trovato con i filtri attuali.
                        </div>
                    )}

                    <div className="grid grid-cols-1 gap-6">
                        {paginatedSubmissions.map((sub) => (
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
                                            <CardDescription>{new Intl.DateTimeFormat('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(sub.created_at))}</CardDescription>
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

                    <AdminPagination currentPage={currentPage} totalPages={totalPages} />
                </div>
            </div>
        </div>
    )
}
