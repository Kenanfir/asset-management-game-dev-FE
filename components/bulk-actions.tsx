"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { MoreHorizontal, AlertTriangle, User, Trash2, CheckCircle } from 'lucide-react'
import { useUIStore } from '@/lib/store'
import { toast } from 'sonner'

interface BulkActionsProps {
    projectId: string
    selectedCount: number
    onBulkAction: (action: string, assetIds: string[]) => Promise<void>
}

export function BulkActions({ projectId, selectedCount, onBulkAction }: BulkActionsProps) {
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [actionLoading, setActionLoading] = useState<string | null>(null)
    const { selectedAssets, clearSelection } = useUIStore()

    const handleBulkAction = async (action: string) => {
        if (selectedAssets.length === 0) return

        setActionLoading(action)
        try {
            await onBulkAction(action, selectedAssets)
            toast.success(`${action} applied to ${selectedAssets.length} asset${selectedAssets.length !== 1 ? 's' : ''}`)
            clearSelection()
        } catch (error) {
            toast.error(`Failed to ${action.toLowerCase()} assets`)
            console.error('Bulk action failed:', error)
        } finally {
            setActionLoading(null)
        }
    }

    const handleDelete = async () => {
        await handleBulkAction('delete')
        setDeleteDialogOpen(false)
    }

    if (selectedCount === 0) return null

    return (
        <>
            <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <Checkbox checked={true} disabled />
                <span className="text-sm font-medium">
                    {selectedCount} asset{selectedCount !== 1 ? 's' : ''} selected
                </span>
                <Badge variant="secondary" className="ml-auto">
                    {selectedCount}
                </Badge>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                            Actions
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => handleBulkAction('mark_needs_update')}
                            disabled={actionLoading !== null}
                        >
                            <AlertTriangle className="mr-2 h-4 w-4" />
                            Mark Needs Update
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => handleBulkAction('assign')}
                            disabled={actionLoading !== null}
                        >
                            <User className="mr-2 h-4 w-4" />
                            Assign to...
                        </DropdownMenuItem>

                        <DropdownMenuItem
                            onClick={() => handleBulkAction('mark_done')}
                            disabled={actionLoading !== null}
                        >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Done
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        <DropdownMenuItem
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={actionLoading !== null}
                            className="text-destructive"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSelection}
                    disabled={actionLoading !== null}
                >
                    Clear
                </Button>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Assets</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete {selectedCount} asset{selectedCount !== 1 ? 's' : ''}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete {selectedCount} Asset{selectedCount !== 1 ? 's' : ''}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
