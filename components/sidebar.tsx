"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Database, Upload, GitPullRequest, Settings } from "lucide-react"
import { useUrlParams } from "@/lib/hooks/use-url-params"
import { useCallback, KeyboardEvent } from "react"

interface SidebarProps {
  projectId: string
  className?: string
}

const sidebarItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    tab: "overview",
  },
  {
    title: "Assets",
    icon: Database,
    tab: "assets",
  },
  {
    title: "Uploads",
    icon: Upload,
    tab: "uploads",
  },
  {
    title: "PRs",
    icon: GitPullRequest,
    disabled: true,
    badge: "Soon",
  },
  {
    title: "Settings",
    icon: Settings,
    tab: "settings",
  },
]

export function Sidebar({ projectId, className }: SidebarProps) {
  const { getParam, updateParams } = useUrlParams()
  const currentTab = getParam("tab", "overview")

  const handleTabChange = useCallback(
    (tab: string) => {
      updateParams({ tab })
    },
    [updateParams]
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault()
        const currentIndex = sidebarItems.findIndex(item => item.tab === currentTab)
        const enabledItems = sidebarItems.filter(item => !item.disabled)
        const currentEnabledIndex = enabledItems.findIndex(item => item.tab === currentTab)

        let nextIndex: number
        if (e.key === "ArrowDown") {
          nextIndex = (currentEnabledIndex + 1) % enabledItems.length
        } else {
          nextIndex = currentEnabledIndex === 0 ? enabledItems.length - 1 : currentEnabledIndex - 1
        }

        const nextItem = enabledItems[nextIndex]
        if (nextItem?.tab) {
          handleTabChange(nextItem.tab)
        }
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        const target = e.target as HTMLElement
        const button = target.closest('button')
        if (button && !button.disabled) {
          const tab = button.dataset.tab
          if (tab) {
            handleTabChange(tab)
          }
        }
      }
    },
    [currentTab, handleTabChange]
  )

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div
            className="space-y-1"
            role="menu"
            onKeyDown={handleKeyDown}
            tabIndex={0}
          >
            {sidebarItems.map((item) => {
              const isActive = currentTab === item.tab

              return (
                <Button
                  key={item.title}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start transition-colors",
                    item.disabled && "opacity-50 cursor-not-allowed",
                    isActive && "bg-primary/10 text-primary border-l-2 border-primary"
                  )}
                  onClick={() => !item.disabled && item.tab && handleTabChange(item.tab)}
                  disabled={item.disabled}
                  data-tab={item.tab}
                  role="menuitem"
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                  {item.badge && (
                    <Badge variant="outline" className="ml-auto text-xs">
                      {item.badge}
                    </Badge>
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
