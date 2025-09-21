"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { Checkbox } from "@/components/ui/checkbox"
import { EnumBadge } from "@/components/ui/enum-badge"
import { StatusChip } from "@/components/ui/status-chip"
import { Search, Filter, Plus, Upload, Eye, AlertTriangle, X } from "lucide-react"
import { useAssets } from "@/lib/hooks/use-assets"
import { useUIStore } from "@/lib/store"
import { getUserById } from "@/lib/mock/users"
import { getExpectedFormats } from "@/lib/rule-packs"
import { useUrlParams } from "@/lib/hooks/use-url-params"
import { toast } from "sonner"
import type { Asset, Status } from "@/lib/types"
import { AssetDrawer } from "./asset-drawer"
import { FileUpload } from "./file-upload"
import { BulkOperations } from "./bulk-operations"
import { BulkActions } from "./bulk-actions"
import { InlineEdit, InlineStatusEdit } from "./inline-edit"
import { InlineAssigneeEdit } from "./inline-assignee-edit"
import { TableSkeleton } from "./ui/skeleton"

interface AssetTableProps {
  projectId: string
}

export function AssetTable({ projectId }: AssetTableProps) {
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

  // Sync URL params with store on mount
  const urlSearch = getParam("q", "")
  const urlStatus = getArrayParam("status", [])
  const urlType = getArrayParam("type", [])

  const { data: assets = [], isLoading: loading, error } = useAssets(projectId, {
    search: urlSearch || searchQuery,
    status: urlStatus.length > 0 ? urlStatus : statusFilter,
    type: urlType.length > 0 ? urlType : typeFilter,
  })

  const handleRowClick = (asset: Asset) => {
    setSelectedAsset(asset.id)
    setDrawerOpen(true)
  }

  const handleAssetUpdate = async (assetId: string, updates: Partial<Asset>) => {
    // In a real app, this would call an API to update the asset
    console.log('Updating asset:', assetId, updates)
    toast.success('Asset updated successfully')
  }

  const handleBulkAction = async (action: string, assetIds: string[]) => {
    // In a real app, this would call an API for bulk operations
    console.log('Bulk action:', action, assetIds)
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
    selectAllAssets(assets.map(asset => asset.id))
  }

  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter([])
    setTypeFilter([])
    updateParams({ q: null, status: null, type: null })
  }

  const formatVersion = (version: string) => {
    return version.startsWith("v") ? version : `v${version}`
  }

  const getAssigneeName = (userId?: string) => {
    if (!userId) return "Unassigned"
    const user = getUserById(userId)
    return user ? user.name : `User ${userId}`
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={urlSearch || searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={urlStatus[0] || statusFilter[0] || "all"}
            onValueChange={handleStatusFilterChange}
          >
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Status" />
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
            <SelectTrigger className="w-32">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sprite_static">Sprite Static</SelectItem>
              <SelectItem value="sprite_animation">Sprite Animation</SelectItem>
              <SelectItem value="texture">Texture</SelectItem>
              <SelectItem value="audio_music">Audio Music</SelectItem>
              <SelectItem value="audio_sfx">Audio SFX</SelectItem>
              <SelectItem value="model_3d">3D Model</SelectItem>
            </SelectContent>
          </Select>

          {(urlSearch || urlStatus.length > 0 || urlType.length > 0 || searchQuery || statusFilter.length > 0 || typeFilter.length > 0) && (
            <Button variant="outline" size="sm" onClick={handleClearFilters}>
              <X className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}

          <BulkOperations projectId={projectId} />
        </div>
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
                  checked={allSelected || (assets.length > 0 && selectedAssets.length === assets.length)}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all assets"
                />
              </TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>File Type</TableHead>
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
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">No assets found</h3>
                      <p className="text-muted-foreground mb-4">
                        {urlSearch || searchQuery || urlStatus.length > 0 || urlType.length > 0
                          ? "Try adjusting your filters or search terms"
                          : "Get started by adding your first asset"
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
              assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className={`border-border/50 hover:bg-muted/50 transition-colors ${selectedAssets.includes(asset.id) ? 'bg-primary/5' : ''
                    }`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedAssets.includes(asset.id)}
                      onCheckedChange={() => toggleAssetSelection(asset.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${asset.key}`}
                    />
                  </TableCell>
                  <TableCell
                    className="font-medium cursor-pointer"
                    onClick={() => handleRowClick(asset)}
                  >
                    <InlineEdit
                      value={asset.key}
                      type="text"
                      onSave={(value) => handleAssetUpdate(asset.id, { key: value })}
                      placeholder="Asset key"
                    />
                  </TableCell>
                  <TableCell>
                    <EnumBadge type={asset.type} />
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      .{asset.file_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{formatVersion(asset.current.version)}</Badge>
                  </TableCell>
                  <TableCell>
                    <InlineStatusEdit
                      status={asset.status}
                      onSave={(status) => handleAssetUpdate(asset.id, { status })}
                    />
                  </TableCell>
                  <TableCell>
                    <InlineAssigneeEdit
                      assigneeId={asset.assignee_user_id ?? undefined}
                      onSave={(assigneeId) => handleAssetUpdate(asset.id, { assignee_user_id: assigneeId ?? undefined })}
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
                          handleRowClick(asset)
                        }}
                        aria-label={`View details for ${asset.key}`}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {asset.status === "needs_update" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${asset.key} needs update`}
                        >
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`Upload new version for ${asset.key}`}
                      >
                        <Upload className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Asset Drawer */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="max-h-[90vh]">
          {selectedAsset && (
            <AssetDrawer
              asset={assets.find(a => a.id === selectedAsset)!}
              projectId={projectId}
              onClose={() => setDrawerOpen(false)}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}
