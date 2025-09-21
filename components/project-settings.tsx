"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Edit2, Trash2, Save, X, Settings, FileText, Hash } from "lucide-react"
import { useProjectSettings } from "@/lib/hooks/use-project-settings"
import { toast } from "sonner"
import type { ProjectSettings, AssetType, NamingRule } from "@/lib/types"

interface ProjectSettingsProps {
    projectId: string
}

export function ProjectSettings({ projectId }: ProjectSettingsProps) {
    const { data: settings, isLoading, updateSettings } = useProjectSettings(projectId)
    const [isEditing, setIsEditing] = useState(false)
    const [editedSettings, setEditedSettings] = useState<ProjectSettings | null>(null)
    const [namingRuleDialogOpen, setNamingRuleDialogOpen] = useState(false)
    const [editingRule, setEditingRule] = useState<NamingRule | null>(null)
    const [newRule, setNewRule] = useState<Omit<NamingRule, 'id'>>({
        pattern: '',
        description: '',
        example: '',
    })
    const [editingBasePaths, setEditingBasePaths] = useState(false)
    const [editedBasePaths, setEditedBasePaths] = useState<Partial<Record<AssetType, string>>>({})

    useEffect(() => {
        if (settings) {
            setEditedSettings(settings)
            setEditedBasePaths(settings.default_base_paths || {})
        }
    }, [settings])

    const handleSave = async () => {
        if (!editedSettings) return

        try {
            await updateSettings.mutateAsync(editedSettings)
            setIsEditing(false)
            toast.success("Settings saved successfully")
        } catch (error) {
            toast.error("Failed to save settings")
            console.error("Failed to save settings:", error)
        }
    }

    const handleCancel = () => {
        setEditedSettings(settings || null)
        setIsEditing(false)
    }

    const handleSaveBasePaths = async () => {
        if (!editedSettings) return

        try {
            await updateSettings.mutateAsync({
                ...editedSettings,
                default_base_paths: editedBasePaths
            })
            toast.success("Default base paths updated successfully")
            setEditingBasePaths(false)
        } catch (error) {
            toast.error("Failed to update default base paths")
            console.error("Failed to update base paths:", error)
        }
    }

    const handleCancelBasePaths = () => {
        setEditedBasePaths(settings?.default_base_paths || {})
        setEditingBasePaths(false)
    }

    const handleBasePathChange = (assetType: AssetType, value: string) => {
        setEditedBasePaths(prev => ({
            ...prev,
            [assetType]: value
        }))
    }

    const handleAddNamingRule = async () => {
        if (!editedSettings || !newRule.pattern) return

        const rule: NamingRule = {
            id: `rule_${Date.now()}`,
            ...newRule,
        }

        setEditedSettings({
            ...editedSettings,
            naming_conventions: [...editedSettings.naming_conventions, rule],
        })

        setNewRule({ pattern: '', description: '', example: '' })
        setNamingRuleDialogOpen(false)
    }

    const handleEditNamingRule = (rule: NamingRule) => {
        setEditingRule(rule)
        setNewRule({
            pattern: rule.pattern,
            description: rule.description || '',
            example: rule.example || '',
        })
        setNamingRuleDialogOpen(true)
    }

    const handleUpdateNamingRule = async () => {
        if (!editedSettings || !editingRule || !newRule.pattern) return

        setEditedSettings({
            ...editedSettings,
            naming_conventions: editedSettings.naming_conventions.map(rule =>
                rule.id === editingRule.id ? { ...rule, ...newRule } : rule
            ),
        })

        setEditingRule(null)
        setNewRule({ pattern: '', description: '', example: '' })
        setNamingRuleDialogOpen(false)
    }

    const handleDeleteNamingRule = (ruleId: string) => {
        if (!editedSettings) return

        setEditedSettings({
            ...editedSettings,
            naming_conventions: editedSettings.naming_conventions.filter(rule => rule.id !== ruleId),
        })
    }

    const handleRulePackChange = (assetType: AssetType, field: 'allowed_formats' | 'rules', value: any) => {
        if (!editedSettings) return

        setEditedSettings({
            ...editedSettings,
            default_rule_pack_by_type: {
                ...editedSettings.default_rule_pack_by_type,
                [assetType]: {
                    ...editedSettings.default_rule_pack_by_type[assetType],
                    [field]: value,
                },
            },
        })
    }

    const assetTypes: AssetType[] = [
        "sprite_static",
        "sprite_animation",
        "texture",
        "ui_element",
        "audio_music",
        "audio_sfx",
        "model_3d",
        "rig",
        "animation_3d",
        "material",
        "shader",
        "vfx",
        "doc"
    ]

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading settings...</p>
                </div>
            </div>
        )
    }

    if (!settings || !editedSettings) {
        return (
            <div className="text-center py-8">
                <p className="text-muted-foreground">Failed to load settings</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Settings className="h-6 w-6" />
                        Project Settings
                    </h2>
                    <p className="text-muted-foreground">Configure default rules and naming conventions</p>
                </div>
                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <Button variant="outline" onClick={handleCancel}>
                                <X className="h-4 w-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={updateSettings.isPending}>
                                <Save className="h-4 w-4 mr-2" />
                                {updateSettings.isPending ? "Saving..." : "Save Changes"}
                            </Button>
                        </>
                    ) : (
                        <Button onClick={() => setIsEditing(true)}>
                            <Edit2 className="h-4 w-4 mr-2" />
                            Edit Settings
                        </Button>
                    )}
                </div>
            </div>

            <Tabs defaultValue="rule-packs" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="rule-packs">Rule Packs</TabsTrigger>
                    <TabsTrigger value="naming-conventions">Naming Conventions</TabsTrigger>
                    <TabsTrigger value="base-paths">Base Paths</TabsTrigger>
                    <TabsTrigger value="general">General</TabsTrigger>
                </TabsList>

                <TabsContent value="rule-packs" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <FileText className="h-5 w-5" />
                                Default Rule Packs
                            </CardTitle>
                            <CardDescription>
                                Configure default validation rules and allowed formats for each asset type
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {assetTypes.map((assetType) => {
                                const rulePack = editedSettings.default_rule_pack_by_type[assetType]
                                if (!rulePack) return null

                                return (
                                    <div key={assetType} className="border rounded-lg p-4 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-semibold capitalize">
                                                {assetType.replace(/_/g, ' ')}
                                            </h3>
                                            <Badge variant="outline">
                                                {rulePack.allowed_formats.length} formats
                                            </Badge>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <Label className="text-sm font-medium">Allowed Formats</Label>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {rulePack.allowed_formats.map((format) => (
                                                        <Badge key={format} variant="secondary">
                                                            .{format}
                                                        </Badge>
                                                    ))}
                                                </div>
                                                {isEditing && (
                                                    <div className="mt-2">
                                                        <Input
                                                            placeholder="Add format (e.g., png, jpg)"
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    const input = e.target as HTMLInputElement
                                                                    const format = input.value.trim().toLowerCase()
                                                                    if (format && !rulePack.allowed_formats.includes(format)) {
                                                                        handleRulePackChange(assetType, 'allowed_formats', [
                                                                            ...rulePack.allowed_formats,
                                                                            format,
                                                                        ])
                                                                        input.value = ''
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            <div>
                                                <Label className="text-sm font-medium">Rules</Label>
                                                <div className="space-y-2 mt-2">
                                                    {Object.entries(rulePack.rules).map(([key, value]) => (
                                                        <div key={key} className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground capitalize">
                                                                {key.replace(/_/g, ' ')}:
                                                            </span>
                                                            {isEditing ? (
                                                                <Input
                                                                    type={typeof value === 'number' ? 'number' : 'text'}
                                                                    value={String(value)}
                                                                    onChange={(e) => {
                                                                        const newValue = typeof value === 'number'
                                                                            ? Number(e.target.value)
                                                                            : e.target.value
                                                                        handleRulePackChange(assetType, 'rules', {
                                                                            ...rulePack.rules,
                                                                            [key]: newValue,
                                                                        })
                                                                    }}
                                                                    className="w-24 h-8"
                                                                />
                                                            ) : (
                                                                <span className="font-mono">{String(value)}</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="naming-conventions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Hash className="h-5 w-5" />
                                        Naming Conventions
                                    </CardTitle>
                                    <CardDescription>
                                        Define reusable naming patterns for different asset types
                                    </CardDescription>
                                </div>
                                {isEditing && (
                                    <Dialog open={namingRuleDialogOpen} onOpenChange={setNamingRuleDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button size="sm">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Add Convention
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>
                                                    {editingRule ? 'Edit Naming Convention' : 'Add Naming Convention'}
                                                </DialogTitle>
                                                <DialogDescription>
                                                    Define a pattern for naming assets consistently
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4">
                                                <div>
                                                    <Label htmlFor="pattern">Pattern</Label>
                                                    <Input
                                                        id="pattern"
                                                        placeholder="e.g., frame_{index:000}.png"
                                                        value={newRule.pattern}
                                                        onChange={(e) => setNewRule(prev => ({ ...prev, pattern: e.target.value }))}
                                                    />
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        Use {'{index:000}'} for zero-padded numbers, {'{name}'} for asset name, {'{version}'} for version
                                                    </p>
                                                </div>
                                                <div>
                                                    <Label htmlFor="description">Description</Label>
                                                    <Input
                                                        id="description"
                                                        placeholder="Brief description of this pattern"
                                                        value={newRule.description}
                                                        onChange={(e) => setNewRule(prev => ({ ...prev, description: e.target.value }))}
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="example">Example</Label>
                                                    <Input
                                                        id="example"
                                                        placeholder="e.g., frame_000.png"
                                                        value={newRule.example}
                                                        onChange={(e) => setNewRule(prev => ({ ...prev, example: e.target.value }))}
                                                    />
                                                </div>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setNamingRuleDialogOpen(false)}>
                                                    Cancel
                                                </Button>
                                                <Button
                                                    onClick={editingRule ? handleUpdateNamingRule : handleAddNamingRule}
                                                    disabled={!newRule.pattern}
                                                >
                                                    {editingRule ? 'Update' : 'Add'} Convention
                                                </Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pattern</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Example</TableHead>
                                        {isEditing && <TableHead className="w-20">Actions</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {editedSettings.naming_conventions.map((rule) => (
                                        <TableRow key={rule.id}>
                                            <TableCell className="font-mono text-sm">{rule.pattern}</TableCell>
                                            <TableCell>{rule.description}</TableCell>
                                            <TableCell className="font-mono text-sm text-muted-foreground">
                                                {rule.example}
                                            </TableCell>
                                            {isEditing && (
                                                <TableCell>
                                                    <div className="flex gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEditNamingRule(rule)}
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleDeleteNamingRule(rule.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="base-paths" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Hash className="h-5 w-5" />
                                        Default Base Paths
                                    </CardTitle>
                                    <CardDescription>
                                        Set default base paths for each asset type. These will be used when creating new sub-assets.
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    {editingBasePaths ? (
                                        <>
                                            <Button variant="outline" onClick={handleCancelBasePaths}>
                                                <X className="h-4 w-4 mr-2" />
                                                Cancel
                                            </Button>
                                            <Button onClick={handleSaveBasePaths} disabled={updateSettings.isPending}>
                                                <Save className="h-4 w-4 mr-2" />
                                                {updateSettings.isPending ? "Saving..." : "Save Paths"}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button onClick={() => setEditingBasePaths(true)}>
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit Paths
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(editedBasePaths).map(([assetType, basePath]) => (
                                    <div key={assetType} className="flex items-center gap-4">
                                        <div className="w-32">
                                            <Label className="text-sm font-medium capitalize">
                                                {assetType.replace('_', ' ')}
                                            </Label>
                                        </div>
                                        <div className="flex-1">
                                            {editingBasePaths ? (
                                                <Input
                                                    value={basePath || ''}
                                                    onChange={(e) => handleBasePathChange(assetType as AssetType, e.target.value)}
                                                    placeholder="e.g., Assets/Art"
                                                    className="font-mono text-sm"
                                                />
                                            ) : (
                                                <div className="font-mono text-sm bg-muted/50 p-2 rounded">
                                                    {basePath || 'Not set'}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {editingBasePaths && (
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <div className="text-sm font-medium mb-2">Preview for new sub-assets:</div>
                                        <div className="text-xs text-muted-foreground space-y-1">
                                            <div>Destination will be: {'{base_path}'}/{'{group_key}'}/{'{sub_asset_key}'}/vN</div>
                                            <div>Example: Assets/Art/hero_character/hero_idle/v1/</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>General Settings</CardTitle>
                            <CardDescription>
                                Configure general project behavior and policies
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="allow-lossy-autofix" className="text-base font-medium">
                                        Allow Lossy Auto-fixes
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Allow the system to apply potentially lossy conversions to fix asset issues
                                    </p>
                                </div>
                                <Switch
                                    id="allow-lossy-autofix"
                                    checked={editedSettings.allow_lossy_autofix}
                                    onCheckedChange={(checked) => {
                                        if (isEditing) {
                                            setEditedSettings(prev => prev ? { ...prev, allow_lossy_autofix: checked } : null)
                                        }
                                    }}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="auto-assign" className="text-base font-medium">
                                        Auto-assign Assets
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Automatically assign new assets to team members
                                    </p>
                                </div>
                                <Switch
                                    id="auto-assign"
                                    checked={editedSettings.auto_assign || false}
                                    onCheckedChange={(checked) => {
                                        if (isEditing) {
                                            setEditedSettings(prev => prev ? { ...prev, auto_assign: checked } : null)
                                        }
                                    }}
                                    disabled={!isEditing}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label htmlFor="validation-strict" className="text-base font-medium">
                                        Strict Validation
                                    </Label>
                                    <p className="text-sm text-muted-foreground">
                                        Enforce strict validation rules for all asset uploads
                                    </p>
                                </div>
                                <Switch
                                    id="validation-strict"
                                    checked={editedSettings.validation_strict || false}
                                    onCheckedChange={(checked) => {
                                        if (isEditing) {
                                            setEditedSettings(prev => prev ? { ...prev, validation_strict: checked } : null)
                                        }
                                    }}
                                    disabled={!isEditing}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
