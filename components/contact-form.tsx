'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useGoogleReCaptcha } from "react-google-recaptcha-v3"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { submitContactForm } from "@/app/actions"

const MAX_FILE_SIZE = 30000000;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);

const formSchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
    message: z.string().optional(),
    images: z
        .custom<FileList>()
        .optional()
        .refine((files) => !files || files.length === 0 || Array.from(files).every((file) => file.size <= MAX_FILE_SIZE), `Max file size is 30MB.`)
        .refine(
            (files) => !files || files.length === 0 || Array.from(files).every((file) => ACCEPTED_IMAGE_TYPES.has(file.type)),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        ),
})

interface ContactFormProps {
    readonly onSuccess?: () => void
}

export function ContactForm({ onSuccess }: ContactFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [fileInputKey, setFileInputKey] = useState(0)
    const { executeRecaptcha } = useGoogleReCaptcha()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            message: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!executeRecaptcha) {
            toast.error("Recaptcha not ready")
            return
        }

        setIsSubmitting(true)
        try {
            const token = await executeRecaptcha("contact_form")

            const formData = new FormData()
            formData.append("name", values.name)
            formData.append("message", values.message || "")
            formData.append("recaptchaToken", token)

            if (values.images && values.images.length > 0) {
                Array.from(values.images).forEach((file) => {
                    formData.append("images", file)
                })
            }

            const result = await submitContactForm(formData)

            if (result.success) {
                toast.success("Submission received! Tony thanks you.")
                form.reset()
                setFileInputKey(prev => prev + 1)
                onSuccess?.()
            } else {
                toast.error(result.message || "Something went wrong.")
            }
        } catch (error) {
            console.error(error)
            toast.error("An error occurred. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="w-full text-zinc-100 p-2">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Chi cazzo sei?</FormLabel>
                                <FormControl>
                                    <Input placeholder="Il tuo nomignolo" {...field} className="bg-zinc-800 border-zinc-700" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Cosa vuoi condividere?</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Fai anche tu il cazzone! Scrivi qualcosa di buffo sul Wall of Shame!"
                                        className="resize-none bg-zinc-800 border-zinc-700 h-32"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="images"
                        render={({ field: { value: _value, onChange, ...fieldProps } }) => (
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                            <FormItem>
                                <FormLabel>Punta e scatta <em>(dick pick apprezzate)</em></FormLabel>
                                <FormControl>
                                    <Input
                                        {...fieldProps}
                                        key={fileInputKey}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="cursor-pointer bg-zinc-800 border-zinc-700 file:text-zinc-100"
                                        onChange={(event) => {
                                            onChange(event.target.files)
                                        }}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 font-bold" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            "INVIA"
                        )}
                    </Button>
                </form>
            </Form>
        </div>
    )
}
