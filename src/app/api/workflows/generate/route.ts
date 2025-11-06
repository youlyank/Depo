import { NextRequest, NextResponse } from 'next/server'
import { workflowGenerator } from '@/lib/workflow-generator'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json()

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required and must be a string' },
        { status: 400 }
      )
    }

    // Generate workflow using AI
    const generatedWorkflow = await workflowGenerator.generateWorkflow(prompt)

    // Create workflow in database
    const workflow = await db.workflow.create({
      data: {
        name: generatedWorkflow.name,
        description: generatedWorkflow.description,
        prompt,
        isActive: true,
        nodes: {
          create: generatedWorkflow.nodes.map(node => ({
            nodeId: node.id,
            type: node.type,
            title: node.title,
            description: node.description,
            config: node.config || {},
            position: node.position
          }))
        },
        edges: {
          create: generatedWorkflow.edges.map(edge => ({
            edgeId: edge.id,
            sourceId: edge.source,
            targetId: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle
          }))
        }
      },
      include: {
        nodes: true,
        edges: true
      }
    })

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
    }

    return NextResponse.json(transformedWorkflow)
  } catch (error) {
    console.error('Error generating workflow:', error)
    return NextResponse.json(
      { error: 'Failed to generate workflow' },
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