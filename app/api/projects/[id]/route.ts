import { NextRequest, NextResponse } from 'next/server'
import { getProject } from '@/lib/mock/projects'

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const project = await getProject(params.id)

        if (!project) {
            return NextResponse.json(
                { error: 'Project not found' },
                { status: 404 }
            )
        }

        return NextResponse.json(project)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch project' },
            { status: 500 }
        )
    }
}
