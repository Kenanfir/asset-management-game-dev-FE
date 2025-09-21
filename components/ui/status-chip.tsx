import { Badge } from "@/components/ui/badge"
import type { Status } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StatusChipProps {
  status: Status
  className?: string
}

const statusConfig = {
  needed: {
    label: "Needed",
    className: "status-chip-needed",
  },
  in_progress: {
    label: "In Progress",
    className: "status-chip-in-progress",
  },
  review: {
    label: "Review",
    className: "status-chip-review",
  },
  done: {
    label: "Done",
    className: "status-chip-done",
  },
  needs_update: {
    label: "Needs Update",
    className: "status-chip-needs-update",
  },
  canceled: {
    label: "Canceled",
    className: "status-chip-canceled",
  },
}

export function StatusChip({ status, className }: StatusChipProps) {
  const config = statusConfig[status]

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  )
}
