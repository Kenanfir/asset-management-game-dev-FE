"use client"

import { ReactNode } from "react"
import {
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface DialogScaffoldProps {
    title: string
    description: string
    children: ReactNode
    footer: ReactNode
    className?: string
}

export function DialogScaffold({
    title,
    description,
    children,
    footer,
    className = "max-w-screen-md",
}: DialogScaffoldProps) {
    return (
        <DialogContent className={`${className} p-0 max-h-[90vh]`}>
            <div className="flex flex-col h-full max-h-[90vh]">
                <DialogHeader className="flex-shrink-0 bg-background/80 backdrop-blur px-6 py-4 border-b">
                    <DialogTitle className="text-base font-medium">{title}</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        {description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto px-6 py-6 min-h-0">
                    {children}
                </div>

                <div className="flex-shrink-0 bg-background/95 backdrop-blur px-6 py-4 border-t supports-[backdrop-filter]:bg-background/75">
                    {footer}
                </div>
            </div>
        </DialogContent>
    )
}
