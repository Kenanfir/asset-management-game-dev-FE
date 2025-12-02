import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { uploadApi } from '../api'
import { queryKeys } from '../query-client'
import type { UploadJob, ValidationResult } from '../types'

export function useUploadJobs(projectId: string) {
    return useQuery({
        queryKey: queryKeys.uploadJobs.list(projectId),
        queryFn: () => uploadApi.getJobs(projectId),
        enabled: !!projectId,
        refetchInterval: 2000, // Poll every 2 seconds for real-time updates
    })
}

export function useUploadJob(jobId: string) {
    return useQuery({
        queryKey: queryKeys.uploadJobs.detail('', jobId),
        queryFn: () => uploadApi.getJob(jobId),
        enabled: !!jobId,
        refetchInterval: 2000,
    })
}

export function useUploadFiles() {
    const queryClient = useQueryClient()

    return useMutation<UploadJob, Error, {
        targetSubassetIds: string[]
        mode: 'SINGLE' | 'SEQUENCE'
        files: File[]
        onProgress?: (progress: number) => void
    }>({
        mutationFn: ({
            targetSubassetIds,
            mode,
            files,
            onProgress
        }) => uploadApi.uploadFiles(targetSubassetIds, mode, files, onProgress),
        onSuccess: () => {
            // Invalidate all upload jobs queries
            queryClient.invalidateQueries({ queryKey: ['uploadJobs'] })
        },
    })
}

export function useValidateFiles() {
    return useMutation({
        mutationFn: (files: File[]) => uploadApi.validateFiles(files),
    })
}
