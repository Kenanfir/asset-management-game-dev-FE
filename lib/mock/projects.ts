import type { Project } from "@/lib/types"

export const mockProjects: Project[] = [
  {
    id: "1",
    name: "Pixel Adventure",
    repo_url: "https://github.com/gamedev/pixel-adventure",
    last_sync: "2024-01-15T10:30:00Z",
    default_branch: "main",
    description: "A retro-style platformer game with pixel art assets",
  },
  {
    id: "2",
    name: "Space Odyssey",
    repo_url: "https://github.com/gamedev/space-odyssey",
    last_sync: "2024-01-14T16:45:00Z",
    default_branch: "develop",
    description: "3D space exploration game with procedural generation",
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
