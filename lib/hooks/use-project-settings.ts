import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/lib/api'
import type { ProjectSettings } from '@/lib/types'

export function useProjectSettings(projectId: string) {
    const queryClient = useQueryClient()

    const query = useQuery({
        queryKey: ['project-settings', projectId],
        queryFn: () => projectsApi.getSettings(projectId),
        staleTime: 5 * 60 * 1000, // 5 minutes
    })

    const updateMutation = useMutation({
        mutationFn: (settings: ProjectSettings) => projectsApi.updateSettings(projectId, settings),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['project-settings', projectId] })
            queryClient.invalidateQueries({ queryKey: ['project', projectId] })
        },
    })

    return {
        data: query.data,
        isLoading: query.isLoading,
        error: query.error,
        updateSettings: updateMutation,
    }
}
