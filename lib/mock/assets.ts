import type { Asset, RuleFinding } from "@/lib/types"

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
]

export const mockAssets: Asset[] = [
  {
    id: "1",
    key: "hero_sprite",
    type: "sprite_static",
    base_path: "assets/sprites/hero",
    versioning: "folder",
    current: {
      version: "v2",
      files: ["hero_idle.png", "hero_walk_01.png", "hero_walk_02.png"],
    },
    history: [
      {
        version: "v1",
        files: ["hero_idle.png"],
        notes: "Initial hero sprite",
      },
      {
        version: "v2",
        files: ["hero_idle.png", "hero_walk_01.png", "hero_walk_02.png"],
        notes: "Added walking animation frames",
        findings: [mockFindings[0]],
      },
    ],
    status: "needs_update",
    assignee_user_id: "user1",
    description: "Main character sprite with idle and walking animations",
  },
  {
    id: "2",
    key: "background_music",
    type: "audio_music",
    base_path: "assets/audio/music",
    versioning: "filename",
    current: {
      version: "v1",
      files: ["background_music_v1.wav"],
    },
    history: [
      {
        version: "v1",
        files: ["background_music_v1.wav"],
        notes: "Main theme music",
      },
    ],
    status: "done",
    description: "Main background music for the game",
  },
  {
    id: "3",
    key: "ground_texture",
    type: "texture",
    base_path: "assets/textures",
    versioning: "folder",
    current: {
      version: "v1",
      files: ["ground_texture.png"],
    },
    history: [
      {
        version: "v1",
        files: ["ground_texture.png"],
        notes: "Ground texture for level 1",
        findings: [mockFindings[1]],
      },
    ],
    status: "needs_update",
    assignee_user_id: "user2",
    description: "Ground texture for platform levels",
  },
  {
    id: "4",
    key: "enemy_model",
    type: "model_3d",
    base_path: "assets/models/enemies",
    versioning: "folder",
    current: {
      version: "v1",
      files: ["enemy_basic.fbx", "enemy_basic_texture.png"],
    },
    history: [
      {
        version: "v1",
        files: ["enemy_basic.fbx", "enemy_basic_texture.png"],
        notes: "Basic enemy 3D model",
      },
    ],
    status: "review",
    assignee_user_id: "user1",
    description: "Basic enemy 3D model with texture",
  },
  {
    id: "5",
    key: "jump_sound",
    type: "audio_sfx",
    base_path: "assets/audio/sfx",
    versioning: "filename",
    current: {
      version: "v2",
      files: ["jump_sound_v2.wav"],
    },
    history: [
      {
        version: "v1",
        files: ["jump_sound_v1.wav"],
        notes: "Initial jump sound effect",
      },
      {
        version: "v2",
        files: ["jump_sound_v2.wav"],
        notes: "Improved jump sound with better quality",
      },
    ],
    status: "done",
    description: "Sound effect for player jump action",
  },
  {
    id: "6",
    key: "coin_animation",
    type: "sprite_animation",
    base_path: "assets/sprites/items",
    versioning: "folder",
    current: {
      version: "v1",
      files: ["coin_01.png", "coin_02.png", "coin_03.png", "coin_04.png"],
    },
    history: [
      {
        version: "v1",
        files: ["coin_01.png", "coin_02.png", "coin_03.png", "coin_04.png"],
        notes: "Spinning coin animation",
      },
    ],
    status: "in_progress",
    assignee_user_id: "user2",
    description: "Animated coin collectible sprite",
  },
]

export async function listAssets(projectId: string, filters?: any): Promise<Asset[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))

  let filteredAssets = [...mockAssets]

  if (filters?.status && filters.status.length > 0) {
    filteredAssets = filteredAssets.filter((asset) => filters.status.includes(asset.status))
  }

  if (filters?.type && filters.type.length > 0) {
    filteredAssets = filteredAssets.filter((asset) => filters.type.includes(asset.type))
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase()
    filteredAssets = filteredAssets.filter(
      (asset) =>
        asset.key.toLowerCase().includes(searchLower) || asset.description?.toLowerCase().includes(searchLower),
    )
  }

  return filteredAssets
}

export async function getAsset(projectId: string, assetId: string): Promise<Asset | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockAssets.find((asset) => asset.id === assetId) || null
}

export async function requestAssetUpdate(
  projectId: string,
  assetId: string,
  reasons: string[],
  notes: string,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  // In a real app, this would update the asset status and add findings
  console.log("Asset update requested:", { projectId, assetId, reasons, notes })
}
