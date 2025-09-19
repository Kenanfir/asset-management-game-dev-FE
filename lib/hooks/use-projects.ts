import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '../api'
import { queryKeys } from '../query-client'
import type { Project } from '../types'

export function useProjects() {
    return useQuery({
        queryKey: queryKeys.projects.lists(),
        queryFn: projectsApi.list,
    })
}

export function useProject(id: string) {
    return useQuery({
        queryKey: queryKeys.projects.detail(id),
        queryFn: () => projectsApi.get(id),
        enabled: !!id,
    })
}

export function useCreateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (repoUrl: string) => projectsApi.create(repoUrl),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
        },
    })
}

export function useUpdateProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
            projectsApi.update(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
        },
    })
}

export function useDeleteProject() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => projectsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.projects.lists() })
        },
    })
}
