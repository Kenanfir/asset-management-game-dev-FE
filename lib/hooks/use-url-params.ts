"use client"

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'

export function useUrlParams() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const updateParams = useCallback(
        (updates: Record<string, string | string[] | null | undefined>) => {
            const params = new URLSearchParams(searchParams.toString())

            Object.entries(updates).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    params.delete(key)
                } else if (Array.isArray(value)) {
                    params.delete(key)
                    value.forEach(v => params.append(key, v))
                } else {
                    params.set(key, value)
                }
            })

            const newUrl = `${pathname}?${params.toString()}`
            router.push(newUrl, { scroll: false })
        },
        [router, pathname, searchParams]
    )

    const getParam = useCallback(
        (key: string, defaultValue?: string) => {
            return searchParams.get(key) || defaultValue
        },
        [searchParams]
    )

    const getArrayParam = useCallback(
        (key: string, defaultValue: string[] = []) => {
            const values = searchParams.getAll(key)
            return values.length > 0 ? values : defaultValue
        },
        [searchParams]
    )

    const clearParams = useCallback(
        (keys?: string[]) => {
            const params = new URLSearchParams(searchParams.toString())

            if (keys) {
                keys.forEach(key => params.delete(key))
            } else {
                // Clear all params
                const newUrl = pathname
                router.push(newUrl, { scroll: false })
                return
            }

            const newUrl = `${pathname}?${params.toString()}`
            router.push(newUrl, { scroll: false })
        },
        [router, pathname, searchParams]
    )

    return {
        updateParams,
        getParam,
        getArrayParam,
        clearParams,
        searchParams,
    }
}
