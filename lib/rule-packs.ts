import type { RulePack } from "./types"

export const RULE_PACKS: RulePack[] = [
  {
    asset_type: "sprite_static",
    formats: ["png", "tga", "webp"],
    rules: {
      max_width: 4096,
      max_height: 4096,
      min_width: 16,
      min_height: 16,
    },
  },
  {
    asset_type: "sprite_animation",
    formats: ["png"],
    rules: {
      fps_min: 1,
      fps_max: 60,
      sequence_pattern_required: true,
      max_frames: 120,
    },
  },
  {
    asset_type: "audio_music",
    formats: ["wav", "aiff"],
    rules: {
      sample_rate: 48000,
      channels: 2,
      bit_depth: [16, 24],
    },
  },
  {
    asset_type: "audio_sfx",
    formats: ["wav"],
    rules: {
      sample_rate: [44100, 48000],
      channels: [1, 2],
      max_duration_seconds: 30,
    },
  },
  {
    asset_type: "model_3d",
    formats: ["fbx", "glb", "gltf"],
    rules: {
      max_polycount: 50000,
      max_materials: 10,
      max_textures: 20,
    },
  },
  {
    asset_type: "texture",
    formats: ["png", "jpg", "tga", "exr"],
    rules: {
      power_of_two: true,
      max_size: 4096,
      min_size: 64,
    },
  },
  {
    asset_type: "animation_3d",
    formats: ["fbx", "glb"],
    rules: {
      max_duration_seconds: 60,
      fps: [24, 30, 60],
    },
  },
]

export function getRulePackForAssetType(assetType: string) {
  return RULE_PACKS.find((pack) => pack.asset_type === assetType)
}

export function getExpectedFormats(assetType: string): string[] {
  const rulePack = getRulePackForAssetType(assetType)
  return rulePack?.formats || []
}
