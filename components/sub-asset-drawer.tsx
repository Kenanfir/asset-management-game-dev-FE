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
import { useMarkNeedsUpdate, useUpdateSubAsset } from "@/lib/hooks/use-asset-groups"
import { SubAssetUpload } from "./sub-asset-upload"
import { toast } from "sonner"
import type { SubAsset, RuleFinding } from "@/lib/types"

interface SubAssetDrawerProps {
    subAsset: SubAsset
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

export function SubAssetDrawer({ subAsset, projectId, onClose }: SubAssetDrawerProps) {
    const [updateDialogOpen, setUpdateDialogOpen] = useState(false)
    const [selectedReasons, setSelectedReasons] = useState<string[]>([])
    const [updateNotes, setUpdateNotes] = useState("")
    const [isEditingRules, setIsEditingRules] = useState(false)
    const [editedRules, setEditedRules] = useState(subAsset.rules || {})
    const [isEditingPath, setIsEditingPath] = useState(false)
    const [editedBasePath, setEditedBasePath] = useState(subAsset.base_path)
    const [editedPathTemplate, setEditedPathTemplate] = useState(subAsset.path_template || "")

    const markNeedsUpdateMutation = useMarkNeedsUpdate()
    const updateSubAssetMutation = useUpdateSubAsset()

    const currentFindings = subAsset.history.find((h) => h.version === subAsset.current.version)?.findings || []

    const handleMarkNeedsUpdate = async () => {
        if (selectedReasons.length === 0) return

        try {
            await markNeedsUpdateMutation.mutateAsync({
                projectId,
                subAssetId: subAsset.id,
                reasons: selectedReasons,
                notes: updateNotes,
            })
            toast.success("Sub-asset marked for update")
            setUpdateDialogOpen(false)
            setSelectedReasons([])
            setUpdateNotes("")
        } catch (error) {
            toast.error("Failed to mark sub-asset for update")
            console.error("Failed to mark sub-asset for update:", error)
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
            // In a real app, this would call an API to update the sub-asset rules
            console.log('Saving rules:', editedRules)
            setIsEditingRules(false)
        } catch (error) {
            console.error("Failed to save rules:", error)
        }
    }

    const handleCancelRules = () => {
        setEditedRules(subAsset.rules || {})
        setIsEditingRules(false)
    }

    const handleSavePath = async () => {
        if (!editedBasePath.trim()) {
            toast.error("Base path is required")
            return
        }

        try {
            await updateSubAssetMutation.mutateAsync({
                projectId,
                subAssetId: subAsset.id,
                data: {
                    base_path: editedBasePath,
                    path_template: editedPathTemplate || undefined,
                }
            })
            toast.success("Path settings saved successfully")
            setIsEditingPath(false)
        } catch (error) {
            toast.error("Failed to save path settings")
            console.error("Failed to save path settings:", error)
        }
    }

    const handleCancelPath = () => {
        setEditedBasePath(subAsset.base_path)
        setEditedPathTemplate(subAsset.path_template || "")
        setIsEditingPath(false)
    }

    const resolvePathTemplate = (template: string, version: number) => {
        return template
            .replace('{base}', editedBasePath)
            .replace('{key}', subAsset.key)
            .replace('{version}', version.toString())
            .replace('{ext}', subAsset.required_format || '')
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
                            <DrawerTitle className="text-xl">{subAsset.key}</DrawerTitle>
                            <Badge variant="outline" className="text-xs">
                                v{subAsset.current.version}
                            </Badge>
                            {currentFindings.length > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {currentFindings.length} issue{currentFindings.length !== 1 ? 's' : ''}
                                </Badge>
                            )}
                        </div>
                        <DrawerDescription className="mb-3">{subAsset.description}</DrawerDescription>
                        <div className="flex items-center gap-2 flex-wrap">
                            <EnumBadge type={subAsset.type} />
                            <Badge variant="outline" className="text-xs">
                                .{subAsset.required_format}
                            </Badge>
                            <StatusChip status={subAsset.status} />
                            {subAsset.assignee_user_id && (
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
                                    Sub-Asset Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-muted-foreground">Required Format:</span>
                                            <div className="mt-1">
                                                <Badge variant="outline" className="text-xs">
                                                    .{subAsset.required_format}
                                                </Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Versioning:</span>
                                            <p className="capitalize mt-1">{subAsset.versioning}</p>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-muted-foreground">Current Version:</span>
                                            <div className="mt-1">
                                                <Badge variant="outline">v{subAsset.current.version}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Assignee:</span>
                                            <div className="flex items-center gap-2 mt-1">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                <span>{subAsset.assignee_user_id ? `User ${subAsset.assignee_user_id}` : "Unassigned"}</span>
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
                                <CardDescription>{subAsset.current.files.length} file{subAsset.current.files.length !== 1 ? 's' : ''} in current version</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {subAsset.current.files.map((file, index) => (
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
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <FileText className="h-5 w-5" />
                                            Destination Path
                                        </CardTitle>
                                        <CardDescription>Configure where files will be uploaded</CardDescription>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsEditingPath(!isEditingPath)}
                                    >
                                        {isEditingPath ? (
                                            <>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </>
                                        ) : (
                                            <>
                                                <Edit2 className="h-4 w-4 mr-2" />
                                                Edit Path
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {isEditingPath ? (
                                    <div className="space-y-4">
                                        <div>
                                            <Label htmlFor="base-path">Base Path</Label>
                                            <Input
                                                id="base-path"
                                                value={editedBasePath}
                                                onChange={(e) => setEditedBasePath(e.target.value)}
                                                placeholder="e.g., Assets/Art/Hero"
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Root folder where files will be stored
                                            </p>
                                        </div>
                                        <div>
                                            <Label htmlFor="path-template">Path Template (Optional)</Label>
                                            <Input
                                                id="path-template"
                                                value={editedPathTemplate}
                                                onChange={(e) => setEditedPathTemplate(e.target.value)}
                                                placeholder="e.g., {base}/{key}/v{version}/"
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-xs text-muted-foreground mt-1">
                                                Use {'{base}'}, {'{key}'}, {'{version}'}, {'{ext}'} as placeholders
                                            </p>
                                        </div>
                                        {editedPathTemplate && (
                                            <div className="p-3 bg-muted/50 rounded-lg">
                                                <div className="text-sm font-medium mb-1">Preview:</div>
                                                <div className="text-xs text-muted-foreground font-mono">
                                                    {resolvePathTemplate(editedPathTemplate, subAsset.current.version + 1)}
                                                </div>
                                            </div>
                                        )}
                                        <div className="flex gap-2">
                                            <Button onClick={handleSavePath} size="sm" disabled={updateSubAssetMutation.isPending}>
                                                <Save className="h-4 w-4 mr-2" />
                                                {updateSubAssetMutation.isPending ? "Saving..." : "Save Path"}
                                            </Button>
                                            <Button onClick={handleCancelPath} variant="outline" size="sm">
                                                Cancel
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-muted-foreground text-sm">Base Path:</span>
                                            <div className="mt-1 font-mono text-sm bg-muted/50 p-2 rounded">
                                                {subAsset.base_path}
                                            </div>
                                        </div>
                                        {subAsset.path_template && (
                                            <div>
                                                <span className="text-muted-foreground text-sm">Path Template:</span>
                                                <div className="mt-1 font-mono text-sm bg-muted/50 p-2 rounded">
                                                    {subAsset.path_template}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <span className="text-muted-foreground text-sm">Next Upload Destination:</span>
                                            <div className="mt-1 font-mono text-sm bg-primary/10 text-primary p-2 rounded">
                                                {subAsset.path_template
                                                    ? resolvePathTemplate(subAsset.path_template, subAsset.current.version + 1)
                                                    : `${subAsset.base_path}/${subAsset.key}/v${subAsset.current.version + 1}/`
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="rounded-xl border-border/50 bg-card/50">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Upload className="h-5 w-5" />
                                    Quick Upload
                                </CardTitle>
                                <CardDescription>Upload a new version of this sub-asset</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <SubAssetUpload
                                    subAsset={subAsset}
                                    projectId={projectId}
                                    onUploadComplete={(jobId) => {
                                        console.log('Upload completed:', jobId)
                                        toast.success('Upload job created successfully')
                                        // In a real app, you'd refresh the sub-asset data here
                                    }}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        <Accordion type="single" collapsible className="space-y-2">
                            {subAsset.history.map((version, index) => (
                                <AccordionItem key={index} value={version.version.toString()} className="border border-border/50 rounded-lg px-4">
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <Badge variant="outline">v{version.version}</Badge>
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
                                            Sub-Asset Rules
                                        </CardTitle>
                                        <CardDescription>Validation rules for this specific sub-asset</CardDescription>
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
                                    <h4 className="text-sm font-medium mb-2">Required Format</h4>
                                    <Badge variant="secondary">
                                        .{subAsset.required_format}
                                    </Badge>
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
                                                            setEditedRules(prev => ({
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
                                                <p className="text-muted-foreground text-sm">No custom rules set. Using default rules from project settings.</p>
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
                                        <p className="text-muted-foreground">No issues found for this sub-asset.</p>
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
                                    <DialogTitle>Mark Sub-Asset for Update</DialogTitle>
                                    <DialogDescription>Select the reasons why this sub-asset needs to be updated.</DialogDescription>
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
                                        disabled={selectedReasons.length === 0 || markNeedsUpdateMutation.isPending}
                                    >
                                        {markNeedsUpdateMutation.isPending ? "Submitting..." : "Mark for Update"}
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
