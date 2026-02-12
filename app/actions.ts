'use server'

import { createAdminClient } from '@/lib/supabase'
import { setSession, clearSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

const secretKey = process.env.RECAPTCHA_SECRET_KEY

export async function submitContactForm(formData: FormData) {
    try {
        const name = formData.get('name') as string
        const message = (formData.get('message') as string) || ""
        const token = formData.get('recaptchaToken') as string
        const images = (formData.getAll('images') as File[]).filter(file => file.size > 0 && file.name !== 'undefined')

        if (!name || name.length < 2) {
            return { success: false, message: 'Name is mandatory and must be at least 2 characters.' }
        }

        // Verify ReCaptcha
        if (!token) return { success: false, message: 'Recaptcha token missing' }

        const verifyRes = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`, {
            method: 'POST',
        })
        const verifyJson = await verifyRes.json()
        if (!verifyJson.success) return { success: false, message: 'Recaptcha verification failed' }

        // Upload Images
        const imageUrls: string[] = []

        // We must use Admin Client for private bucket upload if we didn't set up public RLS for insert
        // But even better, we use Admin Client to ensure we control the upload destination.
        const adminSupabase = createAdminClient()

        for (const file of images) {
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await adminSupabase.storage
                .from('contact-uploads')
                .upload(filePath, file)

            if (uploadError) {
                console.error('Upload error:', uploadError)
                continue
            }
            imageUrls.push(filePath)
        }

        // Insert into DB
        const { error: dbError } = await adminSupabase
            .from('submissions')
            .insert({
                name,
                message,
                image_urls: imageUrls
            })

        if (dbError) {
            console.error('DB Insert error:', dbError)
            return { success: false, message: 'Failed to save submission' }
        }

        revalidatePath('/')
        return { success: true, message: 'Submission received' }
    } catch (error) {
        console.error('Submission error:', error)
        return { success: false, message: 'Internal server error' }
    }
}

export async function trackPageView(source: string) {
    try {
        // Only track if source is valid
        if (!source) return

        const adminSupabase = createAdminClient()
        await adminSupabase.from('page_views').insert({
            source,
        })
    } catch (error) {
        console.error('Tracking error:', error)
    }
}

export async function loginAdmin(formData: FormData) {
    const password = formData.get('password') as string
    const validPassword = process.env.ADMIN_PASSWORD || 'MaxPuzza' // Fallback to provided default

    // Use a timing-safe compare or just simple compare for this demo (simple is requested)
    if (password === validPassword) {
        await setSession({ admin: true })
        return { success: true }
    }

    return { success: false, message: 'Invalid password' }
}

export async function logoutAdmin() {
    await clearSession()
    redirect('/cazzoni')
}
