"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Database, Upload, GitPullRequest, Settings } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  projectId: string
  className?: string
}

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/projects/[id]",
    icon: LayoutDashboard,
    tab: "overview",
  },
  {
    title: "Assets",
    href: "/projects/[id]",
    icon: Database,
    tab: "assets",
  },
  {
    title: "Uploads",
    href: "/projects/[id]",
    icon: Upload,
    tab: "uploads",
  },
  {
    title: "PRs",
    href: "#",
    icon: GitPullRequest,
    disabled: true,
    badge: "Soon",
  },
  {
    title: "Settings",
    href: "#",
    icon: Settings,
    disabled: true,
  },
]

export function Sidebar({ projectId, className }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="pixel-heading text-primary mb-4">Project Navigation</h2>
          <div className="space-y-1">
            {sidebarItems.map((item) => {
              const href = item.href.replace("[id]", projectId)
              const isActive = pathname === href || (item.tab && pathname.includes(`tab=${item.tab}`))

              return (
                <Button
                  key={item.title}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", item.disabled && "opacity-50 cursor-not-allowed")}
                  asChild={!item.disabled}
                  disabled={item.disabled}
                >
                  {item.disabled ? (
                    <div className="flex items-center">
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <Link href={href}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {item.title}
                      {item.badge && (
                        <Badge variant="outline" className="ml-auto text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  )}
                </Button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
