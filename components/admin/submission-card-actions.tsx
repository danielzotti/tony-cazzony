'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2, Eye, EyeOff } from "lucide-react"
import { deleteSubmission, toggleSubmissionVisibility } from "@/app/actions"
import { toast } from "sonner"
import { EditSubmissionDialog } from "./edit-submission-dialog"

interface Submission {
    id: string
    name: string
    message: string
    image_urls: string[]
    signedImages: string[]
    created_at: string
    is_visible: boolean
}

interface SubmissionCardActionsProps {
    readonly submission: Submission
}

export function SubmissionCardActions({ submission }: SubmissionCardActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isToggling, setIsToggling] = useState(false)

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this submission? This cannot be undone.")) return

        setIsDeleting(true)
        const result = await deleteSubmission(submission.id)

        if (result.success) {
            toast.success("Submission deleted")
        } else {
            toast.error(result.message || "Failed to delete submission")
            setIsDeleting(false)
        }
    }

    const handleToggleVisibility = async () => {
        setIsToggling(true)
        const result = await toggleSubmissionVisibility(submission.id, !submission.is_visible)

        if (result.success) {
            toast.success(submission.is_visible ? "Submission hidden" : "Submission published")
        } else {
            toast.error(result.message || "Failed to update visibility")
        }
        setIsToggling(false)
    }

    return (
        <div className="flex gap-2">
            <Button
                variant="outline"
                size="sm"
                onClick={handleToggleVisibility}
                disabled={isToggling}
                className={`border-zinc-700 ${submission.is_visible ? 'bg-zinc-800 text-zinc-400 hover:text-zinc-300' : 'bg-orange-500/10 text-orange-400 hover:text-orange-300 border-orange-500/50'}`}
            >
                {isToggling ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    submission.is_visible ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />
                )}
                {submission.is_visible ? "Hide" : "Show"}
            </Button>

            <EditSubmissionDialog submission={submission} />

            <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-900/50 text-white hover:bg-red-900/80 hover:text-red-300 border border-red-900"
            >
                {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                Delete
            </Button>
        </div>
    )
}
