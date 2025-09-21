"use client"

import { useCallback, useState, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload, X, File, AlertCircle, CheckCircle, Target, ArrowRight, RefreshCw } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useUploadFiles } from '@/lib/hooks/use-upload'
import { useAssetGroups } from '@/lib/hooks/use-asset-groups'
import { useProjectSettings } from '@/lib/hooks/use-project-settings'
import type { AssetType, UploadTarget, SequenceMapping, SubAsset, AssetGroup } from '@/lib/types'
import { getExpectedFormats } from '@/lib/rule-packs'
import { toast } from 'sonner'

interface EnhancedFileUploadProps {
    projectId: string
    onUploadComplete?: (jobId: string) => void
    className?: string
}

interface FileWithPreview extends File {
    id: string
    preview?: string
    status?: 'pending' | 'validating' | 'error' | 'success'
    error?: string
    mappedPath?: string
    detectedIndex?: number
    manualIndex?: number
}

export function EnhancedFileUpload({
    projectId,
    onUploadComplete,
    className
}: EnhancedFileUploadProps) {
    const [step, setStep] = useState<'target' | 'files' | 'mapping' | 'uploading'>('target')
    const [selectedTarget, setSelectedTarget] = useState<UploadTarget | null>(null)
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isDragActive, setIsDragActive] = useState(false)
    const [sequenceMapping, setSequenceMapping] = useState<SequenceMapping[]>([])
    const [manualMappingMode, setManualMappingMode] = useState(false)
    const [namingPattern, setNamingPattern] = useState('')

    const { setDragActive, setUploading, setUploadProgress } = useUIStore()
    const { data: assetGroups = [] } = useAssetGroups(projectId)
    const { data: projectSettings } = useProjectSettings(projectId)
    const uploadMutation = useUploadFiles()

    // Flatten all sub-assets for target selection
    const allSubAssets = assetGroups.flatMap(group =>
        group.children.map(subAsset => ({
            ...subAsset,
            groupId: group.id,
            groupTitle: group.title,
        }))
    )

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (!selectedTarget) return

        const newFiles: FileWithPreview[] = acceptedFiles.map((file) => ({
            ...file,
            id: Math.random().toString(36).substr(2, 9),
            status: 'pending',
        }))

        setFiles(prev => [...prev, ...newFiles])
        setDragActive(false)

        // Auto-advance to mapping if sequence upload
        if (selectedTarget.supports_sequence && acceptedFiles.length > 1) {
            setStep('mapping')
            detectSequencePattern(newFiles)
        } else {
            setStep('files')
        }
    }, [selectedTarget, setDragActive])

    const { getRootProps, getInputProps, isDragReject } = useDropzone({
        onDrop,
        onDragEnter: () => {
            setIsDragActive(true)
            setDragActive(true)
        },
        onDragLeave: () => {
            setIsDragActive(false)
            setDragActive(false)
        },
        accept: selectedTarget?.asset_type ?
            Object.fromEntries(getExpectedFormats(selectedTarget.asset_type).map(format => [`.${format}`, []])) :
            undefined,
        multiple: true,
        disabled: !selectedTarget,
    })

    const detectSequencePattern = (files: FileWithPreview[]) => {
        if (!selectedTarget || !projectSettings) return

        // Find matching naming convention
        const matchingConvention = projectSettings.naming_conventions.find(conv =>
            conv.pattern.includes('{index') &&
            selectedTarget.asset_type === 'sprite_animation'
        )

        if (matchingConvention) {
            setNamingPattern(matchingConvention.pattern)

            // Try to detect sequence indices
            const mappings: SequenceMapping[] = files.map((file, index) => {
                const detectedIndex = extractIndexFromFilename(file.name, matchingConvention.pattern)
                return {
                    source_file: file.name,
                    target_path: generateTargetPath(file.name, matchingConvention.pattern, index),
                    detected_index: detectedIndex,
                    manual_index: index,
                }
            })

            setSequenceMapping(mappings)

            // Check if detection was successful
            const successfulDetections = mappings.filter(m => m.detected_index !== undefined).length
            if (successfulDetections < files.length * 0.5) {
                setManualMappingMode(true)
                toast.warning("Could not auto-detect sequence pattern. Manual mapping required.")
            }
        } else {
            setManualMappingMode(true)
            toast.warning("No sequence pattern found. Manual mapping required.")
        }
    }

    const extractIndexFromFilename = (filename: string, pattern: string): number | undefined => {
        // Simple regex to extract numbers from filename
        const match = filename.match(/(\d+)/)
        return match ? parseInt(match[1]) : undefined
    }

    const generateTargetPath = (filename: string, pattern: string, index: number): string => {
        const baseName = filename.replace(/\.[^/.]+$/, '')
        return pattern
            .replace('{index:000}', index.toString().padStart(3, '0'))
            .replace('{index}', index.toString())
            .replace('{name}', baseName)
    }

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId))
        setSequenceMapping(prev => prev.filter(m => m.source_file !== files.find(f => f.id === fileId)?.name))
    }

    const handleTargetSelect = (target: UploadTarget) => {
        setSelectedTarget(target)
        setStep('files')
    }

    const handleManualMapping = () => {
        setManualMappingMode(true)
        setStep('mapping')
    }

    const handleSequenceMappingChange = (sourceFile: string, field: 'target_path' | 'manual_index', value: string | number) => {
        setSequenceMapping(prev => prev.map(mapping =>
            mapping.source_file === sourceFile
                ? { ...mapping, [field]: value }
                : mapping
        ))
    }

    const handleUpload = async () => {
        if (files.length === 0 || !selectedTarget) return

        setUploading(true)
        setUploadProgress(0)
        setStep('uploading')

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
            setFiles([])
            setSequenceMapping([])
            setSelectedTarget(null)
            setStep('target')
        } catch (error) {
            console.error('Upload failed:', error)
            setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })))
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const validateFile = (file: File) => {
        if (!selectedTarget?.asset_type) return { valid: true }

        const extension = file.name.split('.').pop()?.toLowerCase()
        const expectedFormats = getExpectedFormats(selectedTarget.asset_type)
        const isValidFormat = extension && expectedFormats.includes(extension)

        if (!isValidFormat) {
            return {
                valid: false,
                error: `File must be one of: ${expectedFormats.join(', ')}`
            }
        }

        return { valid: true }
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

    const resetUpload = () => {
        setStep('target')
        setSelectedTarget(null)
        setFiles([])
        setSequenceMapping([])
        setManualMappingMode(false)
    }

    return (
        <div className={className}>
            {/* Step 1: Target Selection */}
            {step === 'target' && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Target className="h-5 w-5" />
                            Select Upload Target
                        </CardTitle>
                        <CardDescription>
                            Choose which asset group or sub-asset to upload files to
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4">
                            {assetGroups.map((group) => (
                                <div key={group.id} className="border rounded-lg p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-semibold">{group.title}</h3>
                                        <Badge variant="outline">{group.children.length} sub-assets</Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{group.description}</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {group.children.map((subAsset) => (
                                            <Button
                                                key={subAsset.id}
                                                variant="outline"
                                                className="justify-start h-auto p-3"
                                                onClick={() => handleTargetSelect({
                                                    type: 'sub_asset',
                                                    id: subAsset.id,
                                                    name: subAsset.key,
                                                    asset_type: subAsset.type,
                                                    supports_sequence: subAsset.type === 'sprite_animation',
                                                })}
                                            >
                                                <div className="text-left">
                                                    <div className="font-medium">{subAsset.key}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {subAsset.type} • .{subAsset.required_format}
                                                    </div>
                                                </div>
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: File Selection */}
            {step === 'files' && selectedTarget && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <File className="h-5 w-5" />
                            Upload Files to {selectedTarget.name}
                        </CardTitle>
                        <CardDescription>
                            {selectedTarget.supports_sequence
                                ? "Upload multiple files for sequence detection or single files"
                                : "Upload files for this sub-asset"
                            }
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Card
                            {...getRootProps()}
                            className={`
                cursor-pointer transition-all duration-200 border-2 border-dashed
                ${isDragActive
                                    ? 'border-primary bg-primary/5'
                                    : isDragReject
                                        ? 'border-red-400 bg-red-50/5'
                                        : 'border-border hover:border-primary/50'
                                }
              `}
                        >
                            <CardContent className="p-8 text-center">
                                <input {...getInputProps()} />

                                <div className="space-y-4">
                                    <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                        <Upload className="h-6 w-6 text-muted-foreground" />
                                    </div>

                                    <div>
                                        <p className="text-lg font-medium">
                                            {isDragActive
                                                ? 'Drop files here'
                                                : 'Drag & drop files here, or click to select'
                                            }
                                        </p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedTarget.asset_type && getExpectedFormats(selectedTarget.asset_type).length > 0
                                                ? `Accepted formats: ${getExpectedFormats(selectedTarget.asset_type).join(', ')}`
                                                : 'Any file type'
                                            }
                                        </p>
                                    </div>

                                    <Button variant="outline" size="sm">
                                        Select Files
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {files.length > 0 && (
                            <div className="mt-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
                                    <div className="flex gap-2">
                                        {selectedTarget.supports_sequence && files.length > 1 && (
                                            <Button variant="outline" size="sm" onClick={handleManualMapping}>
                                                <RefreshCw className="h-4 w-4 mr-2" />
                                                Manual Mapping
                                            </Button>
                                        )}
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleUpload}
                                            disabled={uploadMutation.isPending}
                                        >
                                            {uploadMutation.isPending ? 'Uploading...' : 'Upload All'}
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {files.map((file) => {
                                        const validation = validateFile(file)
                                        const isValid = validation.valid

                                        return (
                                            <div
                                                key={file.id}
                                                className="flex items-center gap-3 p-3 rounded-lg border bg-card"
                                            >
                                                <div className="text-2xl">
                                                    {getFileIcon(file)}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium truncate">{file.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatFileSize(file.size)}
                                                    </p>
                                                    {!isValid && (
                                                        <p className="text-xs text-red-400 mt-1">
                                                            {validation.error}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {isValid ? (
                                                        <CheckCircle className="h-4 w-4 text-green-400" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 text-red-400" />
                                                    )}

                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => removeFile(file.id)}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Sequence Mapping */}
            {step === 'mapping' && selectedTarget && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="h-5 w-5" />
                            Sequence Mapping
                        </CardTitle>
                        <CardDescription>
                            Map your files to the correct sequence order
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs value={manualMappingMode ? "manual" : "auto"} onValueChange={(value) => setManualMappingMode(value === "manual")}>
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="auto">Auto Detection</TabsTrigger>
                                <TabsTrigger value="manual">Manual Mapping</TabsTrigger>
                            </TabsList>

                            <TabsContent value="auto" className="space-y-4">
                                <div>
                                    <Label>Naming Pattern</Label>
                                    <Input
                                        value={namingPattern}
                                        onChange={(e) => setNamingPattern(e.target.value)}
                                        placeholder="e.g., frame_{index:000}.png"
                                    />
                                </div>

                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source File</TableHead>
                                            <TableHead>Detected Index</TableHead>
                                            <TableHead>Target Path</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sequenceMapping.map((mapping, index) => (
                                            <TableRow key={mapping.source_file}>
                                                <TableCell className="font-mono text-sm">{mapping.source_file}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">
                                                        {mapping.detected_index ?? 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={mapping.target_path}
                                                        onChange={(e) => handleSequenceMappingChange(mapping.source_file, 'target_path', e.target.value)}
                                                        className="font-mono text-sm"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>

                            <TabsContent value="manual" className="space-y-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Source File</TableHead>
                                            <TableHead>Manual Index</TableHead>
                                            <TableHead>Target Path</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {sequenceMapping.map((mapping, index) => (
                                            <TableRow key={mapping.source_file}>
                                                <TableCell className="font-mono text-sm">{mapping.source_file}</TableCell>
                                                <TableCell>
                                                    <Input
                                                        type="number"
                                                        value={mapping.manual_index ?? index}
                                                        onChange={(e) => handleSequenceMappingChange(mapping.source_file, 'manual_index', parseInt(e.target.value))}
                                                        className="w-20"
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Input
                                                        value={mapping.target_path}
                                                        onChange={(e) => handleSequenceMappingChange(mapping.source_file, 'target_path', e.target.value)}
                                                        className="font-mono text-sm"
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>

                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" onClick={() => setStep('files')}>
                                Back to Files
                            </Button>
                            <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                                {uploadMutation.isPending ? 'Uploading...' : 'Upload with Mapping'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 4: Uploading */}
            {step === 'uploading' && (
                <Card>
                    <CardContent className="p-8 text-center">
                        <div className="space-y-4">
                            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <Upload className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Uploading Files</h3>
                                <p className="text-muted-foreground">Please wait while your files are being processed...</p>
                            </div>
                            <Progress value={uploadMutation.data ? 50 : 0} className="h-2" />
                            <Button variant="outline" onClick={resetUpload}>
                                Cancel Upload
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Navigation */}
            {step !== 'target' && (
                <div className="flex justify-between mt-4">
                    <Button variant="outline" onClick={resetUpload}>
                        Start Over
                    </Button>
                    <div className="text-sm text-muted-foreground">
                        Step {step === 'files' ? 2 : step === 'mapping' ? 3 : 4} of 4
                    </div>
                </div>
            )}
        </div>
    )
}
