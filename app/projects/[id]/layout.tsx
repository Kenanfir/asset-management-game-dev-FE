import type React from "react"
import { Sidebar } from "@/components/sidebar"

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params

  return (
    <div className="flex">
      <aside className="hidden md:block border-r border-border/50 bg-card/30">
        <Sidebar projectId={id} />
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
