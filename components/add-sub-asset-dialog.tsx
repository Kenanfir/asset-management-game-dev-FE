"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FilePlus, ChevronDown, ChevronRight, Info, Folder, Code } from "lucide-react"
import { useCreateSubAsset } from "@/lib/hooks/use-asset-groups"
import { useProjectSettings } from "@/lib/hooks/use-project-settings"
import { getExpectedFormats } from "@/lib/rule-packs"
import { resolvePathPreview } from "@/lib/utils"
import { toast } from "sonner"
import type { SubAsset, AssetType, AssetGroup } from "@/lib/types"
import { DialogScaffold } from "@/components/ui/dialog-scaffold"
import { ModalFooter } from "@/components/ui/modal-footer"

interface AddSubAssetDialogProps {
    projectId: string
    groupId: string
    group?: AssetGroup
    onSuccess?: (subAsset: SubAsset) => void
}

const assetTypes: { value: AssetType; label: string; description: string }[] = [
    { value: 'sprite_static', label: 'Sprite Static', description: 'Static 2D sprites for characters, objects, and UI elements' },
    { value: 'sprite_animation', label: 'Sprite Animation', description: 'Animated 2D sprites with frame sequences' },
    { value: 'texture', label: 'Texture', description: '2D textures for materials and surfaces' },
    { value: 'ui_element', label: 'UI Element', description: 'User interface components and HUD elements' },
    { value: 'audio_music', label: 'Audio Music', description: 'Background music and ambient audio' },
    { value: 'audio_sfx', label: 'Audio SFX', description: 'Sound effects for interactions and events' },
    { value: 'model_3d', label: '3D Model', description: '3D models for characters, objects, and environments' },
    { value: 'rig', label: 'Rig', description: 'Character rigs and bone structures' },
    { value: 'animation_3d', label: '3D Animation', description: '3D animations and motion data' },
    { value: 'material', label: 'Material', description: 'Material definitions and shader properties' },
    { value: 'shader', label: 'Shader', description: 'Custom shader programs' },
    { value: 'vfx', label: 'VFX', description: 'Visual effects and particle systems' },
    { value: 'doc', label: 'Documentation', description: 'Design documents and specifications' },
]

export function AddSubAssetDialog({ projectId, groupId, group, onSuccess }: AddSubAssetDialogProps) {
    const [open, setOpen] = useState(false)
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)
    const [isRulesOpen, setIsRulesOpen] = useState(false)
    const [errors, setErrors] = useState<Record<string, string>>({})

    const [formData, setFormData] = useState({
        key: '',
        type: '' as AssetType | '',
        required_format: '',
        description: '',
        versioning: 'folder' as 'folder' | 'filename',
        base_path: '',
        path_template: '',
        rules: {} as Record<string, unknown>,
    })

    const { data: projectSettings } = useProjectSettings(projectId)
    const createSubAssetMutation = useCreateSubAsset()

    // Reset form when dialog opens
    useEffect(() => {
        if (open) {
            setFormData({
                key: '',
                type: '',
                required_format: '',
                description: '',
                versioning: 'folder',
                base_path: '',
                path_template: '',
                rules: {},
            })
            setErrors({})
            setIsAdvancedOpen(false)
            setIsRulesOpen(false)
        }
    }, [open])

    // Update rules when asset type changes
    useEffect(() => {
        if (formData.type && projectSettings?.default_rule_pack_by_type) {
            const rulePack = projectSettings.default_rule_pack_by_type[formData.type]
            const defaultBasePath = projectSettings.default_base_paths?.[formData.type] || ''
            if (rulePack) {
                setFormData(prev => ({
                    ...prev,
                    rules: rulePack.rules,
                    required_format: rulePack.allowed_formats[0] || '',
                    base_path: prev.base_path || defaultBasePath,
                    path_template: prev.path_template || '{base}/{key}/v{version}/',
                }))
            }
        }
    }, [formData.type, projectSettings])

    const validateForm = () => {
        const newErrors: Record<string, string> = {}

        if (!formData.key.trim()) {
            newErrors.key = 'Sub-asset key is required'
        } else if (!/^[a-z0-9_]+$/.test(formData.key)) {
            newErrors.key = 'Key must contain only lowercase letters, numbers, and underscores'
        }

        if (!formData.type) {
            newErrors.type = 'Asset type is required'
        }

        if (!formData.required_format) {
            newErrors.required_format = 'Required format is required'
        }

        if (!formData.base_path.trim()) {
            newErrors.base_path = 'Base path is required'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) {
            // Focus first error field
            const firstErrorField = document.querySelector('[aria-invalid="true"]') as HTMLElement
            if (firstErrorField) {
                firstErrorField.focus()
            }
            return
        }

        try {
            const newSubAsset = await createSubAssetMutation.mutateAsync({
                projectId,
                groupId,
                data: {
                    key: formData.key,
                    type: formData.type as AssetType,
                    required_format: formData.required_format,
                    description: formData.description || undefined,
                    versioning: formData.versioning,
                    base_path: formData.base_path,
                    path_template: formData.path_template || undefined,
                    rules: formData.rules,
                    current: {
                        version: 1,
                        files: [],
                    },
                    history: [],
                    status: 'needed',
                },
            })

            toast.success("Sub-asset created successfully")
            setOpen(false)
            onSuccess?.(newSubAsset)
        } catch (error) {
            toast.error("Failed to create sub-asset")
            console.error("Failed to create sub-asset:", error)
        }
    }

    const availableFormats = formData.type ? getExpectedFormats(formData.type) : []
    const selectedAssetType = assetTypes.find(t => t.value === formData.type)

    const pathPreview = resolvePathPreview({
        base: formData.base_path,
        key: formData.key,
        version: '1',
        ext: formData.required_format,
        template: formData.path_template
    })

    const isFormValid = formData.key && formData.type && formData.required_format && formData.base_path && Object.keys(errors).length === 0

    const footer = (
        <ModalFooter
            onCancel={() => setOpen(false)}
            onSubmit={(e) => handleSubmit(e)}
            submitLabel="Create Sub-Asset"
            isSubmitting={createSubAssetMutation.isPending}
            isDisabled={!isFormValid}
        />
    )

    return (
        <TooltipProvider>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                        <FilePlus className="h-4 w-4 mr-2" />
                        Add Sub-Asset
                    </Button>
                </DialogTrigger>
                <DialogScaffold
                    title={`Add Sub-Asset to ${group?.title || 'Group'}`}
                    description="Create a new sub-asset within this asset group"
                    footer={footer}
                    className="max-w-screen-md"
                >
                    <form onSubmit={handleSubmit} className="space-y-5" id="sub-asset-form">
                        {/* Basics Section */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-medium">Basics</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Essential information for the sub-asset</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="sub-asset-key" className="text-base font-medium">
                                            Sub-Asset Key *
                                        </Label>
                                        <Input
                                            id="sub-asset-key"
                                            placeholder="e.g., hero_idle, hero_run"
                                            value={formData.key}
                                            onChange={(e) => {
                                                setFormData(prev => ({ ...prev, key: e.target.value }))
                                                if (errors.key) {
                                                    setErrors(prev => ({ ...prev, key: '' }))
                                                }
                                            }}
                                            aria-invalid={!!errors.key}
                                            aria-describedby={errors.key ? "key-error" : "key-help"}
                                            className={errors.key ? "border-destructive" : ""}
                                        />
                                        {errors.key ? (
                                            <p id="key-error" className="text-sm text-destructive">
                                                {errors.key}
                                            </p>
                                        ) : (
                                            <p id="key-help" className="text-sm text-muted-foreground">
                                                Unique identifier for this sub-asset (lowercase, underscores)
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="sub-asset-type" className="text-base font-medium">
                                            Asset Type *
                                        </Label>
                                        <Select
                                            value={formData.type}
                                            onValueChange={(value) => {
                                                setFormData(prev => ({ ...prev, type: value as AssetType }))
                                                if (errors.type) {
                                                    setErrors(prev => ({ ...prev, type: '' }))
                                                }
                                            }}
                                        >
                                            <SelectTrigger aria-invalid={!!errors.type} className={errors.type ? "border-destructive" : ""}>
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
                                                            <span className="text-sm text-muted-foreground mt-1">{type.description}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.type && (
                                            <p className="text-sm text-destructive">{errors.type}</p>
                                        )}
                                    </div>
                                </div>

                                {formData.type && (
                                    <div className="space-y-2">
                                        <Label htmlFor="sub-asset-format" className="text-base font-medium">
                                            Required Format *
                                        </Label>
                                        <Select
                                            value={formData.required_format}
                                            onValueChange={(value) => {
                                                setFormData(prev => ({ ...prev, required_format: value }))
                                                if (errors.required_format) {
                                                    setErrors(prev => ({ ...prev, required_format: '' }))
                                                }
                                            }}
                                        >
                                            <SelectTrigger aria-invalid={!!errors.required_format} className={errors.required_format ? "border-destructive" : ""}>
                                                <SelectValue placeholder="Select file format" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableFormats.map((format) => (
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
                                        {errors.required_format ? (
                                            <p className="text-sm text-destructive">{errors.required_format}</p>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Choose the specific file format for this sub-asset
                                            </p>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Destination Section */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-medium flex items-center gap-2">
                                    <Folder className="h-5 w-5" />
                                    Destination
                                </CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Where files will be stored and organized</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sub-asset-base-path" className="text-base font-medium">
                                        Base Path *
                                    </Label>
                                    <Input
                                        id="sub-asset-base-path"
                                        value={formData.base_path}
                                        onChange={(e) => {
                                            setFormData(prev => ({ ...prev, base_path: e.target.value }))
                                            if (errors.base_path) {
                                                setErrors(prev => ({ ...prev, base_path: '' }))
                                            }
                                        }}
                                        placeholder="e.g., Assets/Art/Hero"
                                        className="font-mono text-sm"
                                        aria-invalid={!!errors.base_path}
                                        aria-describedby={errors.base_path ? "base-path-error" : "base-path-help"}
                                    />
                                    {errors.base_path ? (
                                        <p id="base-path-error" className="text-sm text-destructive">
                                            {errors.base_path}
                                        </p>
                                    ) : (
                                        <p id="base-path-help" className="text-sm text-muted-foreground">
                                            Root folder where files will be stored
                                        </p>
                                    )}
                                </div>

                                <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
                                    <CollapsibleTrigger asChild>
                                        <Button variant="ghost" className="p-0 h-auto font-medium text-sm">
                                            {isAdvancedOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                                            Advanced Path Options
                                        </Button>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="sub-asset-path-template" className="text-base font-medium flex items-center gap-2">
                                                Path Template
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Info className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Use placeholders: {'{base}'}, {'{key}'}, {'{version}'}, {'{ext}'}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </Label>
                                            <Input
                                                id="sub-asset-path-template"
                                                value={formData.path_template}
                                                onChange={(e) => setFormData(prev => ({ ...prev, path_template: e.target.value }))}
                                                placeholder="e.g., {base}/{key}/v{version}/"
                                                className="font-mono text-sm"
                                            />
                                            <p className="text-sm text-muted-foreground">
                                                Use {'{base}'}, {'{key}'}, {'{version}'}, {'{ext}'} as placeholders
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-base font-medium flex items-center gap-2">
                                                Live Preview
                                                <Code className="h-4 w-4 text-muted-foreground" />
                                            </Label>
                                            <div className="p-3 bg-muted/50 rounded-lg border">
                                                <div className="font-mono text-sm text-muted-foreground break-all">
                                                    {pathPreview}
                                                </div>
                                            </div>
                                        </div>
                                    </CollapsibleContent>
                                </Collapsible>
                            </CardContent>
                        </Card>

                        {/* Versioning Section */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-medium">Versioning</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">How versions will be organized for this sub-asset</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={formData.versioning}
                                    onValueChange={(value) => setFormData(prev => ({ ...prev, versioning: value as 'folder' | 'filename' }))}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="folder" id="versioning-folder" />
                                        <Label htmlFor="versioning-folder" className="flex-1">
                                            <div className="font-medium">Folder-based</div>
                                            <div className="text-sm text-muted-foreground">v1/, v2/, etc.</div>
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="filename" id="versioning-filename" />
                                        <Label htmlFor="versioning-filename" className="flex-1">
                                            <div className="font-medium">Filename-based</div>
                                            <div className="text-sm text-muted-foreground">file_v1.png, file_v2.png</div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* Description Section */}
                        <Card>
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-medium">Description</CardTitle>
                                <CardDescription className="text-sm text-muted-foreground">Optional details about this sub-asset</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    id="sub-asset-description"
                                    placeholder="Brief description of this sub-asset..."
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    rows={3}
                                    className="resize-none"
                                />
                            </CardContent>
                        </Card>

                        {/* Validation Rules Section */}
                        {formData.type && Object.keys(formData.rules).length > 0 && (
                            <Card>
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-base font-medium flex items-center gap-2">
                                        Validation Rules
                                        <Badge variant="secondary" className="text-xs">
                                            {selectedAssetType?.label}
                                        </Badge>
                                    </CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground">
                                        Rules pre-populated from project settings
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Collapsible open={isRulesOpen} onOpenChange={setIsRulesOpen}>
                                        <CollapsibleTrigger asChild>
                                            <Button variant="ghost" className="p-0 h-auto font-medium text-sm">
                                                {isRulesOpen ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                                                Advanced Rules Configuration
                                            </Button>
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="space-y-4 mt-4">
                                            <div className="space-y-4 p-4 border border-border/50 rounded-lg bg-muted/20">
                                                {Object.entries(formData.rules).map(([key, value]) => (
                                                    <div key={key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <Label htmlFor={`rule-${key}`} className="text-base font-medium capitalize">
                                                                {key.replace(/_/g, ' ')}
                                                            </Label>
                                                            <p className="text-sm text-muted-foreground">
                                                                {getRuleDescription(key, formData.type as AssetType)}
                                                            </p>
                                                        </div>
                                                        <Input
                                                            id={`rule-${key}`}
                                                            type={typeof value === 'number' ? 'number' : 'text'}
                                                            value={String(value)}
                                                            onChange={(e) => {
                                                                const newValue = typeof value === 'number'
                                                                    ? Number(e.target.value)
                                                                    : e.target.value
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    rules: {
                                                                        ...prev.rules,
                                                                        [key]: newValue
                                                                    }
                                                                }))
                                                            }}
                                                            className="font-mono text-sm"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                            <p className="text-sm text-muted-foreground">
                                                These rules will be applied when validating uploads for this sub-asset
                                            </p>
                                        </CollapsibleContent>
                                    </Collapsible>
                                </CardContent>
                            </Card>
                        )}
                    </form>
                </DialogScaffold>
            </Dialog>
        </TooltipProvider>
    )
}

// Helper function to get rule descriptions
function getRuleDescription(ruleKey: string, assetType: AssetType): string {
    const descriptions: Record<string, Record<string, string>> = {
        sprite_animation: {
            fps_min: 'Minimum frames per second',
            fps_max: 'Maximum frames per second',
            sequence_pattern_required: 'Whether sequence pattern is required',
            max_frames: 'Maximum number of frames'
        },
        audio_music: {
            sample_rate: 'Sample rate in Hz',
            channels: 'Number of audio channels',
            bit_depth: 'Bit depth options'
        },
        audio_sfx: {
            sample_rate: 'Sample rate in Hz',
            channels: 'Number of audio channels',
            max_duration_seconds: 'Maximum duration in seconds'
        },
        model_3d: {
            max_polycount: 'Maximum polygon count',
            max_materials: 'Maximum number of materials',
            max_textures: 'Maximum number of textures'
        },
        texture: {
            power_of_two: 'Must be power of two dimensions',
            max_size: 'Maximum texture size',
            min_size: 'Minimum texture size'
        },
        animation_3d: {
            max_duration_seconds: 'Maximum duration in seconds',
            fps: 'Frame rate options'
        }
    }

    return descriptions[assetType]?.[ruleKey] || 'Validation rule'
}
