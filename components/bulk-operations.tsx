"use client"

import { useState } from 'react'
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
import { FileUpload } from './file-upload'
import { useCreateAsset } from '@/lib/hooks/use-assets'
import { useUIStore } from '@/lib/store'
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
        description: '',
        base_path: '',
    })

    const { clearFilters } = useUIStore()
    const createAssetMutation = useCreateAsset()

    const handleAddRow = async () => {
        if (!newAsset.key || !newAsset.type) return

        try {
            await createAssetMutation.mutateAsync({
                projectId,
                data: {
                    key: newAsset.key,
                    type: newAsset.type,
                    description: newAsset.description,
                    base_path: newAsset.base_path || `assets/${newAsset.type}`,
                    versioning: 'folder',
                    current: {
                        version: 'v1',
                        files: [],
                    },
                    history: [],
                    status: 'needed',
                },
            })

            setNewAsset({ key: '', type: '', description: '', base_path: '' })
            setAddRowDialogOpen(false)
        } catch (error) {
            console.error('Failed to create asset:', error)
        }
    }

    const assetTypes: { value: AssetType; label: string }[] = [
        { value: 'sprite_static', label: 'Sprite Static' },
        { value: 'sprite_animation', label: 'Sprite Animation' },
        { value: 'texture', label: 'Texture' },
        { value: 'audio_music', label: 'Audio Music' },
        { value: 'audio_sfx', label: 'Audio SFX' },
        { value: 'model_3d', label: '3D Model' },
        { value: 'animation_3d', label: '3D Animation' },
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
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

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
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddRowDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddRow}
                            disabled={!newAsset.key || !newAsset.type || createAssetMutation.isPending}
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
                        <FileUpload
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
