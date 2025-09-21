"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, AlertCircle, GitPullRequest, Upload, Zap, RefreshCw, ExternalLink, FileText } from "lucide-react"
import { useUploadJobs, useUploadFiles } from "@/lib/hooks/use-upload"
import { useUIStore } from "@/lib/store"
import { toast } from "sonner"
import { CardSkeleton } from "./ui/skeleton"
import { NewUploadDialog } from "./new-upload-dialog"
import type { UploadJob, UploadJobStatus } from "@/lib/types"

interface UploadJobsProps {
  projectId: string
}

const statusConfig = {
  queued: {
    label: "Queued",
    icon: Clock,
    color: "text-slate-400",
    bgColor: "bg-slate-500/20",
    progress: 10,
  },
  validating: {
    label: "Validating",
    icon: RefreshCw,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
    progress: 30,
  },
  converting: {
    label: "Converting",
    icon: Zap,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
    progress: 60,
  },
  opened_pr: {
    label: "PR Opened",
    icon: GitPullRequest,
    color: "text-violet-400",
    bgColor: "bg-violet-500/20",
    progress: 90,
  },
  done: {
    label: "Complete",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/20",
    progress: 100,
  },
  failed: {
    label: "Failed",
    icon: AlertCircle,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
    progress: 0,
  },
}

export function UploadJobs({ projectId }: UploadJobsProps) {
  const { data: jobs = [], isLoading: loading, error } = useUploadJobs(projectId)
  const uploadMutation = useUploadFiles()
  const { setSelectedAsset, setDrawerOpen } = useUIStore()
  const [newUploadDialogOpen, setNewUploadDialogOpen] = useState(false)

  const handleTestUpload = async () => {
    try {
      // Create mock files for testing
      const mockFiles = [
        new File(['test content'], 'hero_sprite_v3.png', { type: 'image/png' }),
        new File(['test content'], 'background_music_v2.wav', { type: 'audio/wav' }),
      ]

      await uploadMutation.mutateAsync({
        projectId,
        files: mockFiles,
      })

      toast.success("Upload job created successfully")
    } catch (error) {
      toast.error("Failed to create upload job")
      console.error("Failed to create upload job:", error)
    }
  }

  const handleViewAsset = (assetKey: string) => {
    // In a real app, this would find the asset by key and open the drawer
    console.log(`Opening asset: ${assetKey}`)
    toast.info(`Opening asset: ${assetKey}`)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusTimeline = (status: UploadJobStatus) => {
    const statuses: UploadJobStatus[] = ["queued", "validating", "converting", "opened_pr", "done"]
    const currentIndex = statuses.indexOf(status)

    return statuses.map((s, index) => ({
      status: s,
      completed: status === "failed" ? false : index <= currentIndex,
      current: s === status,
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Upload Jobs</h3>
            <p className="text-sm text-muted-foreground">Track asset upload and processing status</p>
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Upload Jobs</h3>
          <p className="text-sm text-muted-foreground">Track asset upload and processing status</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setNewUploadDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            New Upload
          </Button>
          <Button onClick={handleTestUpload} variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Test Upload
          </Button>
        </div>
      </div>

      {jobs.length === 0 ? (
        <Card className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm text-center py-12">
          <CardContent>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No upload jobs yet</h3>
            <p className="text-muted-foreground mb-4">Upload assets to see processing jobs here</p>
            <Button onClick={handleTestUpload}>
              <Upload className="mr-2 h-4 w-4" />
              Test Upload
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const config = statusConfig[job.status]
            const StatusIcon = config.icon
            const timeline = getStatusTimeline(job.status)

            return (
              <Card key={job.id} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${config.bgColor}`}>
                          <StatusIcon className={`h-4 w-4 ${config.color}`} />
                        </div>
                        <div>
                          <CardTitle className="text-base">Upload Job #{job.id}</CardTitle>
                          <CardDescription>
                            {job.files.length} file{job.files.length !== 1 ? "s" : ""} • Created{" "}
                            {formatDate(job.created_at)}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline" className={config.color}>
                          {config.label}
                        </Badge>
                        {job.status !== "failed" && (
                          <div className="flex-1 max-w-xs">
                            <Progress value={config.progress} className="h-2" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Files */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Files ({job.files.length})
                    </h4>
                    <div className="space-y-2">
                      {job.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50 border border-border/50">
                          <div className="flex items-center gap-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="font-mono text-xs">{file}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleViewAsset(file)}
                              className="h-6 w-6 p-0"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  {job.status !== "failed" && (
                    <div>
                      <h4 className="text-sm font-medium mb-3">Progress</h4>
                      <div className="flex items-center gap-2">
                        {timeline.map((step, index) => {
                          const stepConfig = statusConfig[step.status]
                          const StepIcon = stepConfig.icon

                          return (
                            <div key={step.status} className="flex items-center">
                              <div
                                className={`
                                flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors
                                ${step.completed
                                    ? `${stepConfig.bgColor} ${stepConfig.color} border-current`
                                    : "border-muted bg-muted/20 text-muted-foreground"
                                  }
                                ${step.current ? "ring-2 ring-primary/50" : ""}
                              `}
                              >
                                <StepIcon className="h-3 w-3" />
                              </div>
                              {index < timeline.length - 1 && (
                                <div
                                  className={`
                                  w-8 h-0.5 mx-1 transition-colors
                                  ${step.completed ? "bg-primary" : "bg-muted"}
                                `}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Queued</span>
                        <span>Validating</span>
                        <span>Converting</span>
                        <span>PR Created</span>
                        <span>Complete</span>
                      </div>
                    </div>
                  )}

                  {/* Fixes Applied */}
                  {job.fixes_applied && job.fixes_applied.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium mb-2">Fixes Applied</h4>
                      <div className="space-y-2">
                        {job.fixes_applied.map((fix, index) => (
                          <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                            <div className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-cyan-400" />
                              <span className="text-sm font-mono">{fix.conversion}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {fix.tool}
                              </Badge>
                              {fix.lossy && (
                                <Badge variant="destructive" className="text-xs">
                                  Lossy
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Error Message */}
                  {job.error_message && (
                    <div>
                      <h4 className="text-sm font-medium mb-2 text-red-400">Error</h4>
                      <div className="p-3 rounded bg-red-500/10 border border-red-500/20">
                        <p className="text-sm text-red-300">{job.error_message}</p>
                      </div>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
                    <span>Created: {formatDate(job.created_at)}</span>
                    <span>Updated: {formatDate(job.updated_at)}</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <NewUploadDialog
        projectId={projectId}
        open={newUploadDialogOpen}
        onOpenChange={setNewUploadDialogOpen}
        onUploadComplete={(jobId) => {
          console.log('Upload completed:', jobId)
          toast.success('Upload job created successfully')
        }}
      />
    </div>
  )
}
