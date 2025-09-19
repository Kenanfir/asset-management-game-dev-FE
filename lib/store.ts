import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface UIState {
    // Asset Table state
    selectedAssets: string[]
    searchQuery: string
    statusFilter: string[]
    typeFilter: string[]

    // Upload state
    isUploading: boolean
    uploadProgress: number
    dragActive: boolean

    // Drawer state
    drawerOpen: boolean
    selectedAsset: string | null

    // Actions
    setSelectedAssets: (assets: string[]) => void
    toggleAssetSelection: (assetId: string) => void
    setSearchQuery: (query: string) => void
    setStatusFilter: (status: string[]) => void
    setTypeFilter: (type: string[]) => void
    setUploading: (uploading: boolean) => void
    setUploadProgress: (progress: number) => void
    setDragActive: (active: boolean) => void
    setDrawerOpen: (open: boolean) => void
    setSelectedAsset: (assetId: string | null) => void
    clearFilters: () => void
}

export const useUIStore = create<UIState>()(
    devtools(
        (set, get) => ({
            // Initial state
            selectedAssets: [],
            searchQuery: '',
            statusFilter: [],
            typeFilter: [],
            isUploading: false,
            uploadProgress: 0,
            dragActive: false,
            drawerOpen: false,
            selectedAsset: null,

            // Actions
            setSelectedAssets: (assets) => set({ selectedAssets: assets }),

            toggleAssetSelection: (assetId) => {
                const { selectedAssets } = get()
                const newSelection = selectedAssets.includes(assetId)
                    ? selectedAssets.filter(id => id !== assetId)
                    : [...selectedAssets, assetId]
                set({ selectedAssets: newSelection })
            },

            setSearchQuery: (query) => set({ searchQuery: query }),

            setStatusFilter: (status) => set({ statusFilter: status }),

            setTypeFilter: (type) => set({ typeFilter: type }),

            setUploading: (uploading) => set({ isUploading: uploading }),

            setUploadProgress: (progress) => set({ uploadProgress: progress }),

            setDragActive: (active) => set({ dragActive: active }),

            setDrawerOpen: (open) => set({ drawerOpen: open }),

            setSelectedAsset: (assetId) => set({ selectedAsset: assetId }),

            clearFilters: () => set({
                searchQuery: '',
                statusFilter: [],
                typeFilter: [],
            }),
        }),
        {
            name: 'ui-store',
        }
    )
)
