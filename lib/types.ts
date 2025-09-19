export type AssetType =
  | "sprite_static"
  | "sprite_animation"
  | "texture"
  | "audio_music"
  | "audio_sfx"
  | "model_3d"
  | "animation_3d"

export type Status = "needed" | "in_progress" | "review" | "done" | "needs_update"

export type Versioning = "folder" | "filename"

export type Severity = "info" | "warn" | "error"

export interface RuleFinding {
  rule_id: string
  severity: Severity
  expected: string
  actual: string
  message: string
  evidence_paths?: string[]
}

export interface AssetVersion {
  version: string
  files: string[]
  notes?: string
  findings?: RuleFinding[]
}

export interface Asset {
  id: string
  key: string
  type: AssetType
  base_path: string
  versioning: Versioning
  current: {
    version: string
    files: string[]
  }
  history: AssetVersion[]
  status: Status
  assignee_user_id?: string
  description?: string
  rules?: any
}

export interface Project {
  id: string
  name: string
  repo_url: string
  last_sync: string
  default_branch: string
  description?: string
}

export interface User {
  id: string
  name: string
  email: string
  avatar_url: string
}

export type UploadJobStatus = "queued" | "validating" | "converting" | "opened_pr" | "done" | "failed"

export interface UploadJob {
  id: string
  project_id: string
  status: UploadJobStatus
  created_at: string
  updated_at: string
  files: string[]
  fixes_applied?: Array<{
    conversion: string
    tool: string
    lossy?: boolean
  }>
  error_message?: string
}

export interface RulePack {
  asset_type: AssetType
  formats: string[]
  rules: Record<string, any>
}

export interface AssetUpdateRequest {
  id: string
  asset_id: string
  created_by: string
  created_at: string
  status: "pending" | "addressed" | "withdrawn"
  reasons: AssetUpdateReason[]
  notes?: string
}

export interface AssetUpdateReason {
  id: string
  update_request_id: string
  rule_id: string
  severity: Severity
  message: string
  expected: string
  actual: string
  suggested_fix?: string
  evidence_paths: string[]
  from_version: string
  to_version?: string
}

export interface ValidationFinding {
  id: string
  asset_id: string
  version: string
  rule_id: string
  severity: Severity
  message: string
  expected: string
  actual: string
  evidence_paths: string[]
}

export interface ConversionMap {
  [key: string]: {
    [targetFormat: string]: {
      tool: string
      lossy: boolean
      notes?: string
    }
  }
}

export interface FixApplied {
  conversion: string
  tool: string
  lossy: boolean
  evidence_paths?: string[]
}

export interface ValidationResult {
  asset_key: string
  version: string
  findings: ValidationFinding[]
  fixes_applied?: FixApplied[]
}

export interface BulkUploadJob {
  id: string
  project_id: string
  files: File[]
  status: UploadJobStatus
  created_at: string
  updated_at: string
  progress: number
  results?: ValidationResult[]
}
