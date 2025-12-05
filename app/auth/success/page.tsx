"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function AuthSuccessPage() {
    const router = useRouter()

    useEffect(() => {
        // The backend sets the session cookie, so we just need to redirect
        // We use a small timeout to ensure the cookie is processed
        const timer = setTimeout(() => {
            router.push("/projects")
        }, 100)

        return () => clearTimeout(timer)
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Completing sign in...</p>
            </div>
        </div>
    )
}
