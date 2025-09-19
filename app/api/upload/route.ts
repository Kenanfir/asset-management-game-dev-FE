import { NextRequest, NextResponse } from 'next/server'
import { createUploadJob } from '@/lib/mock/upload-jobs'

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData()
        const files = formData.getAll('files') as File[]
        const projectId = formData.get('projectId') as string

        if (!files.length || !projectId) {
            return NextResponse.json(
                { error: 'Files and project ID are required' },
                { status: 400 }
            )
        }

        const job = await createUploadJob(projectId, files.map(f => f.name))
        return NextResponse.json(job, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create upload job' },
            { status: 500 }
        )
    }
}
