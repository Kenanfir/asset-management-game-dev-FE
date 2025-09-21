import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetGroupsApi } from '@/lib/api'
import type { AssetGroup, SubAsset } from '@/lib/types'

export function useAssetGroups(projectId: string) {
    const query = useQuery({
        queryKey: ['asset-groups', projectId],
        queryFn: () => assetGroupsApi.list(projectId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    return {
        data: query.data || [],
        isLoading: query.isLoading,
        error: query.error,
    }
}

export function useAssetGroup(projectId: string, groupId: string) {
    const query = useQuery({
        queryKey: ['asset-group', projectId, groupId],
        queryFn: () => assetGroupsApi.get(projectId, groupId),
        enabled: !!groupId,
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
    }
}

export function useCreateAssetGroup() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Omit<AssetGroup, 'id' | 'children'> }) =>
            assetGroupsApi.create(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['asset-groups', projectId] })
        },
    })
}

export function useCreateSubAsset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, groupId, data }: { projectId: string; groupId: string; data: Omit<SubAsset, 'id'> }) =>
            assetGroupsApi.createSubAsset(projectId, groupId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['asset-groups', projectId] })
            queryClient.invalidateQueries({ queryKey: ['asset-group', projectId] })
        },
    })
}

export function useUpdateSubAsset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, subAssetId, data }: { projectId: string; subAssetId: string; data: Partial<SubAsset> }) =>
            assetGroupsApi.updateSubAsset(projectId, subAssetId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['asset-groups', projectId] })
            queryClient.invalidateQueries({ queryKey: ['asset-group', projectId] })
        },
    })
}

export function useMarkNeedsUpdate() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, subAssetId, reasons, notes }: { projectId: string; subAssetId: string; reasons: string[]; notes?: string }) =>
            assetGroupsApi.markNeedsUpdate(projectId, subAssetId, reasons, notes),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: ['asset-groups', projectId] })
            queryClient.invalidateQueries({ queryKey: ['asset-group', projectId] })
        },
    })
}
