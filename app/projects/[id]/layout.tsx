"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, X, Search, Settings, LogOut, User, LayoutDashboard, Database, Upload, GitPullRequest } from "lucide-react"
import { useState, use, useEffect } from "react"
import Link from "next/link"
import { getCurrentUser } from "@/lib/mock/users"
import type { User as UserType } from "@/lib/types"
import { useUrlParams } from "@/lib/hooks/use-url-params"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const { id } = use(params)
  const { getParam, updateParams } = useUrlParams()
  const currentTab = getParam("tab", "overview")

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const userData = await getCurrentUser()
      setUser(userData)
    } catch (error) {
      console.error("Failed to load user:", error)
    }
  }

  const handleTabChange = (tab: string) => {
    updateParams({ tab })
  }

  return (
    <div className="flex h-full">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:block border-r border-border/50 bg-card/30 transition-all duration-300 overflow-hidden flex-shrink-0 ${isDesktopSidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
        {isDesktopSidebarCollapsed ? (
          <div className="flex flex-col h-full">
            {/* Just the expand button */}
            <div className="p-2 border-b border-border/50">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDesktopSidebarCollapsed(false)}
                className="h-8 w-8 p-0 w-full"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>

            {/* Navigation Icons */}
            <div className="flex-1 py-4">
              <div className="space-y-2 px-2">
                <Button
                  variant={currentTab === "overview" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-10 w-10 p-0"
                  title="Overview"
                  onClick={() => handleTabChange("overview")}
                >
                  <LayoutDashboard className="h-5 w-5" />
                </Button>
                <Button
                  variant={currentTab === "assets" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-10 w-10 p-0"
                  title="Assets"
                  onClick={() => handleTabChange("assets")}
                >
                  <Database className="h-5 w-5" />
                </Button>
                <Button
                  variant={currentTab === "uploads" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-10 w-10 p-0"
                  title="Uploads"
                  onClick={() => handleTabChange("uploads")}
                >
                  <Upload className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-10 w-10 p-0 opacity-50"
                  disabled
                  title="PRs (Coming Soon)"
                >
                  <GitPullRequest className="h-5 w-5" />
                </Button>
                <Button
                  variant={currentTab === "settings" ? "secondary" : "ghost"}
                  size="sm"
                  className="h-10 w-10 p-0"
                  title="Settings"
                  onClick={() => handleTabChange("settings")}
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <h2 className="pixel-heading text-primary mb-0">Project Navigation</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDesktopSidebarCollapsed(true)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              <Sidebar projectId={id} />
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-card/50 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-3 h-16 px-4">
          {/* Logo and Menu Button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="h-10 w-10 p-0"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
            <Link href="/projects" className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-emerald-400 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">F</span>
              </div>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search assets..." className="pl-10 bg-background/50 text-sm" />
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>
                        {user.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm">
                <Link href="/signin">Sign In</Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-card border-r border-border/50">
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between p-4 border-b border-border/50">
                <h2 className="pixel-heading text-primary mb-0">Project Navigation</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-auto p-4">
                <Sidebar projectId={id} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Header removed - now handled within sidebar */}

      {/* Main Content */}
      <main className="flex-1 overflow-auto min-h-0 pt-16 md:pt-0">
        {children}
      </main>
    </div>
  )
}
