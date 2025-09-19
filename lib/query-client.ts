import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: (failureCount, error: any) => {
                // Don't retry on 4xx errors
                if (error?.status >= 400 && error?.status < 500) {
                    return false
                }
                return failureCount < 3
            },
        },
        mutations: {
            retry: false,
        },
    },
})

// Query keys factory
export const queryKeys = {
    projects: {
        all: ['projects'] as const,
        lists: () => [...queryKeys.projects.all, 'list'] as const,
        list: (filters: Record<string, any>) => [...queryKeys.projects.lists(), { filters }] as const,
        details: () => [...queryKeys.projects.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.projects.details(), id] as const,
    },
    assets: {
        all: ['assets'] as const,
        lists: () => [...queryKeys.assets.all, 'list'] as const,
        list: (projectId: string, filters: Record<string, any>) =>
            [...queryKeys.assets.lists(), projectId, { filters }] as const,
        details: () => [...queryKeys.assets.all, 'detail'] as const,
        detail: (projectId: string, assetId: string) =>
            [...queryKeys.assets.details(), projectId, assetId] as const,
    },
    uploadJobs: {
        all: ['uploadJobs'] as const,
        lists: () => [...queryKeys.uploadJobs.all, 'list'] as const,
        list: (projectId: string) => [...queryKeys.uploadJobs.lists(), projectId] as const,
        details: () => [...queryKeys.uploadJobs.all, 'detail'] as const,
        detail: (projectId: string, jobId: string) =>
            [...queryKeys.uploadJobs.details(), projectId, jobId] as const,
    },
    users: {
        all: ['users'] as const,
        lists: () => [...queryKeys.users.all, 'list'] as const,
        details: () => [...queryKeys.users.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
        current: () => [...queryKeys.users.all, 'current'] as const,
    },
    auth: {
        session: () => ['auth', 'session'] as const,
    },
}
