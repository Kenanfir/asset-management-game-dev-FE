"use client"

import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    Upload,
    X,
    File,
    AlertCircle,
    CheckCircle,
    Search,
    ChevronDown,
    ChevronRight,
    Folder,
    FileText
} from 'lucide-react'
import { useAssetGroups } from '@/lib/hooks/use-asset-groups'
import { useUploadFiles } from '@/lib/hooks/use-upload'
import { useUIStore } from '@/lib/store'
import { getExpectedFormats } from '@/lib/rule-packs'
import { toast } from 'sonner'
import type { AssetGroup, SubAsset, AssetType } from '@/lib/types'

interface NewUploadDialogProps {
    projectId: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onUploadComplete?: (jobId: string) => void
}

interface FileWithPreview extends File {
    id: string
    preview?: string
    status?: 'pending' | 'validating' | 'error' | 'success'
    error?: string
}

interface SelectedTarget {
    subAsset: SubAsset
    group: AssetGroup
}

export function NewUploadDialog({
    projectId,
    open,
    onOpenChange,
    onUploadComplete
}: NewUploadDialogProps) {
    const [step, setStep] = useState(1) // 1: Select Targets, 2: Choose Mode, 3: Upload Files, 4: Review & Map
    const [selectedTargets, setSelectedTargets] = useState<SelectedTarget[]>([])
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [uploadMode, setUploadMode] = useState<'single' | 'sequence'>('single')
    const [searchQuery, setSearchQuery] = useState('')
    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const [sequenceMapping, setSequenceMapping] = useState<Array<{ source: string; target: string; index?: number }>>([])

    const { data: assetGroups, isLoading } = useAssetGroups(projectId)
    const { setDragActive, setUploading, setUploadProgress } = useUIStore()
    const uploadMutation = useUploadFiles()

    // Filter groups and sub-assets based on search
    const filteredGroups = assetGroups?.map((group: AssetGroup) => ({
        ...group,
        children: group.children.filter((subAsset: SubAsset) =>
            subAsset.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
            subAsset.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
    })).filter((group: AssetGroup) => group.children.length > 0) || []

    const handleTargetSelect = (subAsset: SubAsset, group: AssetGroup) => {
        const isSelected = selectedTargets.some(t => t.subAsset.id === subAsset.id)

        if (isSelected) {
            setSelectedTargets(prev => prev.filter(t => t.subAsset.id !== subAsset.id))
        } else {
            setSelectedTargets(prev => [...prev, { subAsset, group }])
        }
    }

    const handleGroupToggle = (groupId: string) => {
        setExpandedGroups(prev => {
            const newSet = new Set(prev)
            if (newSet.has(groupId)) {
                newSet.delete(groupId)
            } else {
                newSet.add(groupId)
            }
            return newSet
        })
    }

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: FileWithPreview[] = acceptedFiles.map((file) => ({
            ...file,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending',
        }))

        setFiles(prev => [...prev, ...newFiles])
        setDragActive(false)
    }, [setDragActive])

    const { getRootProps, getInputProps, isDragReject } = useDropzone({
        onDrop,
        onDragEnter: () => setDragActive(true),
        onDragLeave: () => setDragActive(false),
        multiple: true,
    })

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId))
    }

    const detectSequence = () => {
        if (uploadMode !== 'sequence' || selectedTargets.length === 0) return

        const target = selectedTargets[0].subAsset
        const namingConvention = (target.rules?.sequence_pattern as string) || "frame_{index:000}.png"

        // Simple sequence detection - look for index patterns
        const pattern = namingConvention.replace('{index:000}', '(\\d+)')
        const regex = new RegExp(pattern)

        const mapping = files.map((file, index) => {
            const match = file.name.match(regex)
            return {
                source: file.name,
                target: namingConvention.replace('{index:000}', String(index).padStart(3, '0')),
                index: match ? parseInt(match[1]) : index
            }
        })

        setSequenceMapping(mapping)
    }

    const handleUpload = async () => {
        if (files.length === 0 || selectedTargets.length === 0) return

        setUploading(true)
        setUploadProgress(0)

        try {
            const fileObjects = files.map(f => f as File)
            const result = await uploadMutation.mutateAsync({
                projectId,
                files: fileObjects,
                onProgress: (progress) => {
                    setUploadProgress(progress)
                }
            })

            onUploadComplete?.(result.id)
            toast.success(`Uploaded ${files.length} file${files.length !== 1 ? 's' : ''} to ${selectedTargets.length} target${selectedTargets.length !== 1 ? 's' : ''}`)

            // Reset form
            setStep(1)
            setSelectedTargets([])
            setFiles([])
            setSequenceMapping([])
            onOpenChange(false)
        } catch (error) {
            console.error('Upload failed:', error)
            toast.error('Upload failed')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const getFileIcon = (file: File) => {
        const extension = file.name.split('.').pop()?.toLowerCase()
        if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) {
            return '🖼️'
        }
        if (['wav', 'mp3', 'ogg', 'aiff'].includes(extension || '')) {
            return '🎵'
        }
        if (['fbx', 'glb', 'gltf', 'obj'].includes(extension || '')) {
            return '🎮'
        }
        return '📄'
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const resetDialog = () => {
        setStep(1)
        setSelectedTargets([])
        setFiles([])
        setSequenceMapping([])
        setSearchQuery('')
        setExpandedGroups(new Set())
    }

    // Handle escape key to close dialog
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && step === 1) {
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={(open) => {
            onOpenChange(open)
            if (!open) resetDialog()
        }}>
            <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>New Upload</DialogTitle>
                    <DialogDescription>
                        Upload files to specific sub-assets in your project
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6" onKeyDown={handleKeyDown}>
                    {/* Step 1: Select Targets */}
                    {step === 1 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Step 1: Select Target Sub-Assets</CardTitle>
                                <CardDescription>
                                    Choose which sub-assets to upload files to
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <Search className="h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search sub-assets..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="flex-1"
                                    />
                                </div>

                                <div className="max-h-64 overflow-y-auto space-y-2">
                                    {isLoading ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            Loading asset groups...
                                        </div>
                                    ) : filteredGroups.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground">
                                            No sub-assets found
                                        </div>
                                    ) : (
                                        filteredGroups.map((group: AssetGroup) => (
                                            <div key={group.id} className="border rounded-lg">
                                                <div className="flex items-center gap-2 p-3 bg-muted/50">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleGroupToggle(group.id)}
                                                        className="h-6 w-6 p-0"
                                                    >
                                                        {expandedGroups.has(group.id) ? (
                                                            <ChevronDown className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronRight className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                    <Folder className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{group.title}</span>
                                                    <Badge variant="outline" className="text-xs">
                                                        {group.children.length} sub-asset{group.children.length !== 1 ? 's' : ''}
                                                    </Badge>
                                                </div>

                                                {expandedGroups.has(group.id) && (
                                                    <div className="p-2 space-y-1">
                                                        {group.children.map((subAsset: SubAsset) => {
                                                            const isSelected = selectedTargets.some(t => t.subAsset.id === subAsset.id)
                                                            return (
                                                                <div
                                                                    key={subAsset.id}
                                                                    className="flex items-center gap-3 p-2 rounded hover:bg-muted/50 cursor-pointer"
                                                                    onClick={() => handleTargetSelect(subAsset, group)}
                                                                    role="checkbox"
                                                                    tabIndex={0}
                                                                    aria-checked={isSelected}
                                                                    aria-label={`Select ${subAsset.key} from ${group.title}`}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                                            e.preventDefault()
                                                                            handleTargetSelect(subAsset, group)
                                                                        }
                                                                    }}
                                                                >
                                                                    <Checkbox checked={isSelected} />
                                                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="font-medium text-sm">{subAsset.key}</div>
                                                                        <div className="text-xs text-muted-foreground">
                                                                            {subAsset.type} • {subAsset.base_path}
                                                                        </div>
                                                                    </div>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        v{subAsset.current.version}
                                                                    </Badge>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>

                                {selectedTargets.length > 0 && (
                                    <div className="p-3 bg-primary/10 rounded-lg">
                                        <div className="text-sm font-medium mb-2">Selected Targets ({selectedTargets.length})</div>
                                        <div className="space-y-1">
                                            {selectedTargets.map((target) => (
                                                <div key={target.subAsset.id} className="text-xs text-muted-foreground">
                                                    {target.group.title} → {target.subAsset.key}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 2: Choose Mode */}
                    {step === 2 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Step 2: Choose Upload Mode</CardTitle>
                                <CardDescription>
                                    Select how files should be processed
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Card
                                        className={`cursor-pointer transition-all ${uploadMode === 'single' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => setUploadMode('single')}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <File className="h-5 w-5" />
                                                <span className="font-medium">Single File</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Upload one file per target sub-asset
                                            </p>
                                        </CardContent>
                                    </Card>

                                    <Card
                                        className={`cursor-pointer transition-all ${uploadMode === 'sequence' ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                                            }`}
                                        onClick={() => setUploadMode('sequence')}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="h-5 w-5" />
                                                <span className="font-medium">Sequence</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                Upload multiple files as a sequence (for animations)
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {uploadMode === 'sequence' && selectedTargets.length > 0 && (
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <div className="text-sm font-medium mb-1">Sequence Pattern</div>
                                        <div className="text-xs text-muted-foreground font-mono">
                                            {(selectedTargets[0].subAsset.rules?.sequence_pattern as string) || "frame_{index:000}.png"}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 3: Upload Files */}
                    {step === 3 && (
                        <Card
                            {...getRootProps()}
                            className={`
                cursor-pointer transition-all duration-200 border-2 border-dashed
                ${isDragReject ? 'border-red-400 bg-red-50/5' : 'border-border hover:border-primary/50'}
              `}
                        >
                            <CardContent className="p-6 text-center">
                                <input {...getInputProps()} />

                                <div className="space-y-3">
                                    <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                        <Upload className="h-5 w-5 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <p className="text-base font-medium">
                                            Drag & drop files here, or click to select
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedTargets.length} target{selectedTargets.length !== 1 ? 's' : ''} selected
                                        </p>
                                    </div>

                                    <Button variant="outline" size="sm">
                                        Select Files
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Selected Files ({files.length})</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {files.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                                        >
                                            <div className="text-xl">
                                                {getFileIcon(file)}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{file.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(file.size)}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <CheckCircle className="h-4 w-4 text-green-400" />
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => removeFile(file.id)}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Step 4: Review & Map (for sequences) */}
                    {step === 4 && uploadMode === 'sequence' && sequenceMapping.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">Step 4: Review File Mapping</CardTitle>
                                <CardDescription>
                                    Review how files will be mapped to the sequence pattern
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source File</TableHead>
                                            <TableHead>Target Name</TableHead>
                                            <TableHead>Index</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sequenceMapping.map((mapping, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-mono text-sm">{mapping.source}</TableCell>
                                                <TableCell className="font-mono text-sm">{mapping.target}</TableCell>
                                                <TableCell>{mapping.index}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <DialogFooter className="flex justify-between">
                    <div className="flex gap-2">
                        {step > 1 && (
                            <Button variant="outline" onClick={() => setStep(step - 1)}>
                                Previous
                            </Button>
                        )}
                    </div>

                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>

                        {step === 1 && (
                            <Button
                                onClick={() => setStep(2)}
                                disabled={selectedTargets.length === 0}
                            >
                                Next
                            </Button>
                        )}

                        {step === 2 && (
                            <Button onClick={() => setStep(3)}>
                                Next
                            </Button>
                        )}

                        {step === 3 && (
                            <Button
                                onClick={() => {
                                    if (uploadMode === 'sequence') {
                                        detectSequence()
                                        setStep(4)
                                    } else {
                                        handleUpload()
                                    }
                                }}
                                disabled={files.length === 0}
                            >
                                {uploadMode === 'sequence' ? 'Review Mapping' : 'Upload Files'}
                            </Button>
                        )}

                        {step === 4 && (
                            <Button
                                onClick={handleUpload}
                                disabled={uploadMutation.isPending}
                            >
                                {uploadMutation.isPending ? 'Uploading...' : 'Confirm Upload'}
                            </Button>
                        )}
                    </div>
                </DialogFooter>

                {/* Upload Progress */}
                {uploadMutation.isPending && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span>Uploading files...</span>
                            <span>{uploadMutation.isPending ? 'Processing' : 'Complete'}</span>
                        </div>
                        <Progress value={uploadMutation.isPending ? 50 : 100} className="h-2" />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
