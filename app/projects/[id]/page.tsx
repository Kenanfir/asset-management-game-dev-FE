"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// Removed Tabs imports since we're using sidebar navigation
import { ArrowLeft, ExternalLink, GitBranch, Clock, Activity } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useProject } from "@/lib/hooks/use-projects"
import { HierarchicalAssetTable } from "@/components/hierarchical-asset-table"
import { UploadJobs } from "@/components/upload-jobs"
import { ProjectSettings } from "@/components/project-settings"
import { useUrlParams } from "@/lib/hooks/use-url-params"

export default function ProjectPage() {
  const params = useParams()
  const { data: project, isLoading: loading, error } = useProject(params.id as string)
  const { getParam, updateParams } = useUrlParams()
  const currentTab = getParam("tab", "overview")

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Tab switching is now handled by the sidebar navigation

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/projects">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Project Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">{project.name}</h1>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />
            <a
              href={project.repo}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              {project.repo.replace("https://github.com/", "")}
            </a>
          </div>
          <div className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            <Badge variant="outline" className="text-xs">
              {project.default_branch || 'main'}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Last sync: {project.latestSyncAt ? formatDate(project.latestSyncAt) : 'Never'}</span>
          </div>
        </div>
      </div>

      {/* Content based on current tab */}
      <div className="space-y-4">
        {currentTab === "overview" && (
          <Card className="rounded-xl border border-border/50 bg-card/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                <CardTitle>Recent Activity</CardTitle>
              </div>
              <CardDescription>Latest asset management activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No recent activity to display.</p>
              </div>
            </CardContent>
          </Card>
        )}

        {currentTab === "assets" && (
          <HierarchicalAssetTable projectId={project.id} />
        )}

        {currentTab === "uploads" && (
          <UploadJobs projectId={project.id} />
        )}

        {currentTab === "settings" && (
          <ProjectSettings projectId={project.id} />
        )}
      </div>
    </div>
  )
}
