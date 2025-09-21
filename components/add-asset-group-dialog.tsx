"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, FolderPlus } from "lucide-react"
import { useCreateAssetGroup } from "@/lib/hooks/use-asset-groups"
import { toast } from "sonner"
import type { AssetGroup } from "@/lib/types"
import { DialogScaffold } from "@/components/ui/dialog-scaffold"
import { ModalFooter } from "@/components/ui/modal-footer"

interface AddAssetGroupDialogProps {
    projectId: string
    onSuccess?: (group: AssetGroup) => void
}

export function AddAssetGroupDialog({ projectId, onSuccess }: AddAssetGroupDialogProps) {
    const [open, setOpen] = useState(false)
    const [formData, setFormData] = useState({
        key: '',
        title: '',
        description: '',
        base_path: '',
        tags: [] as string[],
    })
    const [newTag, setNewTag] = useState('')

    const createGroupMutation = useCreateAssetGroup()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.key || !formData.title) {
            toast.error("Key and title are required")
            return
        }

        try {
            const newGroup = await createGroupMutation.mutateAsync({
                projectId,
                data: {
                    key: formData.key,
                    title: formData.title,
                    description: formData.description || undefined,
                    base_path: formData.base_path || `Assets/${formData.title}`,
                    tags: formData.tags,
                },
            })

            toast.success("Asset group created successfully")
            setOpen(false)
            setFormData({ key: '', title: '', description: '', base_path: '', tags: [] })
            onSuccess?.(newGroup)
        } catch (error) {
            toast.error("Failed to create asset group")
            console.error("Failed to create asset group:", error)
        }
    }

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()],
            }))
            setNewTag('')
        }
    }

    const handleRemoveTag = (tagToRemove: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove),
        }))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            handleAddTag()
        }
    }

    const footer = (
        <ModalFooter
            onCancel={() => setOpen(false)}
            onSubmit={(e) => handleSubmit(e)}
            submitLabel="Create Group"
            isSubmitting={createGroupMutation.isPending}
            isDisabled={!formData.key || !formData.title}
        />
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <FolderPlus className="h-4 w-4 mr-2" />
                    Add Asset Group
                </Button>
            </DialogTrigger>
            <DialogScaffold
                title="Create Asset Group"
                description="Create a new asset group to organize related sub-assets"
                footer={footer}
                className="max-w-lg"
            >
                <form onSubmit={handleSubmit} className="space-y-5" id="asset-group-form">
                    <div className="space-y-2">
                        <Label htmlFor="group-key" className="text-base font-medium">Group Key *</Label>
                        <Input
                            id="group-key"
                            placeholder="e.g., hero_character"
                            value={formData.key}
                            onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Unique identifier for this group (lowercase, underscores)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group-title" className="text-base font-medium">Title *</Label>
                        <Input
                            id="group-title"
                            placeholder="e.g., Hero Character"
                            value={formData.title}
                            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Human-readable name for this group
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group-description" className="text-base font-medium">Description</Label>
                        <Textarea
                            id="group-description"
                            placeholder="Brief description of this asset group..."
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                            className="resize-none min-h-[96px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group-path" className="text-base font-medium">Base Path</Label>
                        <Input
                            id="group-path"
                            placeholder="e.g., Assets/Characters/Hero"
                            value={formData.base_path}
                            onChange={(e) => setFormData(prev => ({ ...prev, base_path: e.target.value }))}
                        />
                        <p className="text-sm text-muted-foreground">
                            File system path where assets will be stored
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="group-tags" className="text-base font-medium">Tags</Label>
                        <div className="space-y-2">
                            <div className="flex gap-2">
                                <Input
                                    id="group-tags"
                                    placeholder="Add a tag..."
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button type="button" variant="outline" onClick={handleAddTag}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>
                            {formData.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {formData.tags.map((tag) => (
                                        <Badge key={tag} variant="secondary" className="text-xs">
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveTag(tag)}
                                                className="ml-1 hover:text-destructive"
                                            >
                                                ×
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </form>
            </DialogScaffold>
        </Dialog>
    )
}
