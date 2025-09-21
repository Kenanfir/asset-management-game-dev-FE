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

export function useUploadJob(projectId: string, jobId: string) {
    return useQuery({
        queryKey: queryKeys.uploadJobs.detail(projectId, jobId),
        queryFn: () => uploadApi.getJob(projectId, jobId),
        enabled: !!projectId && !!jobId,
        refetchInterval: 2000,
    })
}

export function useUploadFiles() {
    const queryClient = useQueryClient()

    return useMutation<UploadJob, Error, {
        projectId: string
        files: File[]
        onProgress?: (progress: number) => void
    }>({
        mutationFn: ({
            projectId,
            files,
            onProgress
        }) => uploadApi.uploadFiles(projectId, files, onProgress),
        onSuccess: (_, { projectId }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.uploadJobs.list(projectId) })
        },
    })
}

export function useValidateFiles() {
    return useMutation({
        mutationFn: (files: File[]) => uploadApi.validateFiles(files),
    })
}
