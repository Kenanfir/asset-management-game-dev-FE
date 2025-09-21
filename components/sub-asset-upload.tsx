"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useUploadFiles } from '@/lib/hooks/use-upload'
import { useUpdateSubAsset } from '@/lib/hooks/use-asset-groups'
import type { SubAsset } from '@/lib/types'
import { getExpectedFormats } from '@/lib/rule-packs'
import { toast } from 'sonner'

interface SubAssetUploadProps {
    subAsset: SubAsset
    projectId: string
    onUploadComplete?: (jobId: string) => void
    className?: string
}

interface FileWithPreview extends File {
    id: string
    preview?: string
    status?: 'pending' | 'validating' | 'error' | 'success'
    error?: string
}

export function SubAssetUpload({
    subAsset,
    projectId,
    onUploadComplete,
    className
}: SubAssetUploadProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isDragActive, setIsDragActive] = useState(false)

    const { setDragActive, setUploading, setUploadProgress } = useUIStore()
    const uploadMutation = useUploadFiles()
    const updateSubAssetMutation = useUpdateSubAsset()

    const expectedFormats = getExpectedFormats(subAsset.type)

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
        onDragEnter: () => {
            setIsDragActive(true)
            setDragActive(true)
        },
        onDragLeave: () => {
            setIsDragActive(false)
            setDragActive(false)
        },
        accept: expectedFormats.length > 0 ?
            Object.fromEntries(expectedFormats.map(format => [`.${format}`, []])) :
            undefined,
        multiple: subAsset.type === 'sprite_animation', // Allow multiple for sequences
    })

    const removeFile = (fileId: string) => {
        setFiles(prev => prev.filter(f => f.id !== fileId))
    }

    const handleUpload = async () => {
        if (files.length === 0) return

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

            // Update sub-asset version and history
            const newVersion = subAsset.current.version + 1
            const newFiles = files.map(f => f.name)

            await updateSubAssetMutation.mutateAsync({
                projectId,
                subAssetId: subAsset.id,
                data: {
                    current: {
                        version: newVersion,
                        files: [...subAsset.current.files, ...newFiles]
                    },
                    history: [
                        ...subAsset.history,
                        {
                            version: newVersion,
                            files: newFiles,
                            notes: `Uploaded ${files.length} file${files.length !== 1 ? 's' : ''}`,
                        }
                    ]
                }
            })

            onUploadComplete?.(result.id)
            setFiles([])
            toast.success(`Uploaded to ${subAsset.base_path}`)
        } catch (error) {
            console.error('Upload failed:', error)
            setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })))
            toast.error('Upload failed')
        } finally {
            setUploading(false)
            setUploadProgress(0)
        }
    }

    const validateFile = (file: File) => {
        if (expectedFormats.length === 0) return { valid: true }

        const extension = file.name.split('.').pop()?.toLowerCase()
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

    const resolvePathTemplate = (template: string, version: number) => {
        return template
            .replace('{base}', subAsset.base_path)
            .replace('{key}', subAsset.key)
            .replace('{version}', version.toString())
            .replace('{ext}', subAsset.required_format || '')
    }

    const destinationPath = subAsset.path_template
        ? resolvePathTemplate(subAsset.path_template, subAsset.current.version + 1)
        : `${subAsset.base_path}/${subAsset.key}/v${subAsset.current.version + 1}/`

    return (
        <div className={className}>
            {/* Destination Info */}
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
                <div className="text-sm font-medium mb-1">Upload Destination</div>
                <div className="text-xs text-muted-foreground font-mono">
                    {destinationPath}
                </div>
            </div>

            {/* Drop Zone */}
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
                role="button"
                tabIndex={0}
                aria-label="Upload files to sub-asset"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        // Trigger file input
                        const input = e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement
                        input?.click()
                    }
                }}
            >
                <CardContent className="p-6 text-center">
                    <input {...getInputProps()} />

                    <div className="space-y-3">
                        <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                            <Upload className="h-5 w-5 text-muted-foreground" />
                        </div>

                        <div>
                            <p className="text-base font-medium">
                                {isDragActive
                                    ? 'Drop files here'
                                    : 'Drag & drop files here, or click to select'
                                }
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                {expectedFormats.length > 0
                                    ? `Accepted formats: ${expectedFormats.join(', ')}`
                                    : 'Any file type'
                                }
                                {subAsset.type === 'sprite_animation' && (
                                    <span className="block mt-1 text-xs">
                                        Multiple files supported for sequences
                                    </span>
                                )}
                            </p>
                        </div>

                        <Button variant="outline" size="sm">
                            Select Files
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUpload}
                            disabled={uploadMutation.isPending}
                        >
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload to Sub-Asset'}
                        </Button>
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
                                    <div className="text-xl">
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

                    {/* Upload Progress */}
                    {uploadMutation.isPending && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Uploading files...</span>
                                <span>{(uploadMutation.data as any)?.status || 'Processing'}</span>
                            </div>
                            <Progress value={uploadMutation.data ? 50 : 0} className="h-2" />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
