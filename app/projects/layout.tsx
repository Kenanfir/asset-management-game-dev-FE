import type React from "react"
import { Navbar } from "@/components/navbar"

interface ProjectsLayoutProps {
  children: React.ReactNode
}

export default function ProjectsLayout({ children }: ProjectsLayoutProps) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}
