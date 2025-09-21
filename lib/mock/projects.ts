import type { Project, AssetType, ProjectSettings, NamingRule } from "@/lib/types"

const defaultRulePacks: Partial<Record<AssetType, { allowed_formats: string[]; rules: Record<string, unknown> }>> = {
  sprite_static: {
    allowed_formats: ["png", "tga", "webp"],
    rules: {
      max_width: 1024,
      max_height: 1024,
      min_width: 32,
      min_height: 32,
      power_of_two: false,
    },
  },
  sprite_animation: {
    allowed_formats: ["png"],
    rules: {
      fps_min: 12,
      fps_max: 30,
      max_frames: 60,
      sequence_pattern_required: true,
    },
  },
  texture: {
    allowed_formats: ["png", "jpg", "tga", "exr"],
    rules: {
      power_of_two: true,
      max_size: 2048,
      min_size: 64,
    },
  },
  audio_music: {
    allowed_formats: ["wav", "aiff"],
    rules: {
      sample_rate: 44100,
      channels: 2,
      bit_depth: 16,
      max_duration_seconds: 300,
    },
  },
  audio_sfx: {
    allowed_formats: ["wav"],
    rules: {
      sample_rate: 44100,
      channels: 1,
      max_duration_seconds: 10,
    },
  },
  model_3d: {
    allowed_formats: ["fbx", "glb", "gltf"],
    rules: {
      max_polycount: 10000,
      max_materials: 5,
      max_textures: 10,
    },
  },
  animation_3d: {
    allowed_formats: ["fbx", "glb"],
    rules: {
      max_duration_seconds: 30,
      fps: 30,
    },
  },
}

const defaultNamingConventions: NamingRule[] = [
  {
    id: "sprite_sequence",
    pattern: "frame_{index:000}.png",
    description: "Sprite animation frame sequence",
    example: "frame_000.png",
  },
  {
    id: "audio_take",
    pattern: "{name}_v{version}.wav",
    description: "Audio file with version",
    example: "jump_sound_v1.wav",
  },
  {
    id: "texture_variant",
    pattern: "{name}_{variant}.png",
    description: "Texture with variant suffix",
    example: "ground_texture_diffuse.png",
  },
]

const defaultBasePaths: Partial<Record<AssetType, string>> = {
  sprite_static: "Assets/Art",
  sprite_animation: "Assets/Art",
  texture: "Assets/Art",
  ui_element: "Assets/UI",
  audio_music: "Assets/Sound",
  audio_sfx: "Assets/Sound",
  model_3d: "Assets/Models",
  rig: "Assets/Models",
  animation_3d: "Assets/Animations",
  material: "Assets/Materials",
  shader: "Assets/Shaders",
  vfx: "Assets/VFX",
  doc: "Assets/Docs",
}

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Pixel Adventure",
    repo_url: "https://github.com/gamedev/pixel-adventure",
    last_sync: "2024-01-15T10:30:00Z",
    default_branch: "main",
    description: "A retro-style platformer game with pixel art assets",
    settings: {
      default_rule_pack_by_type: defaultRulePacks,
      naming_conventions: defaultNamingConventions,
      allow_lossy_autofix: false,
      default_base_paths: defaultBasePaths,
      auto_assign: false,
      validation_strict: true,
    },
  },
  {
    id: "2",
    name: "Space Odyssey",
    repo_url: "https://github.com/gamedev/space-odyssey",
    last_sync: "2024-01-14T16:45:00Z",
    default_branch: "develop",
    description: "3D space exploration game with procedural generation",
    settings: {
      default_rule_pack_by_type: defaultRulePacks,
      naming_conventions: defaultNamingConventions,
      allow_lossy_autofix: true,
      auto_assign: true,
      validation_strict: false,
    },
  },
]

export async function listProjects(): Promise<Project[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockProjects
}

export async function getProject(id: string): Promise<Project | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockProjects.find((p) => p.id === id) || null
}

export async function createProject(repoUrl: string): Promise<Project> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newProject: Project = {
    id: String(mockProjects.length + 1),
    name: repoUrl.split("/").pop() || "New Project",
    repo_url: repoUrl,
    last_sync: new Date().toISOString(),
    default_branch: "main",
    description: "Newly connected repository",
    settings: {
      default_rule_pack_by_type: defaultRulePacks,
      naming_conventions: defaultNamingConventions,
      allow_lossy_autofix: false,
      default_base_paths: defaultBasePaths,
      auto_assign: false,
      validation_strict: true,
    },
  }

  mockProjects.push(newProject)
  return newProject
}

export async function getProjectSettings(projectId: string): Promise<ProjectSettings | null> {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const project = mockProjects.find((p) => p.id === projectId)
  return project?.settings || null
}

export async function updateProjectSettings(projectId: string, settings: Partial<ProjectSettings>): Promise<ProjectSettings> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  const project = mockProjects.find((p) => p.id === projectId)
  if (!project) {
    throw new Error("Project not found")
  }

  if (!project.settings) {
    project.settings = {
      default_rule_pack_by_type: defaultRulePacks,
      naming_conventions: defaultNamingConventions,
      allow_lossy_autofix: false,
      default_base_paths: defaultBasePaths,
      auto_assign: false,
      validation_strict: true,
    }
  }

  project.settings = { ...project.settings, ...settings }
  return project.settings
}
