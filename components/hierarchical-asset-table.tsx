"use client"

import React, { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { EnumBadge } from "@/components/ui/enum-badge"
import { StatusChip } from "@/components/ui/status-chip"
import { Search, Filter, X, ChevronDown, ChevronRight, Eye, AlertTriangle, Upload, MoreHorizontal } from "lucide-react"
import { useAssetGroups } from "@/lib/hooks/use-asset-groups"
import { useUIStore } from "@/lib/store"
import { getUserById } from "@/lib/mock/users"
import { useUrlParams } from "@/lib/hooks/use-url-params"
import { toast } from "sonner"
import type { AssetGroup, SubAsset, Status } from "@/lib/types"
import { AddAssetGroupDialog } from "./add-asset-group-dialog"
import { AddSubAssetDialog } from "./add-sub-asset-dialog"
import { BulkOperations } from "./bulk-operations"
import { BulkActions } from "./bulk-actions"
import { InlineEdit, InlineStatusEdit } from "./inline-edit"
import { InlineAssigneeEdit } from "./inline-assignee-edit"
import { TableSkeleton } from "./ui/skeleton"
import { SubAssetDrawer } from "./sub-asset-drawer"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface HierarchicalAssetTableProps {
    projectId: string
}

export function HierarchicalAssetTable({ projectId }: HierarchicalAssetTableProps) {
    const {
        selectedAssets,
        allSelected,
        searchQuery,
        statusFilter,
        typeFilter,
        drawerOpen,
        selectedAsset,
        setSearchQuery,
        setStatusFilter,
        setTypeFilter,
        setDrawerOpen,
        setSelectedAsset,
        toggleAssetSelection,
        selectAllAssets,
        clearSelection,
    } = useUIStore()

    const { getParam, getArrayParam, updateParams } = useUrlParams()
    const { data: assetGroups = [], isLoading: loading, error } = useAssetGroups(projectId)

    // Sync URL params with store on mount
    const urlSearch = getParam("q", "")
    const urlStatus = getArrayParam("status", [])
    const urlType = getArrayParam("type", [])

    // Filter and search logic - show only groups with matching sub-assets
    const filteredGroups = assetGroups.map(group => {
        // Filter sub-assets within each group
        const filteredChildren = group.children.filter(subAsset => {
            // Search in sub-asset keys and descriptions
            if (urlSearch || searchQuery) {
                const searchLower = (urlSearch || searchQuery).toLowerCase()
                const subAssetMatches = subAsset.key.toLowerCase().includes(searchLower) ||
                    subAsset.description?.toLowerCase().includes(searchLower)
                if (!subAssetMatches) return false
            }

            // Filter by status
            if (urlStatus.length > 0 || statusFilter.length > 0) {
                const statuses = urlStatus.length > 0 ? urlStatus : statusFilter
                if (!statuses.includes(subAsset.status)) return false
            }

            // Filter by type
            if (urlType.length > 0 || typeFilter.length > 0) {
                const types = urlType.length > 0 ? urlType : typeFilter
                if (!types.includes(subAsset.type)) return false
            }

            return true
        })

        // Only include groups that have matching sub-assets
        if (filteredChildren.length === 0) return null

        return {
            ...group,
            children: filteredChildren,
            isFiltered: filteredChildren.length < group.children.length
        }
    }).filter(Boolean) as Array<AssetGroup & { isFiltered: boolean }>

    const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
    const [selectedSubAssets, setSelectedSubAssets] = useState<Set<string>>(new Set())

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

    const handleSubAssetClick = (subAsset: SubAsset) => {
        setSelectedAsset(subAsset.id)
        setDrawerOpen(true)
    }

    const handleSubAssetUpdate = async (subAssetId: string, updates: Partial<SubAsset>) => {
        // In a real app, this would call an API to update the sub-asset
        console.log('Updating sub-asset:', subAssetId, updates)
        toast.success('Sub-asset updated successfully')
    }

    const handleBulkAction = async (action: string, subAssetIds: string[]) => {
        // In a real app, this would call an API for bulk operations
        console.log('Bulk action:', action, subAssetIds)
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000))
    }

    const handleSearchChange = (value: string) => {
        setSearchQuery(value)
        updateParams({ q: value || null })
    }

    const handleStatusFilterChange = (value: string) => {
        const newStatus = value === "all" ? [] : [value]
        setStatusFilter(newStatus)
        updateParams({ status: newStatus })
    }

    const handleTypeFilterChange = (value: string) => {
        const newType = value === "all" ? [] : [value]
        setTypeFilter(newType)
        updateParams({ type: newType })
    }

    const handleSelectAll = () => {
        const allSubAssetIds = filteredGroups.flatMap(group => group.children.map(child => child.id))
        selectAllAssets(allSubAssetIds)
    }

    const handleClearFilters = () => {
        setSearchQuery('')
        setStatusFilter([])
        setTypeFilter([])
        updateParams({ q: null, status: null, type: null })
    }

    const formatVersion = (version: number) => {
        return `v${version}`
    }

    const getAssigneeName = (userId?: string) => {
        if (!userId) return "Unassigned"
        const user = getUserById(userId)
        return user ? user.name : `User ${userId}`
    }

    const getSubAssetById = (subAssetId: string): SubAsset | null => {
        for (const group of assetGroups) {
            const subAsset = group.children.find(child => child.id === subAssetId)
            if (subAsset) return subAsset
        }
        return null
    }

    const selectedSubAsset = selectedAsset ? getSubAssetById(selectedAsset) : null

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[240px] max-w-[400px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search asset groups and sub-assets..."
                        value={urlSearch || searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <Select
                    value={urlStatus[0] || statusFilter[0] || "all"}
                    onValueChange={handleStatusFilterChange}
                >
                    <SelectTrigger className="h-9 w-[180px] sm:w-[160px]" aria-label="Filter by status">
                        <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                        <SelectValue placeholder="All Status" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="needed">Needed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                        <SelectItem value="needs_update">Needs Update</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={urlType[0] || typeFilter[0] || "all"}
                    onValueChange={handleTypeFilterChange}
                >
                    <SelectTrigger className="h-9 w-[200px] sm:w-[180px]" aria-label="Filter by type">
                        <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                        <SelectValue placeholder="All Types" className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="sprite_static">Sprite Static</SelectItem>
                        <SelectItem value="sprite_animation">Sprite Animation</SelectItem>
                        <SelectItem value="texture">Texture</SelectItem>
                        <SelectItem value="ui_element">UI Element</SelectItem>
                        <SelectItem value="audio_music">Audio Music</SelectItem>
                        <SelectItem value="audio_sfx">Audio SFX</SelectItem>
                        <SelectItem value="model_3d">3D Model</SelectItem>
                        <SelectItem value="rig">Rig</SelectItem>
                        <SelectItem value="animation_3d">3D Animation</SelectItem>
                        <SelectItem value="material">Material</SelectItem>
                        <SelectItem value="shader">Shader</SelectItem>
                        <SelectItem value="vfx">VFX</SelectItem>
                        <SelectItem value="doc">Documentation</SelectItem>
                    </SelectContent>
                </Select>

                {(urlSearch || urlStatus.length > 0 || urlType.length > 0 || searchQuery || statusFilter.length > 0 || typeFilter.length > 0) && (
                    <Button variant="outline" size="sm" onClick={handleClearFilters}>
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}

                <AddAssetGroupDialog projectId={projectId} />
            </div>

            {/* Bulk Actions */}
            {selectedAssets.length > 0 && (
                <BulkActions
                    projectId={projectId}
                    selectedCount={selectedAssets.length}
                    onBulkAction={handleBulkAction}
                />
            )}

            {/* Table */}
            <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="border-border/50">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={allSelected || (filteredGroups.length > 0 && selectedAssets.length === filteredGroups.flatMap(g => g.children).length)}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all sub-assets"
                                />
                            </TableHead>
                            <TableHead>Asset Group / Sub-Asset</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Format</TableHead>
                            <TableHead>Version</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assignee</TableHead>
                            <TableHead>Updated</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={9} className="p-6">
                                    <TableSkeleton />
                                </TableCell>
                            </TableRow>
                        ) : filteredGroups.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="text-center py-12">
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                            <Search className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold mb-2">No matching sub-assets found</h3>
                                            <p className="text-muted-foreground mb-4">
                                                {urlSearch || searchQuery || urlStatus.length > 0 || urlType.length > 0
                                                    ? "Try adjusting your filters or search terms"
                                                    : "Get started by creating your first asset group"
                                                }
                                            </p>
                                            {(urlSearch || searchQuery || urlStatus.length > 0 || urlType.length > 0) && (
                                                <Button variant="outline" onClick={handleClearFilters}>
                                                    <X className="h-4 w-4 mr-2" />
                                                    Clear Filters
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredGroups.map((group) => (
                                <React.Fragment key={group.id}>
                                    {/* Asset Group Row */}
                                    <TableRow className="border-border/50 bg-muted/20">
                                        <TableCell>
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
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <span>{group.title}</span>
                                                <Badge variant="outline" className="text-xs">
                                                    {group.children.length} sub-asset{group.children.length !== 1 ? 's' : ''}
                                                </Badge>
                                                {group.isFiltered && (
                                                    <Badge variant="secondary" className="text-xs">
                                                        (filtered)
                                                    </Badge>
                                                )}
                                            </div>
                                            {group.description && (
                                                <p className="text-sm text-muted-foreground mt-1">{group.description}</p>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">Group</Badge>
                                        </TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>-</TableCell>
                                        <TableCell>
                                            <div className="flex gap-1">
                                                <AddSubAssetDialog projectId={projectId} groupId={group.id} group={group} />
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent>
                                                        <DropdownMenuItem>Edit Group</DropdownMenuItem>
                                                        <DropdownMenuItem>Delete Group</DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>

                                    {/* Sub-Asset Rows */}
                                    {expandedGroups.has(group.id) && group.children.map((subAsset) => (
                                        <TableRow
                                            key={subAsset.id}
                                            className={`border-border/50 hover:bg-muted/50 transition-colors ${selectedAssets.includes(subAsset.id) ? 'bg-primary/5' : ''
                                                }`}
                                        >
                                            <TableCell>
                                                <Checkbox
                                                    checked={selectedAssets.includes(subAsset.id)}
                                                    onCheckedChange={() => toggleAssetSelection(subAsset.id)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    aria-label={`Select ${subAsset.key}`}
                                                />
                                            </TableCell>
                                            <TableCell
                                                className="font-medium cursor-pointer pl-8"
                                                onClick={() => handleSubAssetClick(subAsset)}
                                            >
                                                <InlineEdit
                                                    value={subAsset.key}
                                                    type="text"
                                                    onSave={(value) => handleSubAssetUpdate(subAsset.id, { key: value })}
                                                    placeholder="Sub-asset key"
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <EnumBadge type={subAsset.type} />
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-xs">
                                                    .{subAsset.required_format}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{formatVersion(subAsset.current.version)}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <InlineStatusEdit
                                                    status={subAsset.status}
                                                    onSave={(status) => handleSubAssetUpdate(subAsset.id, { status })}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <InlineAssigneeEdit
                                                    assigneeId={subAsset.assignee_user_id}
                                                    onSave={(assigneeId) => handleSubAssetUpdate(subAsset.id, { assignee_user_id: assigneeId || undefined })}
                                                />
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-sm">2 hours ago</TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleSubAssetClick(subAsset)
                                                        }}
                                                        aria-label={`View details for ${subAsset.key}`}
                                                    >
                                                        <Eye className="h-3 w-3" />
                                                    </Button>
                                                    {subAsset.status === "needs_update" && (
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={(e) => e.stopPropagation()}
                                                            aria-label={`${subAsset.key} needs update`}
                                                        >
                                                            <AlertTriangle className="h-3 w-3 text-amber-400" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={(e) => e.stopPropagation()}
                                                        aria-label={`Upload new version for ${subAsset.key}`}
                                                    >
                                                        <Upload className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Sub-Asset Drawer */}
            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="max-h-[90vh]">
                    {selectedSubAsset && (
                        <SubAssetDrawer
                            subAsset={selectedSubAsset}
                            projectId={projectId}
                            onClose={() => setDrawerOpen(false)}
                        />
                    )}
                </DrawerContent>
            </Drawer>
        </div>
    )
}
