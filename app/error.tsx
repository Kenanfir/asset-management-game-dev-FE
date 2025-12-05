"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Something went wrong!</h2>
                <p className="text-muted-foreground mb-6">
                    {error.message || "An unexpected error occurred. Please try again later."}
                </p>
                <div className="flex gap-4 justify-center">
                    <Button onClick={() => reset()}>Try again</Button>
                    <Button variant="outline" onClick={() => window.location.href = "/"}>
                        Go Home
                    </Button>
                </div>
            </div>
        </div>
    )
}
