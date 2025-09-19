import type React from "react"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: { id: string }
}

export default function ProjectLayout({ children, params }: ProjectLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="flex">
        <aside className="hidden md:block border-r border-border/50 bg-card/30">
          <Sidebar projectId={params.id} />
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
