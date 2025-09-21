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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EnumBadge } from "@/components/ui/enum-badge"
import { StatusChip } from "@/components/ui/status-chip"
import { ExternalLink, Shield, AlertTriangle, Upload, X, Edit2, Save, Copy, Github, Clock, User, FileText, Zap } from "lucide-react"
import { useState } from "react"
import { getRulePackForAssetType } from "@/lib/rule-packs"
import { useRequestAssetUpdate } from "@/lib/hooks/use-assets"
import { FileUpload } from "./file-upload"
import { toast } from "sonner"
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
  "Rule violations",
  "Size optimization needed",
  "Color profile issues",
  "Compression artifacts",
]

const severityIcons = {
  error: "🚨",
  warn: "⚠️",
  info: "ℹ️",
}

const severityColors = {
  error: "text-red-400",
  warn: "text-amber-400",
  info: "text-blue-400",
}

export function AssetDrawer({ asset, projectId, onClose }: AssetDrawerProps) {
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
  const [selectedReasons, setSelectedReasons] = useState<string[]>([])
  const [updateNotes, setUpdateNotes] = useState("")
  const [isEditingRules, setIsEditingRules] = useState(false)
  const [editedRules, setEditedRules] = useState(asset.rules || {})

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
      toast.success("Asset marked for update")
      setUpdateDialogOpen(false)
      setSelectedReasons([])
      setUpdateNotes("")
    } catch (error) {
      toast.error("Failed to mark asset for update")
      console.error("Failed to mark asset for update:", error)
    }
  }

  const handleCopyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleOpenInGitHub = (filePath: string) => {
    // In a real app, this would open the file in GitHub
    toast.info("GitHub integration coming soon")
  }

  const handleSaveRules = async () => {
    try {
      // In a real app, this would call an API to update the asset rules
      console.log('Saving rules:', editedRules)
      setIsEditingRules(false)
    } catch (error) {
      console.error("Failed to save rules:", error)
    }
  }

  const handleCancelRules = () => {
    setEditedRules(asset.rules || {})
    setIsEditingRules(false)
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
      <DrawerHeader className="border-b border-border/50 sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <DrawerTitle className="text-xl">{asset.key}</DrawerTitle>
              <Badge variant="outline" className="text-xs">
                {asset.current.version}
              </Badge>
              {currentFindings.length > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {currentFindings.length} issue{currentFindings.length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <DrawerDescription className="mb-3">{asset.description}</DrawerDescription>
            <div className="flex items-center gap-2 flex-wrap">
              <EnumBadge type={asset.type} />
              <Badge variant="outline" className="text-xs">
                .{asset.file_type}
              </Badge>
              <StatusChip status={asset.status} />
              {asset.assignee_user_id && (
                <Badge variant="secondary" className="text-xs">
                  <User className="h-3 w-3 mr-1" />
                  Assigned
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            <Button variant="outline" size="sm">
              <Edit2 className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Asset Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Base Path:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="font-mono text-xs bg-muted/50 px-2 py-1 rounded">{asset.base_path}</p>
                        <Button size="sm" variant="ghost" onClick={() => handleCopyToClipboard(asset.base_path)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">File Type:</span>
                      <div className="mt-1">
                        <Badge variant="outline" className="text-xs">
                          .{asset.file_type}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Versioning:</span>
                      <p className="capitalize mt-1">{asset.versioning}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-muted-foreground">Current Version:</span>
                      <div className="mt-1">
                        <Badge variant="outline">{asset.current.version}</Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assignee:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span>{asset.assignee_user_id ? `User ${asset.assignee_user_id}` : "Unassigned"}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span>2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Current Files
                </CardTitle>
                <CardDescription>{asset.current.files.length} file{asset.current.files.length !== 1 ? 's' : ''} in current version</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {asset.current.files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{file}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button size="sm" variant="ghost" onClick={() => handleCopyToClipboard(file)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => handleOpenInGitHub(file)}>
                          <Github className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-border/50 bg-card/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Quick Upload
                </CardTitle>
                <CardDescription>Drag and drop files to upload a new version</CardDescription>
              </CardHeader>
              <CardContent>
                <FileUpload
                  projectId={projectId}
                  assetType={asset.type}
                  onUploadComplete={(jobId) => {
                    console.log('Upload completed:', jobId)
                    toast.success('Upload job created successfully')
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
                                Expected: {String(finding.expected)} | Actual: {String(finding.actual)}
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
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Asset Rules
                    </CardTitle>
                    <CardDescription>Validation rules for this specific asset</CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingRules(!isEditingRules)}
                  >
                    {isEditingRules ? (
                      <>
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Rules
                      </>
                    )}
                  </Button>
                </div>
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

                {isEditingRules ? (
                  <div>
                    <h4 className="text-sm font-medium mb-3">Edit Rules</h4>
                    <div className="space-y-3">
                      {Object.entries(editedRules).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <Label htmlFor={`rule-${key}`} className="w-32 text-sm font-medium capitalize">
                            {key.replace(/_/g, ' ')}:
                          </Label>
                          <Input
                            id={`rule-${key}`}
                            type={typeof value === 'number' ? 'number' : 'text'}
                            value={String(value)}
                            onChange={(e) => {
                              const newValue = typeof value === 'number'
                                ? Number(e.target.value)
                                : e.target.value
                              setEditedRules((prev: Record<string, any>) => ({
                                ...prev,
                                [key]: newValue
                              }))
                            }}
                            className="flex-1"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button onClick={handleSaveRules} size="sm">
                        <Save className="h-4 w-4 mr-2" />
                        Save Rules
                      </Button>
                      <Button onClick={handleCancelRules} variant="outline" size="sm">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Current Rules</h4>
                    <div className="space-y-2">
                      {Object.keys(editedRules).length > 0 ? (
                        Object.entries(editedRules).map(([key, value]) => (
                          <div key={key} className="flex justify-between text-sm">
                            <span className="text-muted-foreground capitalize">{key.replace(/_/g, " ")}:</span>
                            <span className="font-mono">{Array.isArray(value) ? value.join(", ") : String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-sm">No custom rules set. Using default rules from rule pack.</p>
                      )}
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
                  {currentFindings.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {currentFindings.length}
                    </Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  {currentFindings.length > 0
                    ? `${currentFindings.length} issue${currentFindings.length !== 1 ? 's' : ''} that need to be addressed`
                    : "No current issues found"
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentFindings.length > 0 ? (
                  <div className="space-y-4">
                    {currentFindings.map((finding, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-start gap-3 mb-3">
                          <div className={`p-2 rounded-full ${severityColors[finding.severity]} bg-opacity-20`}>
                            <span className="text-lg">{severityIcons[finding.severity]}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-sm font-medium">{finding.message}</span>
                              <Badge variant="outline" className="text-xs">
                                {finding.rule_id}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div>
                                <span className="text-muted-foreground">Expected:</span>
                                <p className="font-mono bg-green-500/10 text-green-400 px-2 py-1 rounded mt-1">
                                  {String(finding.expected)}
                                </p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Actual:</span>
                                <p className="font-mono bg-red-500/10 text-red-400 px-2 py-1 rounded mt-1">
                                  {String(finding.actual)}
                                </p>
                              </div>
                            </div>
                            {finding.evidence_paths && finding.evidence_paths.length > 0 && (
                              <div className="mt-3">
                                <span className="text-xs text-muted-foreground font-medium">Evidence:</span>
                                <div className="space-y-1 mt-1">
                                  {finding.evidence_paths.map((path, pathIndex) => (
                                    <div key={pathIndex} className="flex items-center justify-between text-xs font-mono bg-background/50 p-2 rounded border">
                                      <span>{path}</span>
                                      <div className="flex items-center gap-1">
                                        <Button size="sm" variant="ghost" onClick={() => handleCopyToClipboard(path)}>
                                          <Copy className="h-3 w-3" />
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenInGitHub(path)}>
                                          <Github className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">All Good!</h3>
                    <p className="text-muted-foreground">No issues found for this asset.</p>
                  </div>
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
