import { SignJWT, jwtVerify, JWTPayload } from "jose"
import { cookies } from "next/headers"

const secretKey = process.env.AUTH_SECRET || "secret-key-placeholder-change-me"
const key = new TextEncoder().encode(secretKey)

export async function encrypt(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .setExpirationTime("24h")
        .sign(key)
}

export async function decrypt(input: string): Promise<any> {
    const { payload } = await jwtVerify(input, key, {
        algorithms: ["HS256"],
    })
    return payload
}

export async function getSession() {
    const cookieStore = await cookies()
    const session = cookieStore.get("admin_session")?.value
    if (!session) return null
    try {
        return await decrypt(session)
    } catch {
        return null
    }
}

export async function setSession(payload: JWTPayload) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)
    const session = await encrypt({ ...payload, expires })
    const cookieStore = await cookies()

    cookieStore.set("admin_session", session, {
        expires,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
    })
}

export async function clearSession() {
    const cookieStore = await cookies()
    cookieStore.delete("admin_session")
}
