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
    className: "status-needed",
  },
  in_progress: {
    label: "In Progress",
    className: "status-in-progress",
  },
  review: {
    label: "Review",
    className: "status-review",
  },
  done: {
    label: "Done",
    className: "status-done",
  },
  needs_update: {
    label: "Needs Update",
    className: "status-needs-update",
  },
  canceled: {
    label: "Canceled",
    className: "status-canceled",
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
