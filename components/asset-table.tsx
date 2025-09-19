"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Drawer, DrawerContent } from "@/components/ui/drawer"
import { EnumBadge } from "@/components/ui/enum-badge"
import { StatusChip } from "@/components/ui/status-chip"
import { Search, Filter, Plus, Upload, Eye, AlertTriangle } from "lucide-react"
import { useAssets } from "@/lib/hooks/use-assets"
import { useUIStore } from "@/lib/store"
import { getUserById } from "@/lib/mock/users"
import { getExpectedFormats } from "@/lib/rule-packs"
import type { Asset, Status } from "@/lib/types"
import { AssetDrawer } from "./asset-drawer"
import { FileUpload } from "./file-upload"
import { BulkOperations } from "./bulk-operations"
import { InlineEdit, InlineStatusEdit } from "./inline-edit"

interface AssetTableProps {
  projectId: string
}

export function AssetTable({ projectId }: AssetTableProps) {
  const {
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
  } = useUIStore()

  const { data: assets = [], isLoading: loading, error } = useAssets(projectId, {
    search: searchQuery,
    status: statusFilter,
    type: typeFilter,
  })

  const handleRowClick = (asset: Asset) => {
    setSelectedAsset(asset.id)
    setDrawerOpen(true)
  }

  const handleAssetUpdate = async (assetId: string, updates: Partial<Asset>) => {
    // In a real app, this would call an API to update the asset
    console.log('Updating asset:', assetId, updates)
    // For now, we'll just log the update
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex gap-2">
          <Select
            value={statusFilter[0] || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? [] : [value])}
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
            value={typeFilter[0] || "all"}
            onValueChange={(value) => setTypeFilter(value === "all" ? [] : [value])}
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

          <BulkOperations projectId={projectId} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50">
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
                <TableCell colSpan={8} className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-muted-foreground">Loading assets...</p>
                </TableCell>
              </TableRow>
            ) : assets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8">
                  <p className="text-muted-foreground">No assets found</p>
                </TableCell>
              </TableRow>
            ) : (
              assets.map((asset) => (
                <TableRow
                  key={asset.id}
                  className="border-border/50 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => handleRowClick(asset)}
                >
                  <TableCell className="font-medium">
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
                    <span className="text-sm">{getAssigneeName(asset.assignee_user_id)}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">2 hours ago</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleRowClick(asset)
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {asset.status === "needs_update" && (
                        <Button size="sm" variant="ghost">
                          <AlertTriangle className="h-3 w-3 text-amber-400" />
                        </Button>
                      )}
                      <Button size="sm" variant="ghost">
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
