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

        const data = await response.json()

        // Extract content from standardized backend response format
        // Backend returns: { message: string, content: T, errors: [] }
        if (data && typeof data === 'object' && 'content' in data) {
            return data.content as T
        }

        return data as T
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
        targetSubassetIds: string[],
        mode: 'SINGLE' | 'SEQUENCE',
        files: File[],
        onProgress?: (progress: number) => void
    ): Promise<UploadJob> => {
        try {
            const formData = new FormData()
            files.forEach((file) => {
                formData.append('files', file)
            })
            formData.append('targetSubassetIds', JSON.stringify(targetSubassetIds))
            formData.append('mode', mode)

            // Note: Content-Type header must not be set for multipart/form-data
            // Browser will set it automatically with correct boundary
            return await apiRequest<UploadJob>('/uploads', {
                method: 'POST',
                body: formData,
                headers: {}, // Clear default Content-Type header
            })
        } catch (error) {
            // Fallback to mock data
            return await mockCreateUploadJob('unknown', files.map(f => f.name))
        }
    },

    getJobs: async (projectId: string): Promise<UploadJob[]> => {
        try {
            // Note: Backend doesn't have project-specific job listing yet
            // This will need backend implementation or should be removed
            return await mockListUploadJobs(projectId)
        } catch (error) {
            return await mockListUploadJobs(projectId)
        }
    },

    getJob: async (jobId: string): Promise<UploadJob> => {
        try {
            return await apiRequest<UploadJob>(`/uploads/${jobId}`)
        } catch (error) {
            throw new ApiError('Upload job not found', 404)
        }
    },

    validateFiles: async (files: File[]): Promise<ValidationResult[]> => {
        try {
            // Note: Backend doesn't have validation endpoint yet
            // Return empty array for now
            return []
        } catch (error) {
            return []
        }
    },
}

// Asset Groups API
export const assetGroupsApi = {
    list: async (projectId: string): Promise<AssetGroup[]> => {
        try {
            // Use query parameter as per backend implementation
            return await apiRequest<AssetGroup[]>(`/assets/groups?projectId=${projectId}`)
        } catch (error) {
            // Fallback to mock data
            return await mockListAssetGroups(projectId)
        }
    },

    get: async (projectId: string, groupId: string): Promise<AssetGroup> => {
        try {
            // Backend doesn't have this endpoint yet, use mock
            const group = await mockGetAssetGroup(projectId, groupId)
            if (!group) {
                throw new ApiError('Asset group not found', 404)
            }
            return group
        } catch (error) {
            const group = await mockGetAssetGroup(projectId, groupId)
            if (!group) {
                throw new ApiError('Asset group not found', 404)
            }
            return group
        }
    },

    create: async (projectId: string, data: Omit<AssetGroup, 'id' | 'children'>): Promise<AssetGroup> => {
        try {
            // Backend doesn't have this endpoint yet, use mock
            return await mockCreateAssetGroup(projectId, data)
        } catch (error) {
            return await mockCreateAssetGroup(projectId, data)
        }
    },

    createSubAsset: async (projectId: string, groupId: string, data: Omit<SubAsset, 'id'>): Promise<SubAsset> => {
        try {
            // Backend doesn't have this endpoint yet, use mock
            return await mockCreateSubAsset(projectId, groupId, data)
        } catch (error) {
            return await mockCreateSubAsset(projectId, groupId, data)
        }
    },

    updateSubAsset: async (projectId: string, subAssetId: string, data: Partial<SubAsset>): Promise<SubAsset> => {
        try {
            // Backend doesn't have this endpoint yet, use mock
            return await mockUpdateSubAsset(projectId, subAssetId, data)
        } catch (error) {
            return await mockUpdateSubAsset(projectId, subAssetId, data)
        }
    },

    markNeedsUpdate: async (projectId: string, subAssetId: string, reasons: string[], notes?: string): Promise<void> => {
        try {
            // Backend doesn't have this endpoint yet, use mock
            return await mockMarkNeedsUpdate(projectId, subAssetId, reasons, notes)
        } catch (error) {
            return await mockMarkNeedsUpdate(projectId, subAssetId, reasons, notes)
        }
    },

    // New: Get sub-assets list (backend implemented)
    getSubAssets: async (groupId?: string, projectId?: string): Promise<SubAsset[]> => {
        try {
            const params = new URLSearchParams()
            if (groupId) params.append('groupId', groupId)
            if (projectId) params.append('projectId', projectId)

            return await apiRequest<SubAsset[]>(`/assets/sub-assets?${params}`)
        } catch (error) {
            return []
        }
    },

    // New: Get sub-asset history (backend implemented)
    getHistory: async (subAssetId: string) => {
        try {
            return await apiRequest(`/assets/sub-assets/${subAssetId}/history`)
        } catch (error) {
            return { subAsset: null, history: [] }
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
        apiRequest<{ url: string }>('/auth/github/start'),

    signOut: (): Promise<void> =>
        apiRequest<void>('/auth/logout', { method: 'POST' }),

    getMe: (): Promise<User> =>
        apiRequest<User>('/auth/me'),

    // Deprecated: use getMe instead
    getSession: async (): Promise<{ user: User | null }> => {
        try {
            const user = await apiRequest<User>('/auth/me')
            return { user }
        } catch (error) {
            return { user: null }
        }
    },
}

// Rule Packs API (NEW - connect to backend)
export const rulePacksApi = {
    list: async (): Promise<Array<{ key: string; displayName: string; rulesSummary: string }>> => {
        try {
            return await apiRequest('/rule-packs')
        } catch (error) {
            // Fallback to local rule packs
            console.warn('Failed to fetch rule packs from backend, using local data')
            return []
        }
    },
}

// Path Resolution API (NEW - connect to backend)
export const pathApi = {
    resolve: async (data: {
        base: string
        key: string
        version: number
        ext: string
        pathTemplate: string
    }): Promise<{ resolvedPath: string; template: string; variables: any }> => {
        try {
            return await apiRequest('/path/resolve', {
                method: 'POST',
                body: JSON.stringify(data),
            })
        } catch (error) {
            // Fallback: simple template resolution
            const resolvedPath = data.pathTemplate
                .replace('{base}', data.base)
                .replace('{key}', data.key)
                .replace('{version}', String(data.version))
                .replace('{ext}', data.ext)

            return {
                resolvedPath,
                template: data.pathTemplate,
                variables: data,
            }
        }
    },
}

export { ApiError }
