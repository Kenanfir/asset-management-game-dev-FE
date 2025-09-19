import type { Project, AssetType } from "@/lib/types"

const defaultRules: Record<AssetType, Record<string, any>> = {
  sprite_static: {
    max_width: 1024,
    max_height: 1024,
    min_width: 32,
    min_height: 32,
    power_of_two: false,
  },
  sprite_animation: {
    fps_min: 12,
    fps_max: 30,
    max_frames: 60,
    sequence_pattern_required: true,
  },
  texture: {
    power_of_two: true,
    max_size: 2048,
    min_size: 64,
  },
  audio_music: {
    sample_rate: 44100,
    channels: 2,
    bit_depth: 16,
    max_duration_seconds: 300,
  },
  audio_sfx: {
    sample_rate: 44100,
    channels: 1,
    max_duration_seconds: 10,
  },
  model_3d: {
    max_polycount: 10000,
    max_materials: 5,
    max_textures: 10,
  },
  animation_3d: {
    max_duration_seconds: 30,
    fps: 30,
  },
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
      default_rules: defaultRules,
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
      default_rules: defaultRules,
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
  }

  mockProjects.push(newProject)
  return newProject
}
