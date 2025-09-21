export type AssetType =
  | "sprite_static"
  | "sprite_animation"
  | "texture"
  | "ui_element"
  | "audio_music"
  | "audio_sfx"
  | "model_3d"
  | "rig"
  | "animation_3d"
  | "material"
  | "shader"
  | "vfx"
  | "doc"

export type Status = "needed" | "in_progress" | "review" | "done" | "needs_update" | "canceled"

export type Versioning = "folder" | "filename"

export type Severity = "info" | "warn" | "error"

export interface RuleFinding {
  rule_id: string
  severity: Severity
  expected: unknown
  actual: unknown
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
  file_type: string
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

export interface SubAsset {
  id: string
  key: string              // e.g., "hero_run", "hero_idle"
  type: AssetType
  required_format?: string // e.g., "png", "fbx", "wav"
  versioning: Versioning
  base_path: string        // per sub-asset target folder (editable)
  path_template?: string   // optional template e.g. "{base}/{key}/v{version}/"
  rules?: Record<string, unknown>
  current: { version: number; files: string[] }
  history: Array<{ version: number; files: string[]; notes?: string; findings?: RuleFinding[] }>
  status: Status
  assignee_user_id?: string
  description?: string
}

export interface AssetGroup {                // the "big scope card"
  id: string                                // e.g., "hero_character"
  key: string                               // unique human-readable
  title: string                             // "Hero Character"
  description?: string
  base_path: string                         // e.g., "Assets/Characters/Hero"
  children: SubAsset[]                      // sub-assets listed above
  tags?: string[]
}

export interface NamingRule {
  id: string                                // "sprite_sequence", "music_track"
  pattern: string                           // e.g., "frame_{index:000}.png"
  description?: string
  example?: string                          // "frame_000.png"
}

export interface Project {
  id: string
  name: string
  repo_url: string
  last_sync: string
  default_branch: string
  description?: string
  settings?: ProjectSettings
}

export interface ProjectSettings {
  default_rule_pack_by_type: Partial<Record<AssetType, { allowed_formats: string[]; rules: Record<string, unknown> }>>
  naming_conventions: NamingRule[]          // reusable naming templates
  allow_lossy_autofix: boolean              // project policy
  default_base_paths?: Partial<Record<AssetType, string>>   // type → default base path (e.g., audio_music:"Assets/Sound", sprite_static:"Assets/Art")
  auto_assign?: boolean
  validation_strict?: boolean
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

export interface SequenceMapping {
  source_file: string
  target_path: string
  detected_index?: number
  manual_index?: number
}

export interface UploadTarget {
  type: 'asset_group' | 'sub_asset'
  id: string
  name: string
  asset_type?: AssetType
  supports_sequence?: boolean
}

export interface UploadJobV2 {
  id: string
  project_id: string
  target: UploadTarget
  files: File[]
  mode: 'single' | 'sequence'
  sequence_mapping?: SequenceMapping[]
  status: UploadJobStatus
  created_at: string
  updated_at: string
  progress: number
  results?: ValidationResult[]
}
