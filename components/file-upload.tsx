"use client"

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Upload, X, File, AlertCircle, CheckCircle } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { useUploadFiles } from '@/lib/hooks/use-upload'
import type { AssetType } from '@/lib/types'
import { getExpectedFormats } from '@/lib/rule-packs'

interface FileUploadProps {
    projectId: string
    assetType?: AssetType
    onUploadComplete?: (jobId: string) => void
    className?: string
}

interface FileWithPreview extends File {
    id: string
    preview?: string
    status?: 'pending' | 'validating' | 'error' | 'success'
    error?: string
}

export function FileUpload({
    projectId,
    assetType,
    onUploadComplete,
    className
}: FileUploadProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([])
    const [isDragActive, setIsDragActive] = useState(false)

    const { setDragActive, setUploading, setUploadProgress } = useUIStore()
    const uploadMutation = useUploadFiles()

    const expectedFormats = assetType ? getExpectedFormats(assetType) : []

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
        multiple: true,
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

            onUploadComplete?.(result.id)
            setFiles([])
        } catch (error) {
            console.error('Upload failed:', error)
            // Update file statuses to show error
            setFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })))
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

    return (
        <div className={className}>
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
                                {expectedFormats.length > 0
                                    ? `Accepted formats: ${expectedFormats.join(', ')}`
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
                            {uploadMutation.isPending ? 'Uploading...' : 'Upload All'}
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

                    {/* Upload Progress */}
                    {uploadMutation.isPending && (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span>Uploading files...</span>
                                <span>{uploadMutation.data?.status || 'Processing'}</span>
                            </div>
                            <Progress value={uploadMutation.data ? 50 : 0} className="h-2" />
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
