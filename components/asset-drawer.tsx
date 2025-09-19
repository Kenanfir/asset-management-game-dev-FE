"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { EnumBadge } from "@/components/ui/enum-badge"
import { StatusChip } from "@/components/ui/status-chip"
import { ExternalLink, Shield, AlertTriangle, Upload, X } from "lucide-react"
import { useState } from "react"
import { getRulePackForAssetType } from "@/lib/rule-packs"
import { useRequestAssetUpdate } from "@/lib/hooks/use-assets"
import { FileUpload } from "./file-upload"
import type { Asset } from "@/lib/types"

interface AssetDrawerProps {
  asset: Asset
  projectId: string
  onClose: () => void
}

const updateReasons = [
  "Incorrect format",
  "Quality issues",
  "Missing files",
  "Outdated content",
  "Performance optimization needed",
  "Compliance issues",
]

export function AssetDrawer({ asset, projectId, onClose }: AssetDrawerProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [updateNotes, setUpdateNotes] = useState("")

  const rulePack = getRulePackForAssetType(asset.type)
  const currentFindings = asset.history.find((h) => h.version === asset.current.version)?.findings || []
  const requestUpdateMutation = useRequestAssetUpdate()

  const handleMarkNeedsUpdate = async () => {
    if (selectedReasons.length === 0) return

    try {
      await requestUpdateMutation.mutateAsync({
        projectId,
        assetId: asset.id,
        reasons: selectedReasons,
        notes: updateNotes,
      })
      setUpdateDialogOpen(false)
      setSelectedReasons([])
      setUpdateNotes("")
    } catch (error) {
      console.error("Failed to mark asset for update:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error":
        return "text-red-400"
      case "warn":
        return "text-amber-400"
      case "info":
        return "text-blue-400"
      default:
        return "text-muted-foreground"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error":
        return "🚨"
      case "warn":
        return "⚠️"
      case "info":
        return "ℹ️"
      default:
        return "•"
    }
  }

  return (
    <>
      <DrawerHeader className="border-b border-border/50">
        <div className="flex items-start justify-between">
          <div>
            <DrawerTitle className="text-xl">{asset.key}</DrawerTitle>
            <DrawerDescription className="mt-1">{asset.description}</DrawerDescription>
            <div className="flex items-center gap-2 mt-2">
              <EnumBadge type={asset.type} />
              <StatusChip status={asset.status} />
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </DrawerHeader>

      <div className="p-6 overflow-y-auto">
        <Tabs defaultValue="summary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="needs-update">Needs Update</TabsTrigger>
          </TabsList>

          <TabsContent value="summary" className="space-y-4">
            <Card className="rounded-xl border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Asset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Base Path:</span>
                    <p className="font-mono">{asset.base_path}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Versioning:</span>
                    <p className="capitalize">{asset.versioning}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Current Version:</span>
                    <Badge variant="outline">{asset.current.version}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Assignee:</span>
                    <p>{asset.assignee_user_id ? `User ${asset.assignee_user_id}` : "Unassigned"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Current Files</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {asset.current.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded bg-muted/50">
                      <span className="font-mono text-sm">{file}</span>
                      <Button size="sm" variant="ghost">
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg">Quick Upload</CardTitle>
                <CardDescription>Drag and drop files to upload a new version</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  projectId={projectId}
                  assetType={asset.type}
                  onUploadComplete={(jobId) => {
                    console.log('Upload completed:', jobId)
                    // In a real app, you'd refresh the asset data here
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Accordion type="single" collapsible className="space-y-2">
              {asset.history.map((version, index) => (
                <AccordionItem key={index} value={version.version} className="border border-border/50 rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{version.version}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {version.files.length} file{version.files.length !== 1 ? "s" : ""}
                      </span>
                      {version.findings && version.findings.length > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          {version.findings.length} issue{version.findings.length !== 1 ? "s" : ""}
                        </Badge>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    {version.notes && (
                      <div>
                        <h4 className="text-sm font-medium mb-1">Notes</h4>
                        <p className="text-sm text-muted-foreground">{version.notes}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium mb-2">Files</h4>
                      <div className="space-y-1">
                        {version.files.map((file, fileIndex) => (
                          <div key={fileIndex} className="text-sm font-mono bg-muted/50 p-2 rounded">
                            {file}
                          </div>
                        ))}
                      </div>
                    </div>
                    {version.findings && version.findings.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Findings</h4>
                        <div className="space-y-2">
                          {version.findings.map((finding, findingIndex) => (
                            <div key={findingIndex} className="p-3 rounded bg-muted/50 border-l-2 border-amber-400">
                              <div className="flex items-center gap-2 mb-1">
                                <span className={getSeverityColor(finding.severity)}>
                                  {getSeverityIcon(finding.severity)}
                                </span>
                                <span className="text-sm font-medium">{finding.message}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Expected: {finding.expected} | Actual: {finding.actual}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card className="rounded-xl border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Rule Pack: {asset.type}
                </CardTitle>
                <CardDescription>Validation rules applied to this asset type</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Allowed Formats</h4>
                  <div className="flex gap-2">
                    {rulePack?.formats.map((format) => (
                      <Badge key={format} variant="secondary">
                        {format}
                      </Badge>
                    ))}
                  </div>
                </div>

                {rulePack?.rules && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Rules</h4>
                    <div className="space-y-2">
                      {Object.entries(rulePack.rules).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                          <span className="font-mono">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="needs-update" className="space-y-4">
            <Card className="rounded-xl border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                  Current Issues
                </CardTitle>
                <CardDescription>Issues that need to be addressed</CardDescription>
              </CardHeader>
              <CardContent>
                {currentFindings.length > 0 ? (
                  <div className="space-y-3">
                    {currentFindings.map((finding, index) => (
                      <div key={index} className="p-3 rounded bg-muted/50 border-l-2 border-amber-400">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={getSeverityColor(finding.severity)}>
                            {getSeverityIcon(finding.severity)}
                          </span>
                          <span className="text-sm font-medium">{finding.message}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Expected: {finding.expected} | Actual: {finding.actual}
                        </div>
                        {finding.evidence_paths && (
                          <div className="mt-2">
                            <span className="text-xs text-muted-foreground">Evidence:</span>
                            {finding.evidence_paths.map((path, pathIndex) => (
                              <div key={pathIndex} className="text-xs font-mono bg-background/50 p-1 rounded mt-1">
                                {path}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No current issues found.</p>
                )}
              </CardContent>
            </Card>

            <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Mark Needs Update
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Asset for Update</DialogTitle>
                  <DialogDescription>Select the reasons why this asset needs to be updated.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-3">Reasons</h4>
                    <div className="space-y-2">
                      {updateReasons.map((reason) => (
                        <div key={reason} className="flex items-center space-x-2">
                          <Checkbox
                            id={reason}
                            checked={selectedReasons.includes(reason)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedReasons([...selectedReasons, reason])
                              } else {
                                setSelectedReasons(selectedReasons.filter((r) => r !== reason))
                              }
                            }}
                          />
                          <label htmlFor={reason} className="text-sm">
                            {reason}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Additional Notes</h4>
                    <Textarea
                      placeholder="Add any additional context or requirements..."
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleMarkNeedsUpdate}
                    disabled={selectedReasons.length === 0 || requestUpdateMutation.isPending}
                  >
                    {requestUpdateMutation.isPending ? "Submitting..." : "Mark for Update"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>
    </>
  )
}
