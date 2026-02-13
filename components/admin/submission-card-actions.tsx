'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteSubmission } from "@/app/actions"
import { toast } from "sonner"
import { EditSubmissionDialog } from "./edit-submission-dialog"

interface Submission {
    id: string
    name: string
    message: string
    image_urls: string[]
    signedImages: string[]
    created_at: string
}

interface SubmissionCardActionsProps {
    readonly submission: Submission
}

export function SubmissionCardActions({ submission }: SubmissionCardActionsProps) {
    const [isDeleting, setIsDeleting] = useState(false)

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

    return (
        <div className="flex gap-2">
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
