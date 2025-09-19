import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Press_Start_2P } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { queryClient } from "@/lib/query-client"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
})

export const metadata: Metadata = {
  title: "AssetTrackr - Game Asset Management",
  description: "Plan, validate, and ship game assets—versioned with your repo.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`font-sans ${inter.variable} ${pressStart2P.variable} antialiased`}>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<div>Loading...</div>}>
            <div className="min-h-screen bg-background relative">
              <div className="fixed inset-0 opacity-20 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.1)_1px,transparent_1px)] bg-[size:20px_20px] animate-pulse" />
              </div>
              <div className="relative z-10">{children}</div>
            </div>
          </Suspense>
          <Analytics />
        </QueryClientProvider>
      </body>
    </html>
  )
}
