"use client"

import { useState, useEffect, useRef } from 'react'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Check, X, Edit2 } from 'lucide-react'
import type { Status } from '@/lib/types'

interface InlineEditProps {
    value: string
    type: 'text' | 'select'
    options?: { value: string; label: string }[]
    onSave: (value: string) => void
    onCancel?: () => void
    className?: string
    placeholder?: string
}

export function InlineEdit({
    value,
    type,
    options = [],
    onSave,
    onCancel,
    className = "",
    placeholder = ""
}: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(value)
    const inputRef = useRef<HTMLInputElement>(null)
    const selectRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (isEditing) {
            if (type === 'text' && inputRef.current) {
                inputRef.current.focus()
                inputRef.current.select()
            } else if (type === 'select' && selectRef.current) {
                selectRef.current.click()
            }
        }
    }, [isEditing, type])

    useEffect(() => {
        setEditValue(value)
    }, [value])

    const handleSave = () => {
        onSave(editValue)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditValue(value)
        setIsEditing(false)
        onCancel?.()
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave()
        } else if (e.key === 'Escape') {
            handleCancel()
        }
    }

    if (!isEditing) {
        return (
            <div
                className={`flex items-center gap-2 group cursor-pointer hover:bg-muted/50 rounded px-2 py-1 ${className}`}
                onClick={(e) => {
                    e.stopPropagation()
                    setIsEditing(true)
                }}
            >
                <span className="flex-1">{value}</span>
                <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        )
    }

    if (type === 'select') {
        return (
            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <Select
                    value={editValue}
                    onValueChange={setEditValue}
                >
                    <SelectTrigger ref={selectRef} className="h-8">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation()
                    handleSave()
                }} className="h-6 w-6 p-0">
                    <Check className="h-3 w-3" />
                </Button>
                <Button size="sm" variant="ghost" onClick={(e) => {
                    e.stopPropagation()
                    handleCancel()
                }} className="h-6 w-6 p-0">
                    <X className="h-3 w-3" />
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Input
                ref={inputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                className="h-8"
                placeholder={placeholder}
            />
            <Button size="sm" variant="ghost" onClick={(e) => {
                e.stopPropagation()
                handleSave()
            }} className="h-6 w-6 p-0">
                <Check className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="ghost" onClick={(e) => {
                e.stopPropagation()
                handleCancel()
            }} className="h-6 w-6 p-0">
                <X className="h-3 w-3" />
            </Button>
        </div>
    )
}

interface InlineStatusEditProps {
    status: Status
    onSave: (status: Status) => void
    className?: string
}

const statusOptions: { value: Status; label: string }[] = [
    { value: 'needed', label: 'Needed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
    { value: 'needs_update', label: 'Needs Update' },
    { value: 'canceled', label: 'Canceled' },
]

export function InlineStatusEdit({ status, onSave, className = "" }: InlineStatusEditProps) {
    return (
        <InlineEdit
            value={status}
            type="select"
            options={statusOptions}
            onSave={onSave}
            className={className}
        />
    )
}
