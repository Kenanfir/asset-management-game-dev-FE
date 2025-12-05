"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    let errorMessage = "An unknown error occurred during authentication."

    if (error === "oauth_failed") {
        errorMessage = "Failed to authenticate with GitHub. Please try again."
    } else if (error === "invalid_state") {
        errorMessage = "Authentication state mismatch. Please try again."
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <Card className="w-full max-w-md border-destructive/50 bg-destructive/5">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <CardTitle className="text-destructive">Authentication Error</CardTitle>
                    <CardDescription>
                        We couldn't sign you in
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        {errorMessage}
                    </p>
                    <Button asChild className="w-full">
                        <Link href="/signin">
                            Try Again
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" className="w-full">
                        <Link href="/">
                            Back to Home
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthErrorContent />
        </Suspense>
    )
}
