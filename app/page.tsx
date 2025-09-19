"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Database, Shield, Zap } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            AssetTrackr
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Plan, validate, and ship game assets—versioned with your repo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="glow-hover">
              <Link href="/signin">
                Sign in with GitHub
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="pixel-heading text-primary mb-4">Core Features</h2>
          <h3 className="text-3xl font-bold mb-4">Everything you need to manage game assets</h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Streamline your game development workflow with powerful asset management tools
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm glow-hover">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Asset Table</CardTitle>
              <CardDescription>Organize and track all your game assets in one centralized table</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Version tracking with history</li>
                <li>• Status management and assignments</li>
                <li>• Advanced filtering and search</li>
                <li>• Bulk operations support</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm glow-hover">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Shield className="h-6 w-6 text-emerald-400" />
              </div>
              <CardTitle>Validation & Auto-fixes</CardTitle>
              <CardDescription>Automatically validate assets and apply fixes based on your rules</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Format validation and conversion</li>
                <li>• Rule-based quality checks</li>
                <li>• Automated optimization</li>
                <li>• Detailed error reporting</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm glow-hover">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-violet-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-violet-400" />
              </div>
              <CardTitle>Versioned Delivery</CardTitle>
              <CardDescription>Deploy assets with semantic versioning integrated with your repository</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Git-based version control</li>
                <li>• Automated PR creation</li>
                <li>• Release management</li>
                <li>• Rollback capabilities</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 AssetTrackr. Built for game developers.</p>
        </div>
      </footer>
    </div>
  )
}
