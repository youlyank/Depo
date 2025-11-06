import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflow = await db.workflow.findUnique({
      where: { id: params.id },
      include: {
        nodes: true,
        edges: true,
        executions: {
          orderBy: {
            startedAt: 'desc'
          },
          take: 10
        }
      }
    })

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    // Transform database response to match frontend format
    const transformedWorkflow = {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      prompt: workflow.prompt,
      isActive: workflow.isActive,
      createdAt: workflow.createdAt,
      updatedAt: workflow.updatedAt,
      nodes: workflow.nodes.map(node => ({
        id: node.nodeId,
        type: 'default',
        position: node.position as { x: number; y: number },
        data: {
          label: node.title,
          type: node.type,
          description: node.description,
          config: node.config
        },
        style: getNodeStyle(node.type)
      })),
      edges: workflow.edges.map(edge => ({
        id: edge.edgeId,
        source: edge.sourceId,
        target: edge.targetId,
        sourceHandle: edge.sourceHandle,
        targetHandle: edge.targetHandle
      })),
      executions: workflow.executions
    }

    return NextResponse.json(transformedWorkflow)
  } catch (error) {
    console.error('Error fetching workflow:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workflow' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { name, description, isActive, nodes, edges } = await request.json()

    // Update workflow basic info
    const updatedWorkflow = await db.workflow.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive })
      }
    })

    // If nodes are provided, update them
    if (nodes) {
      // Delete existing nodes
      await db.node.deleteMany({
        where: { workflowId: params.id }
      })

      // Create new nodes
      await db.node.createMany({
        data: nodes.map((node: any) => ({
          workflowId: params.id,
          nodeId: node.id,
          type: node.data.type,
          title: node.data.label,
          description: node.data.description,
          config: node.data.config || {},
          position: node.position
        }))
      })
    }

    // If edges are provided, update them
    if (edges) {
      // Delete existing edges
      await db.edge.deleteMany({
        where: { workflowId: params.id }
      })

      // Create new edges
      await db.edge.createMany({
        data: edges.map((edge: any) => ({
          workflowId: params.id,
          edgeId: edge.id,
          sourceId: edge.source,
          targetId: edge.target,
          sourceHandle: edge.sourceHandle,
          targetHandle: edge.targetHandle
        }))
      })
    }

    return NextResponse.json(updatedWorkflow)
  } catch (error) {
    console.error('Error updating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to update workflow' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.workflow.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting workflow:', error)
    return NextResponse.json(
      { error: 'Failed to delete workflow' },
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