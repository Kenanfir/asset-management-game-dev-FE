import type {
    Asset,
    Project,
    UploadJob,
    User,
    AssetUpdateRequest,
    ValidationResult,
    BulkUploadJob,
    AssetGroup,
    SubAsset,
    ProjectSettings
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
import { listProjects as mockListProjects, getProject as mockGetProject, createProject as mockCreateProject, getProjectSettings as mockGetProjectSettings, updateProjectSettings as mockUpdateProjectSettings } from './mock/projects'
import { listAssets as mockListAssets, getAsset as mockGetAsset, requestAssetUpdate as mockRequestAssetUpdate } from './mock/assets'
import { listAssetGroups as mockListAssetGroups, getAssetGroup as mockGetAssetGroup, createAssetGroup as mockCreateAssetGroup, createSubAsset as mockCreateSubAsset, updateSubAsset as mockUpdateSubAsset, markNeedsUpdate as mockMarkNeedsUpdate } from './mock/asset-groups'
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
            const project = await mockGetProject(id)
            if (!project) {
                throw new ApiError('Project not found', 404)
            }
            return project
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

    getSettings: async (id: string): Promise<ProjectSettings> => {
        try {
            return await apiRequest<ProjectSettings>(`/projects/${id}/settings`)
        } catch (error) {
            // Fallback to mock data
            const settings = await mockGetProjectSettings(id)
            if (!settings) {
                throw new ApiError('Project settings not found', 404)
            }
            return settings
        }
    },

    updateSettings: async (id: string, settings: Partial<ProjectSettings>): Promise<ProjectSettings> => {
        try {
            return await apiRequest<ProjectSettings>(`/projects/${id}/settings`, {
                method: 'PATCH',
                body: JSON.stringify(settings),
            })
        } catch (error) {
            // Fallback to mock data
            return await mockUpdateProjectSettings(id, settings)
        }
    },
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
            const asset = await mockGetAsset(projectId, assetId)
            if (!asset) {
                throw new ApiError('Asset not found', 404)
            }
            return asset
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

// Asset Groups API
export const assetGroupsApi = {
    list: async (projectId: string): Promise<AssetGroup[]> => {
        try {
            return await apiRequest<AssetGroup[]>(`/projects/${projectId}/asset-groups`)
        } catch (error) {
            // Fallback to mock data
            return await mockListAssetGroups(projectId)
        }
    },

    get: async (projectId: string, groupId: string): Promise<AssetGroup> => {
        try {
            return await apiRequest<AssetGroup>(`/projects/${projectId}/asset-groups/${groupId}`)
        } catch (error) {
            // Fallback to mock data
            const group = await mockGetAssetGroup(projectId, groupId)
            if (!group) {
                throw new ApiError('Asset group not found', 404)
            }
            return group
        }
    },

    create: async (projectId: string, data: Omit<AssetGroup, 'id' | 'children'>): Promise<AssetGroup> => {
        try {
            return await apiRequest<AssetGroup>(`/projects/${projectId}/asset-groups`, {
                method: 'POST',
                body: JSON.stringify(data),
            })
        } catch (error) {
            // Fallback to mock data
            return await mockCreateAssetGroup(projectId, data)
        }
    },

    createSubAsset: async (projectId: string, groupId: string, data: Omit<SubAsset, 'id'>): Promise<SubAsset> => {
        try {
            return await apiRequest<SubAsset>(`/projects/${projectId}/asset-groups/${groupId}/sub-assets`, {
                method: 'POST',
                body: JSON.stringify(data),
            })
        } catch (error) {
            // Fallback to mock data
            return await mockCreateSubAsset(projectId, groupId, data)
        }
    },

    updateSubAsset: async (projectId: string, subAssetId: string, data: Partial<SubAsset>): Promise<SubAsset> => {
        try {
            return await apiRequest<SubAsset>(`/projects/${projectId}/sub-assets/${subAssetId}`, {
                method: 'PATCH',
                body: JSON.stringify(data),
            })
        } catch (error) {
            // Fallback to mock data
            return await mockUpdateSubAsset(projectId, subAssetId, data)
        }
    },

    markNeedsUpdate: async (projectId: string, subAssetId: string, reasons: string[], notes?: string): Promise<void> => {
        try {
            return await apiRequest<void>(`/projects/${projectId}/sub-assets/${subAssetId}/mark-needs-update`, {
                method: 'POST',
                body: JSON.stringify({ reasons, notes }),
            })
        } catch (error) {
            // Fallback to mock data
            return await mockMarkNeedsUpdate(projectId, subAssetId, reasons, notes)
        }
    },
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
