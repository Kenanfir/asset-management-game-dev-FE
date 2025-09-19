import { NextRequest, NextResponse } from 'next/server'
import { listUploadJobs } from '@/lib/mock/upload-jobs'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const jobs = await listUploadJobs(params.id)
        return NextResponse.json(jobs)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch upload jobs' },
            { status: 500 }
        )
    }
}
