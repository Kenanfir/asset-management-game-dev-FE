import type { UploadJob } from "@/lib/types"

export const mockUploadJobs: UploadJob[] = [
  {
    id: "1",
    project_id: "1",
    status: "done",
    created_at: "2024-01-15T08:30:00Z",
    updated_at: "2024-01-15T08:35:00Z",
    files: ["hero_sprite_v2.png", "hero_walk_01.png", "hero_walk_02.png"],
    fixes_applied: [
      {
        conversion: "jpg → png",
        tool: "ImageMagick",
        lossy: false,
      },
      {
        conversion: "resize 1024x1024 → 512x512",
        tool: "ImageMagick",
        lossy: false,
      },
    ],
  },
  {
    id: "2",
    project_id: "1",
    status: "converting",
    created_at: "2024-01-15T10:15:00Z",
    updated_at: "2024-01-15T10:18:00Z",
    files: ["background_music_new.wav"],
    fixes_applied: [
      {
        conversion: "mp3 → wav",
        tool: "FFmpeg",
        lossy: true,
      },
    ],
  },
  {
    id: "3",
    project_id: "1",
    status: "validating",
    created_at: "2024-01-15T10:45:00Z",
    updated_at: "2024-01-15T10:46:00Z",
    files: ["enemy_texture.tga"],
  },
  {
    id: "4",
    project_id: "1",
    status: "failed",
    created_at: "2024-01-15T09:20:00Z",
    updated_at: "2024-01-15T09:25:00Z",
    files: ["corrupted_model.fbx"],
    error_message: "File format validation failed: corrupted FBX header",
  },
  {
    id: "5",
    project_id: "1",
    status: "opened_pr",
    created_at: "2024-01-15T07:00:00Z",
    updated_at: "2024-01-15T07:10:00Z",
    files: ["coin_animation_v3.png"],
    fixes_applied: [
      {
        conversion: "gif → png sequence",
        tool: "ImageMagick",
        lossy: false,
      },
    ],
  },
]

export async function listUploadJobs(projectId: string): Promise<UploadJob[]> {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockUploadJobs.filter((job) => job.project_id === projectId)
}

export async function createUploadJob(projectId: string, files: string[]): Promise<UploadJob> {
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const newJob: UploadJob = {
    id: String(mockUploadJobs.length + 1),
    project_id: projectId,
    status: "queued",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    files,
  }

  mockUploadJobs.push(newJob)

  // Simulate status progression
  setTimeout(() => {
    newJob.status = "validating"
    newJob.updated_at = new Date().toISOString()
  }, 2000)

  setTimeout(() => {
    newJob.status = "converting"
    newJob.updated_at = new Date().toISOString()
    newJob.fixes_applied = [
      {
        conversion: "auto-optimization",
        tool: "AssetTrackr",
        lossy: false,
      },
    ]
  }, 4000)

  setTimeout(() => {
    newJob.status = "opened_pr"
    newJob.updated_at = new Date().toISOString()
  }, 6000)

  setTimeout(() => {
    newJob.status = "done"
    newJob.updated_at = new Date().toISOString()
  }, 8000)

  return newJob
}
