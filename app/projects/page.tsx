"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, GitBranch, Plus, Clock } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useProjects, useCreateProject } from "@/lib/hooks/use-projects"

export default function ProjectsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")

  const { data: projects = [], isLoading: loading, error } = useProjects()
  const createProjectMutation = useCreateProject()

  const handleCreateProject = async () => {
    if (!repoUrl.trim()) return

    try {
      await createProjectMutation.mutateAsync(repoUrl)
      setRepoUrl("")
      setDialogOpen(false)
    } catch (error) {
      console.error("Failed to create project:", error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Projects</h1>
            <p className="text-muted-foreground">Manage your game asset repositories</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glow-hover">
                <Plus className="mr-2 h-4 w-4" />
                Connect Repository
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Connect a Repository</DialogTitle>
                <DialogDescription>Enter the GitHub repository URL to start managing its assets.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/username/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateProject}
                  disabled={createProjectMutation.isPending || !repoUrl.trim()}
                >
                  {createProjectMutation.isPending ? "Connecting..." : "Connect"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {projects.length === 0 ? (
          <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">Connect your first repository to start managing game assets</p>
              <Button onClick={() => setDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Connect Repository
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm glow-hover">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{project.name}</CardTitle>
                      <CardDescription className="text-sm">{project.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ExternalLink className="h-3 w-3" />
                    <a
                      href={project.repo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-foreground transition-colors truncate"
                    >
                      {project.repo.replace("https://github.com/", "")}
                    </a>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <GitBranch className="h-3 w-3" />
                    <Badge variant="outline" className="text-xs">
                      {project.default_branch || 'main'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Last sync: {project.latestSyncAt ? formatDate(project.latestSyncAt) : 'Never'}</span>
                  </div>

                  <Button asChild className="w-full">
                    <Link href={`/projects/${project.id}`}>Open Project</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
