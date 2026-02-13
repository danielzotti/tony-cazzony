'use client'

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { updateSubmission, deleteSubmissionImage } from "@/app/actions"
import { Trash2, Loader2, Pencil } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface Submission {
    id: string
    name: string
    message: string
    image_urls: string[]
    signedImages: string[]
    created_at: string
}

interface EditSubmissionDialogProps {
    readonly submission: Submission
}

export function EditSubmissionDialog({ submission }: EditSubmissionDialogProps) {
    const [open, setOpen] = useState(false)
    const [name, setName] = useState(submission.name)
    const [message, setMessage] = useState(submission.message)
    const [isSaving, setIsSaving] = useState(false)
    const [deletingImages, setDeletingImages] = useState<string[]>([])

    const handleSave = async () => {
        setIsSaving(true)
        const formData = new FormData()
        formData.append("name", name)
        formData.append("message", message)

        const result = await updateSubmission(submission.id, formData)

        if (result.success) {
            toast.success("Submission updated successfully")
            setOpen(false)
        } else {
            toast.error(result.message || "Failed to update submission")
        }
        setIsSaving(false)
    }

    const handleDeleteImage = async (imagePath: string, signedUrl: string) => {
        if (!confirm("Are you sure you want to delete this image?")) return

        setDeletingImages(prev => [...prev, signedUrl])
        const result = await deleteSubmissionImage(submission.id, imagePath)

        if (result.success) {
            toast.success("Image deleted")
        } else {
            toast.error(result.message || "Failed to delete image")
            setDeletingImages(prev => prev.filter(url => url !== signedUrl))
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10 hover:text-orange-300">
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Submission</DialogTitle>
                    <DialogDescription>Make changes to the submission.</DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-zinc-900 border-zinc-700"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="message">Message</Label>
                        <Textarea
                            id="message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-zinc-900 border-zinc-700 min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Images</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {submission.signedImages.map((url, i) => {
                                // IMPORTANT: Ensure we have a path for this index
                                const path = submission.image_urls[i]
                                const isDeleting = deletingImages.includes(url)

                                if (!path) return null

                                return (
                                    <div key={url} className="relative group aspect-square rounded-md overflow-hidden bg-zinc-900 border border-zinc-800">
                                        <Image
                                            src={url}
                                            alt={`Image ${i + 1}`}
                                            fill
                                            className={`object-cover ${isDeleting ? 'opacity-50' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteImage(path, url)}
                                            disabled={isDeleting}
                                            className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 disabled:opacity-50"
                                            title="Delete Image"
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                        </button>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
