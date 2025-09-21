import type React from "react"
import { Navbar } from "@/components/navbar"

interface ProjectsLayoutProps {
  children: React.ReactNode
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
