import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const workflows = await db.workflow.findMany({
      include: {
        nodes: true,
        edges: true,
        executions: {
          orderBy: {
            startedAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transform database response to match frontend format
    const transformedWorkflows = workflows.map(workflow => ({
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      prompt: workflow.prompt,
      isActive: workflow.isActive,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      lastRun: workflow.executions[0]?.startedAt?.toISOString() || null,
      status: workflow.executions[0]?.status || null,
      nodes: workflow.nodes.map(node => ({
        id: node.nodeId,
        type: 'default',
        position: node.position as { x: number; y: number },
        data: {
          label: node.title,
          type: node.type,
          description: node.description
        },
        style: getNodeStyle(node.type)
      })),
      edges: workflow.edges.map(edge => ({
        id: edge.edgeId,
        source: edge.sourceId,
        target: edge.targetId,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      }))
    }))

    return NextResponse.json(transformedWorkflows)
  } catch (error) {
    console.error('Error fetching workflows:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflows' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, prompt, nodes, edges } = await request.json()

    if (!name || !prompt) {
      return NextResponse.json(
        { error: 'Name and prompt are required' },
        { status: 400 }
      )
    }

    const workflow = await db.workflow.create({
      data: {
        name,
        description,
        prompt,
        isActive: true,
        nodes: nodes ? {
          create: nodes.map((node: any) => ({
            nodeId: node.id,
            type: node.data.type,
            title: node.data.label,
            description: node.data.description,
            config: node.data.config || {},
            position: node.position
          }))
        } : undefined,
        edges: edges ? {
          create: edges.map((edge: any) => ({
            edgeId: edge.id,
            sourceId: edge.source,
            targetId: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle
          }))
        } : undefined
      },
      include: {
        nodes: true,
        edges: true
      }
    })

    return NextResponse.json(workflow)
  } catch (error) {
    console.error('Error creating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to create workflow' },
      { status: 500 }
    )
  }
}

function getNodeStyle(type: string) {
  const styles = {
    trigger: { backgroundColor: '#10b981', color: 'white' },
    action: { backgroundColor: '#3b82f6', color: 'white' },
    condition: { backgroundColor: '#eab308', color: 'white' },
    delay: { backgroundColor: '#8b5cf6', color: 'white' },
    webhook: { backgroundColor: '#ef4444', color: 'white' },
    email: { backgroundColor: '#06b6d4', color: 'white' },
    database: { backgroundColor: '#6366f1', color: 'white' }
  }
  
  return styles[type as keyof typeof styles] || { backgroundColor: '#6b7280', color: 'white' }
}