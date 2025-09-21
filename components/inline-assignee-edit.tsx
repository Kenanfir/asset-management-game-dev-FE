"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { Check, X, Edit2, User } from 'lucide-react'
import { getUserById } from '@/lib/mock/users'
import type { Status } from '@/lib/types'

interface InlineAssigneeEditProps {
    assigneeId?: string
    onSave: (assigneeId: string | null) => void
    className?: string
}

const assigneeOptions = [
    { value: '', label: 'Unassigned' },
    { value: 'user1', label: 'Alex Chen' },
    { value: 'user2', label: 'Sarah Kim' },
]

export function InlineAssigneeEdit({
    assigneeId,
    onSave,
    className = ""
}: InlineAssigneeEditProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [editValue, setEditValue] = useState(assigneeId || '')
    const selectRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
        if (isEditing && selectRef.current) {
            selectRef.current.click()
        }
    }, [isEditing])

    useEffect(() => {
        setEditValue(assigneeId || '')
    }, [assigneeId])

    const handleSave = () => {
        onSave(editValue || null)
        setIsEditing(false)
    }

    const handleCancel = () => {
        setEditValue(assigneeId || '')
        setIsEditing(false)
    }

    const getAssigneeName = (userId?: string) => {
        if (!userId) return "Unassigned"
        const user = getUserById(userId)
        return user ? user.name : `User ${userId}`
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
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="flex-1 text-sm">{getAssigneeName(assigneeId)}</span>
                <Edit2 className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
        )
    }

    return (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Select
                value={editValue}
                onValueChange={setEditValue}
            >
                <SelectTrigger ref={selectRef} className="h-8 w-40">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {assigneeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                                <User className="h-3 w-3" />
                                {option.label}
                            </div>
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
