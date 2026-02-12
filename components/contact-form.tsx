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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

export function ContactForm() {
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
        <Card className="w-full max-w-lg mx-auto border-2 border-zinc-800 bg-zinc-900/50 backdrop-blur-sm text-zinc-100">
            <CardHeader>
                <CardTitle className="text-2xl text-center">Contact Tony</CardTitle>
                <CardDescription className="text-center text-zinc-400">
                    Send your best photos and messages.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Your name" {...field} className="bg-zinc-800 border-zinc-700" />
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
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Write something funny..."
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
                                    <FormLabel>Images</FormLabel>
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
                                "Send to Tony"
                            )}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}
