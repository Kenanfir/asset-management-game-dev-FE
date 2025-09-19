import { NextRequest, NextResponse } from 'next/server'
import { listProjects, createProject } from '@/lib/mock/projects'

export async function GET() {
    try {
        const projects = await listProjects()
        return NextResponse.json(projects)
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch projects' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { repo_url } = await request.json()

        if (!repo_url) {
            return NextResponse.json(
                { error: 'Repository URL is required' },
                { status: 400 }
            )
        }

        const project = await createProject(repo_url)
        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to create project' },
            { status: 500 }
        )
    }
}
