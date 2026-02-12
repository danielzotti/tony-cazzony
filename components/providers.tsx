'use client'

import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3"
import { ThemeProvider } from "next-themes"

export function Providers({ children }: { children: React.ReactNode }) {
    const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
        >
            <GoogleReCaptchaProvider
                reCaptchaKey={recaptchaKey || "placeholder_key_if_missing"}
                scriptProps={{
                    async: false,
                    defer: false,
                    appendTo: "head",
                    nonce: undefined,
                }}
            >
                {children}
            </GoogleReCaptchaProvider>
        </ThemeProvider>
    )
}
