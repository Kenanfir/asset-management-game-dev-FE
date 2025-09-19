import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { assetsApi } from '../api'
import { queryKeys } from '../query-client'
import type { Asset, AssetUpdateRequest } from '../types'

export function useAssets(projectId: string, filters?: {
    search?: string
    status?: string[]
    type?: string[]
}) {
    return useQuery({
        queryKey: queryKeys.assets.list(projectId, filters || {}),
        queryFn: () => assetsApi.list(projectId, filters),
        enabled: !!projectId,
    })
}

export function useAsset(projectId: string, assetId: string) {
    return useQuery({
        queryKey: queryKeys.assets.detail(projectId, assetId),
        queryFn: () => assetsApi.get(projectId, assetId),
        enabled: !!projectId && !!assetId,
    })
}

export function useCreateAsset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: Partial<Asset> }) =>
            assetsApi.create(projectId, data),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.lists() })
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.list(projectId, {}) })
        },
    })
}

export function useUpdateAsset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            projectId,
            assetId,
            data
        }: {
            projectId: string
            assetId: string
            data: Partial<Asset>
        }) => assetsApi.update(projectId, assetId, data),
        onSuccess: (_, { projectId, assetId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(projectId, assetId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.list(projectId, {}) })
        },
    })
}

export function useDeleteAsset() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ projectId, assetId }: { projectId: string; assetId: string }) =>
            assetsApi.delete(projectId, assetId),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.list(projectId, {}) })
        },
    })
}

export function useRequestAssetUpdate() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({
            projectId,
            assetId,
            reasons,
            notes
        }: {
            projectId: string
            assetId: string
            reasons: string[]
            notes: string
        }) => assetsApi.requestUpdate(projectId, assetId, reasons, notes),
        onSuccess: (_, { projectId, assetId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.detail(projectId, assetId) })
            queryClient.invalidateQueries({ queryKey: queryKeys.assets.list(projectId, {}) })
        },
    })
}
