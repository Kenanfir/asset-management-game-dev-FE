import type { AssetGroup, SubAsset, RuleFinding } from "@/lib/types"

const mockFindings: RuleFinding[] = [
    {
        rule_id: "sprite_animation.fps",
        severity: "warn",
        expected: "12 fps",
        actual: "10 fps",
        message: "Animation frame rate is below recommended minimum",
        evidence_paths: ["assets/sprites/hero/hero_walk_01.png"],
    },
    {
        rule_id: "texture.power_of_two",
        severity: "error",
        expected: "Power of 2 dimensions",
        actual: "1023x512",
        message: "Texture dimensions must be power of 2 for optimal GPU performance",
        evidence_paths: ["assets/textures/ground_texture.png"],
    },
    {
        rule_id: "sprite_static.max_dimensions",
        severity: "error",
        expected: "Max 1024x1024",
        actual: "2048x2048",
        message: "Sprite exceeds maximum allowed dimensions",
        evidence_paths: ["assets/sprites/hero/hero_idle.png"],
    },
    {
        rule_id: "audio_music.sample_rate",
        severity: "warn",
        expected: "48000 Hz",
        actual: "44100 Hz",
        message: "Audio sample rate is below recommended quality",
        evidence_paths: ["assets/audio/music/background_music_v1.wav"],
    },
]

export const mockAssetGroups: AssetGroup[] = [
    {
        id: "hero_character",
        key: "hero_character",
        title: "Hero Character",
        description: "Main character assets including sprites, animations, and audio",
        base_path: "Assets/Characters/Hero",
        tags: ["character", "protagonist", "player"],
        children: [
            {
                id: "hero_sprite",
                key: "hero_sprite",
                type: "sprite_static",
                required_format: "png",
                versioning: "folder",
                base_path: "Assets/Art/Hero",
                path_template: "{base}/{key}/v{version}/",
                current: {
                    version: 2,
                    files: ["hero_idle.png", "hero_walk_01.png", "hero_walk_02.png"],
                },
                history: [
                    {
                        version: 1,
                        files: ["hero_idle.png"],
                        notes: "Initial hero sprite",
                    },
                    {
                        version: 2,
                        files: ["hero_idle.png", "hero_walk_01.png", "hero_walk_02.png"],
                        notes: "Added walking animation frames",
                        findings: [mockFindings[0], mockFindings[2]],
                    },
                ],
                status: "needs_update",
                description: "Main character sprite with idle and walking animations",
                rules: {
                    max_width: 1024,
                    max_height: 1024,
                    power_of_two: false,
                },
            },
            {
                id: "hero_idle",
                key: "hero_idle",
                type: "sprite_animation",
                required_format: "png",
                versioning: "folder",
                base_path: "Assets/Art/Hero",
                path_template: "{base}/{key}/v{version}/",
                current: {
                    version: 1,
                    files: ["frame_000.png", "frame_001.png", "frame_002.png", "frame_003.png"],
                },
                history: [
                    {
                        version: 1,
                        files: ["frame_000.png", "frame_001.png", "frame_002.png", "frame_003.png"],
                        notes: "Idle animation sequence",
                    },
                ],
                status: "done",
                description: "Hero idle animation sequence",
                rules: {
                    fps_min: 12,
                    fps_max: 30,
                    sequence_pattern_required: true,
                    max_frames: 60,
                },
            },
            {
                id: "hero_run",
                key: "hero_run",
                type: "sprite_animation",
                required_format: "png",
                versioning: "folder",
                base_path: "Assets/Art/Hero",
                current: {
                    version: 1,
                    files: ["frame_000.png", "frame_001.png", "frame_002.png", "frame_003.png", "frame_004.png", "frame_005.png"],
                },
                history: [
                    {
                        version: 1,
                        files: ["frame_000.png", "frame_001.png", "frame_002.png", "frame_003.png", "frame_004.png", "frame_005.png"],
                        notes: "Running animation sequence",
                        findings: [mockFindings[0]],
                    },
                ],
                status: "needs_update",
                description: "Hero running animation sequence",
                rules: {
                    fps_min: 12,
                    fps_max: 30,
                    sequence_pattern_required: true,
                    max_frames: 60,
                },
            },
            {
                id: "hero_model",
                key: "hero_model",
                type: "model_3d",
                required_format: "fbx",
                versioning: "folder",
                base_path: "Assets/Models/Hero",
                path_template: "{base}/{key}/v{version}/",
                current: {
                    version: 1,
                    files: ["hero_model.fbx", "hero_texture.png"],
                },
                history: [
                    {
                        version: 1,
                        files: ["hero_model.fbx", "hero_texture.png"],
                        notes: "3D hero model with texture",
                    },
                ],
                status: "review",
                description: "3D hero character model",
                rules: {
                    max_polycount: 10000,
                    max_materials: 5,
                    max_textures: 10,
                },
            },
            {
                id: "hero_theme",
                key: "hero_theme",
                type: "audio_music",
                required_format: "wav",
                versioning: "filename",
                base_path: "Assets/Sound/Music",
                path_template: "{base}/{key}_v{version}.{ext}",
                current: {
                    version: 2,
                    files: ["hero_theme_v2.wav"],
                },
                history: [
                    {
                        version: 1,
                        files: ["hero_theme_v1.wav"],
                        notes: "Initial hero theme music",
                    },
                    {
                        version: 2,
                        files: ["hero_theme_v2.wav"],
                        notes: "Updated hero theme with better quality",
                        findings: [mockFindings[3]],
                    },
                ],
                status: "done",
                description: "Hero character theme music",
                rules: {
                    sample_rate: 44100,
                    channels: 2,
                    bit_depth: 16,
                    max_duration_seconds: 300,
                },
            },
        ],
    },
    {
        id: "environment_assets",
        key: "environment_assets",
        title: "Environment Assets",
        description: "Level backgrounds, textures, and environmental elements",
        base_path: "Assets/Environment",
        tags: ["environment", "background", "level"],
        children: [
            {
                id: "ground_texture",
                key: "ground_texture",
                type: "texture",
                required_format: "png",
                versioning: "folder",
                base_path: "Assets/Art/Environment",
                path_template: "{base}/{key}/v{version}/",
                current: {
                    version: 1,
                    files: ["ground_texture.png"],
                },
                history: [
                    {
                        version: 1,
                        files: ["ground_texture.png"],
                        notes: "Ground texture for level 1",
                        findings: [mockFindings[1]],
                    },
                ],
                status: "needs_update",
                description: "Ground texture for platform levels",
                rules: {
                    power_of_two: true,
                    max_size: 2048,
                    min_size: 64,
                },
            },
        ],
    },
    {
        id: "ui_elements",
        key: "ui_elements",
        title: "UI Elements",
        description: "User interface components and HUD elements",
        base_path: "Assets/UI",
        tags: ["ui", "interface", "hud"],
        children: [
            {
                id: "coin_animation",
                key: "coin_animation",
                type: "sprite_animation",
                required_format: "png",
                versioning: "folder",
                base_path: "Assets/UI/Items",
                path_template: "{base}/{key}/v{version}/",
                current: {
                    version: 1,
                    files: ["coin_01.png", "coin_02.png", "coin_03.png", "coin_04.png"],
                },
                history: [
                    {
                        version: 1,
                        files: ["coin_01.png", "coin_02.png", "coin_03.png", "coin_04.png"],
                        notes: "Spinning coin animation",
                    },
                ],
                status: "in_progress",
                description: "Animated coin collectible sprite",
                rules: {
                    fps_min: 12,
                    fps_max: 30,
                    sequence_pattern_required: true,
                    max_frames: 60,
                },
            },
        ],
    },
]

export async function listAssetGroups(projectId: string): Promise<AssetGroup[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockAssetGroups
}

export async function getAssetGroup(projectId: string, groupId: string): Promise<AssetGroup | null> {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockAssetGroups.find((group) => group.id === groupId) || null
}

export async function createAssetGroup(projectId: string, data: Omit<AssetGroup, 'id' | 'children'>): Promise<AssetGroup> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newGroup: AssetGroup = {
        id: `group_${Date.now()}`,
        children: [],
        ...data,
    }

    mockAssetGroups.push(newGroup)
    return newGroup
}

export async function createSubAsset(projectId: string, groupId: string, data: Omit<SubAsset, 'id'>): Promise<SubAsset> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    const newSubAsset: SubAsset = {
        id: `sub_${Date.now()}`,
        ...data,
    }

    const group = mockAssetGroups.find((g) => g.id === groupId)
    if (group) {
        group.children.push(newSubAsset)
    }

    return newSubAsset
}

export async function updateSubAsset(projectId: string, subAssetId: string, updates: Partial<SubAsset>): Promise<SubAsset> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    for (const group of mockAssetGroups) {
        const subAsset = group.children.find((child) => child.id === subAssetId)
        if (subAsset) {
            Object.assign(subAsset, updates)
            return subAsset
        }
    }

    throw new Error("Sub-asset not found")
}

export async function markNeedsUpdate(projectId: string, subAssetId: string, reasons: string[], notes?: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    for (const group of mockAssetGroups) {
        const subAsset = group.children.find((child) => child.id === subAssetId)
        if (subAsset) {
            subAsset.status = "needs_update"

            // Add findings based on reasons
            const findings: RuleFinding[] = reasons.map((reason, index) => ({
                rule_id: `manual_${index}`,
                severity: "info" as const,
                expected: "Compliant",
                actual: reason,
                message: reason,
                evidence_paths: [],
            }))

            // Add to current version's findings
            const currentVersion = subAsset.history.find(h => h.version === subAsset.current.version)
            if (currentVersion) {
                currentVersion.findings = [...(currentVersion.findings || []), ...findings]
            }

            if (notes) {
                const currentVersion = subAsset.history.find(h => h.version === subAsset.current.version)
                if (currentVersion) {
                    currentVersion.notes = notes
                }
            }

            return
        }
    }

    throw new Error("Sub-asset not found")
}
