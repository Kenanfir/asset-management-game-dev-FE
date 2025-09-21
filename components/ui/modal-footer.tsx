"use client"

import React from "react"
import { Button } from "@/components/ui/button"

interface ModalFooterProps {
    onCancel: () => void
    onSubmit: (e: React.FormEvent) => void
    submitLabel: string
    isSubmitting?: boolean
    isDisabled?: boolean
    cancelLabel?: string
}

export function ModalFooter({
    onCancel,
    onSubmit,
    submitLabel,
    isSubmitting = false,
    isDisabled = false,
    cancelLabel = "Cancel"
}: ModalFooterProps) {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-2">
            <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto"
            >
                {cancelLabel}
            </Button>
            <Button
                type="submit"
                onClick={onSubmit}
                disabled={isSubmitting || isDisabled}
                className="w-full sm:w-auto"
            >
                {isSubmitting ? "Creating..." : submitLabel}
            </Button>
        </div>
    )
}
