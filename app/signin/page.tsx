"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Github } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function SignInPage() {
  const router = useRouter()

  const handleGitHubSignIn = () => {
    // Mock sign-in - in a real app this would integrate with GitHub OAuth
    // For now, just redirect to projects page
    setTimeout(() => {
      router.push("/projects")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              AssetTrackr
            </h1>
          </Link>
          <p className="text-muted-foreground mt-2">Sign in to manage your game assets</p>
        </div>

        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="text-center">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Continue with your GitHub account to access your projects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={handleGitHubSignIn} className="w-full glow-hover" size="lg">
              <Github className="mr-2 h-4 w-4" />
              Continue with GitHub
            </Button>

            <div className="text-center">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                ← Back to home
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-xs text-muted-foreground">
          <p>By signing in, you agree to our terms of service and privacy policy.</p>
        </div>
      </div>
    </div>
  )
}
