"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { EnhancedFileUpload } from './enhanced-file-upload'
import { useCreateAsset } from '@/lib/hooks/use-assets'
import { useUIStore } from '@/lib/store'
import { getExpectedFormats } from '@/lib/rule-packs'
import { getProject } from '@/lib/mock/projects'
import { Plus, Upload, X } from 'lucide-react'
import type { AssetType } from '@/lib/types'

interface BulkOperationsProps {
    projectId: string
}

export function BulkOperations({ projectId }: BulkOperationsProps) {
    const [addRowDialogOpen, setAddRowDialogOpen] = useState(false)
    const [bulkUploadDialogOpen, setBulkUploadDialogOpen] = useState(false)
    const [newAsset, setNewAsset] = useState({
        key: '',
        type: '' as AssetType | '',
        file_type: '',
        description: '',
        base_path: '',
        rules: {} as Record<string, any>,
    })
    const [projectSettings, setProjectSettings] = useState<any>(null)

    const { clearFilters } = useUIStore()
    const createAssetMutation = useCreateAsset()

    // Load project settings for default rules
    useEffect(() => {
        const loadProjectSettings = async () => {
            try {
                const project = await getProject(projectId)
                setProjectSettings(project?.settings)
            } catch (error) {
                console.error('Failed to load project settings:', error)
            }
        }
        loadProjectSettings()
    }, [projectId])

    // Update rules when asset type changes
    useEffect(() => {
        if (newAsset.type && projectSettings?.default_rules) {
            const defaultRules = projectSettings.default_rules[newAsset.type] || {}
            setNewAsset(prev => ({ ...prev, rules: defaultRules }))
        }
    }, [newAsset.type, projectSettings])

    const handleAddRow = async () => {
        if (!newAsset.key || !newAsset.type || !newAsset.file_type) return

        try {
            await createAssetMutation.mutateAsync({
                projectId,
                data: {
                    key: newAsset.key,
                    type: newAsset.type,
                    file_type: newAsset.file_type,
                    description: newAsset.description,
                    base_path: newAsset.base_path || `assets/${newAsset.type}`,
                    versioning: 'folder',
                    rules: newAsset.rules,
                    current: {
                        version: 'v1',
                        files: [],
                    },
                    history: [],
                    status: 'needed',
                },
            })

            setNewAsset({ key: '', type: '', file_type: '', description: '', base_path: '', rules: {} })
            setAddRowDialogOpen(false)
        } catch (error) {
            console.error('Failed to create asset:', error)
        }
    }

    const assetTypes: { value: AssetType; label: string; description: string }[] = [
        { value: 'sprite_static', label: 'Sprite Static', description: 'Static 2D sprites for characters, objects, and UI elements' },
        { value: 'sprite_animation', label: 'Sprite Animation', description: 'Animated 2D sprites with frame sequences' },
        { value: 'texture', label: 'Texture', description: '2D textures for materials and surfaces' },
        { value: 'audio_music', label: 'Audio Music', description: 'Background music and ambient audio' },
        { value: 'audio_sfx', label: 'Audio SFX', description: 'Sound effects for interactions and events' },
        { value: 'model_3d', label: '3D Model', description: '3D models for characters, objects, and environments' },
        { value: 'animation_3d', label: '3D Animation', description: '3D animations and motion data' },
    ]

    return (
        <div className="flex gap-2">
            {/* Add Row Dialog */}
            <Dialog open={addRowDialogOpen} onOpenChange={setAddRowDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Row
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add New Asset</DialogTitle>
                        <DialogDescription>
                            Create a new asset entry in the project.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="asset-key">Asset Key</Label>
                            <Input
                                id="asset-key"
                                placeholder="e.g., hero_sprite"
                                value={newAsset.key}
                                onChange={(e) => setNewAsset(prev => ({ ...prev, key: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="asset-type">Asset Type</Label>
                            <Select
                                value={newAsset.type}
                                onValueChange={(value) => setNewAsset(prev => ({ ...prev, type: value as AssetType }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select asset type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {assetTypes.map((type) => (
                                        <SelectItem key={type.value} value={type.value}>
                                            <div className="flex flex-col items-start w-full">
                                                <div className="flex items-center gap-2 w-full">
                                                    <span className="font-medium">{type.label}</span>
                                                    <div className="flex gap-1 ml-auto">
                                                        {getExpectedFormats(type.value).slice(0, 3).map((format) => (
                                                            <Badge key={format} variant="outline" className="text-xs px-1 py-0">
                                                                .{format}
                                                            </Badge>
                                                        ))}
                                                        {getExpectedFormats(type.value).length > 3 && (
                                                            <span className="text-xs text-muted-foreground">
                                                                +{getExpectedFormats(type.value).length - 3} more
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <span className="text-xs text-muted-foreground mt-1">{type.description}</span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* File Type Selection */}
                        {newAsset.type && (
                            <div>
                                <Label htmlFor="file-type">File Type *</Label>
                                <Select
                                    value={newAsset.file_type}
                                    onValueChange={(value) => setNewAsset(prev => ({ ...prev, file_type: value }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select specific file type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getExpectedFormats(newAsset.type).map((format) => (
                                            <SelectItem key={format} value={format}>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        .{format}
                                                    </Badge>
                                                    <span className="text-sm font-medium">{format.toUpperCase()}</span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Choose the specific file format for this asset. This will be enforced for all uploads.
                                </p>
                            </div>
                        )}

                        <div>
                            <Label htmlFor="asset-description">Description (Optional)</Label>
                            <Input
                                id="asset-description"
                                placeholder="Brief description of the asset"
                                value={newAsset.description}
                                onChange={(e) => setNewAsset(prev => ({ ...prev, description: e.target.value }))}
                            />
                        </div>

                        <div>
                            <Label htmlFor="asset-path">Base Path (Optional)</Label>
                            <Input
                                id="asset-path"
                                placeholder="e.g., assets/sprites/hero"
                                value={newAsset.base_path}
                                onChange={(e) => setNewAsset(prev => ({ ...prev, base_path: e.target.value }))}
                            />
                        </div>

                        {/* Rules Configuration */}
                        {newAsset.type && newAsset.rules && Object.keys(newAsset.rules).length > 0 && (
                            <div>
                                <Label>Asset Rules</Label>
                                <div className="space-y-3 mt-2 p-4 border border-border/50 rounded-lg bg-muted/20">
                                    {Object.entries(newAsset.rules).map(([key, value]) => (
                                        <div key={key} className="flex items-center gap-3">
                                            <Label htmlFor={`rule-${key}`} className="w-32 text-sm font-medium capitalize">
                                                {key.replace(/_/g, ' ')}:
                                            </Label>
                                            <Input
                                                id={`rule-${key}`}
                                                type={typeof value === 'number' ? 'number' : 'text'}
                                                value={value}
                                                onChange={(e) => {
                                                    const newValue = typeof value === 'number'
                                                        ? Number(e.target.value)
                                                        : e.target.value
                                                    setNewAsset(prev => ({
                                                        ...prev,
                                                        rules: {
                                                            ...prev.rules,
                                                            [key]: newValue
                                                        }
                                                    }))
                                                }}
                                                className="flex-1"
                                            />
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    These rules will be applied when validating uploads for this asset
                                </p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddRowDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddRow}
                            disabled={!newAsset.key || !newAsset.type || !newAsset.file_type || createAssetMutation.isPending}
                        >
                            {createAssetMutation.isPending ? 'Creating...' : 'Create Asset'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Bulk Upload Dialog */}
            <Dialog open={bulkUploadDialogOpen} onOpenChange={setBulkUploadDialogOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Bulk Upload
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Bulk Upload Assets</DialogTitle>
                        <DialogDescription>
                            Upload multiple files at once. Files will be automatically organized by type.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <EnhancedFileUpload
                            projectId={projectId}
                            onUploadComplete={(jobId) => {
                                console.log('Bulk upload completed:', jobId)
                                setBulkUploadDialogOpen(false)
                            }}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setBulkUploadDialogOpen(false)}>
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
