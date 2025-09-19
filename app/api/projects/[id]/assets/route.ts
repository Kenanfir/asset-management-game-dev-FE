import { NextRequest, NextResponse } from 'next/server'
import { listAssets } from '@/lib/mock/assets'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const search = searchParams.get('search') || undefined
        const status = searchParams.get('status')?.split(',') || []
        const type = searchParams.get('type')?.split(',') || []

        const filters = {
            search,
            status: status.filter(Boolean),
            type: type.filter(Boolean),
        }

        const assets = await listAssets(id, filters)
        return NextResponse.json(assets)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch assets' },
            { status: 500 }
        )
    }
}
