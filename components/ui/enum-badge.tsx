import { Badge } from "@/components/ui/badge"
import type { AssetType } from "@/lib/types"
import { cn } from "@/lib/utils"

interface EnumBadgeProps {
  type: AssetType
  className?: string
}

const typeConfig = {
  sprite_static: {
    label: "Sprite Static",
    className: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  },
  sprite_animation: {
    label: "Sprite Animation",
    className: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  },
  texture: {
    label: "Texture",
    className: "bg-green-500/20 text-green-300 border-green-500/30",
  },
  audio_music: {
    label: "Audio Music",
    className: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  },
  audio_sfx: {
    label: "Audio SFX",
    className: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  },
  model_3d: {
    label: "3D Model",
    className: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  },
  animation_3d: {
    label: "3D Animation",
    className: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
}

export function EnumBadge({ type, className }: EnumBadgeProps) {
  const config = typeConfig[type]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
