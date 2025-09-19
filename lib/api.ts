import type {
    Asset,
    Project,
    UploadJob,
    User,
    AssetUpdateRequest,
    ValidationResult,
    BulkUploadJob
} from './types'

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

class ApiError extends Error {
    constructor(
        message: string,
        public status: number,
        public response?: any
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

// Generic API client
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    }

    try {
        const response = await fetch(url, config)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            throw new ApiError(
                errorData.message || `HTTP ${response.status}`,
                response.status,
                errorData
            )
        }

        return await response.json()
    } catch (error) {
        if (error instanceof ApiError) {
            throw error
        }
        throw new ApiError(
            error instanceof Error ? error.message : 'Network error',
            0
        )
    }
}

// Import mock data as fallback
import { listProjects as mockListProjects, getProject as mockGetProject, createProject as mockCreateProject } from './mock/projects'
import { listAssets as mockListAssets, getAsset as mockGetAsset, requestAssetUpdate as mockRequestAssetUpdate } from './mock/assets'
import { listUploadJobs as mockListUploadJobs, createUploadJob as mockCreateUploadJob } from './mock/upload-jobs'

// Projects API
export const projectsApi = {
    list: async (): Promise<Project[]> => {
        try {
            return await apiRequest<Project[]>('/projects')
        } catch (error) {
            // Fallback to mock data
            return await mockListProjects()
        }
    },

    get: async (id: string): Promise<Project> => {
        try {
            return await apiRequest<Project>(`/projects/${id}`)
        } catch (error) {
            // Fallback to mock data
            return await mockGetProject(id)
        }
    },

    create: async (repoUrl: string): Promise<Project> => {
        try {
            return await apiRequest<Project>('/projects', {
                method: 'POST',
                body: JSON.stringify({ repo_url: repoUrl }),
            })
        } catch (error) {
            // Fallback to mock data
            return await mockCreateProject(repoUrl)
        }
    },

    update: (id: string, data: Partial<Project>): Promise<Project> =>
        apiRequest<Project>(`/projects/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: (id: string): Promise<void> =>
        apiRequest<void>(`/projects/${id}`, {
            method: 'DELETE',
        }),
}

// Assets API
export const assetsApi = {
    list: async (projectId: string, filters?: {
        search?: string
        status?: string[]
        type?: string[]
    }): Promise<Asset[]> => {
        try {
            return await apiRequest<Asset[]>(`/projects/${projectId}/assets`)
        } catch (error) {
            // Fallback to mock data
            return await mockListAssets(projectId, filters)
        }
    },

    get: async (projectId: string, assetId: string): Promise<Asset> => {
        try {
            return await apiRequest<Asset>(`/projects/${projectId}/assets/${assetId}`)
        } catch (error) {
            // Fallback to mock data
            return await mockGetAsset(projectId, assetId)
        }
    },

    create: (projectId: string, data: Partial<Asset>): Promise<Asset> =>
        apiRequest<Asset>(`/projects/${projectId}/assets`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    update: (projectId: string, assetId: string, data: Partial<Asset>): Promise<Asset> =>
        apiRequest<Asset>(`/projects/${projectId}/assets/${assetId}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        }),

    delete: (projectId: string, assetId: string): Promise<void> =>
        apiRequest<void>(`/projects/${projectId}/assets/${assetId}`, {
            method: 'DELETE',
        }),

    requestUpdate: async (
        projectId: string,
        assetId: string,
        reasons: string[],
        notes: string
    ): Promise<AssetUpdateRequest> => {
        try {
            return await apiRequest<AssetUpdateRequest>(`/projects/${projectId}/assets/${assetId}/request-update`, {
                method: 'POST',
                body: JSON.stringify({ reasons, notes }),
            })
        } catch (error) {
            // Fallback to mock data
            await mockRequestAssetUpdate(projectId, assetId, reasons, notes)
            return {
                id: Date.now().toString(),
                asset_id: assetId,
                created_by: 'current-user',
                created_at: new Date().toISOString(),
                status: 'pending',
                reasons: reasons.map(reason => ({
                    id: Date.now().toString(),
                    update_request_id: Date.now().toString(),
                    rule_id: 'manual',
                    severity: 'info' as const,
                    message: reason,
                    expected: '',
                    actual: '',
                    evidence_paths: [],
                    from_version: 'current',
                })),
                notes,
            }
        }
    },
}

// Upload API
export const uploadApi = {
    uploadFiles: async (
        projectId: string,
        files: File[],
        onProgress?: (progress: number) => void
    ): Promise<UploadJob> => {
        try {
            const formData = new FormData()
            files.forEach((file, index) => {
                formData.append(`files`, file)
            })
            formData.append('projectId', projectId)

            // In a real implementation, this would be a proper multipart upload
            return await apiRequest<UploadJob>('/upload', {
                method: 'POST',
                body: formData,
            })
        } catch (error) {
            // Fallback to mock data
            return await mockCreateUploadJob(projectId, files.map(f => f.name))
        }
    },

    getJobs: async (projectId: string): Promise<UploadJob[]> => {
        try {
            return await apiRequest<UploadJob[]>(`/projects/${projectId}/upload-jobs`)
        } catch (error) {
            // Fallback to mock data
            return await mockListUploadJobs(projectId)
        }
    },

    getJob: (projectId: string, jobId: string): Promise<UploadJob> =>
        apiRequest<UploadJob>(`/projects/${projectId}/upload-jobs/${jobId}`),

    validateFiles: (files: File[]): Promise<ValidationResult[]> =>
        apiRequest<ValidationResult[]>('/validate', {
            method: 'POST',
            body: JSON.stringify({ files: files.map(f => ({ name: f.name, size: f.size, type: f.type })) }),
        }),
}

// Users API
export const usersApi = {
    getCurrent: (): Promise<User> =>
        apiRequest<User>('/users/me'),

    get: (id: string): Promise<User> =>
        apiRequest<User>(`/users/${id}`),

    list: (): Promise<User[]> =>
        apiRequest<User[]>('/users'),
}

// Auth API
export const authApi = {
    signInWithGitHub: (): Promise<{ url: string }> =>
        apiRequest<{ url: string }>('/auth/github'),

    signOut: (): Promise<void> =>
        apiRequest<void>('/auth/signout', { method: 'POST' }),

    getSession: (): Promise<{ user: User | null }> =>
        apiRequest<{ user: User | null }>('/auth/session'),
}

export { ApiError }
