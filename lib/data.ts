import { createAdminClient } from "@/lib/supabase"

export interface Submission {
    id: string
    name: string
    message: string
    created_at: string
    image_urls: string[] // original paths
    signedImages: string[] // signed urls
}

export async function getSubmissions(): Promise<Submission[]> {
    const supabase = createAdminClient()

    const { data: submissions, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching submissions:', error)
        return []
    }

    // Process images
    const submissionsWithImages = await Promise.all((submissions || []).map(async (sub) => {
        // image_urls is text[], stored as paths
        const images = await Promise.all((sub.image_urls || []).map(async (path: string) => {
            // Assuming path is relative to bucket root, e.g. "filename.jpg"
            const { data } = await supabase.storage.from('contact-uploads').createSignedUrl(path, 3600)
            return data?.signedUrl
        }))
        return { ...sub, signedImages: images.filter(Boolean) as string[] }
    }))

    return submissionsWithImages as Submission[]
}
