import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { slackService } from '@/lib/slack'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Get workflow details
    const workflow = await db.workflow.findUnique({
      where: { id: params.id },
      include: {
        nodes: true,
        edges: true
      }
    })

    if (!workflow) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      )
    }

    if (!workflow.isActive) {
      return NextResponse.json(
        { error: 'Workflow is not active' },
        { status: 400 }
      )
    }

    // Create execution record
    const execution = await db.execution.create({
      data: {
        workflowId: params.id,
        status: 'running',
        input: {}
      }
    })

    // Start workflow execution in background
    executeWorkflow(workflow, execution.id).catch(error => {
      console.error('Workflow execution failed:', error)
      updateExecutionStatus(execution.id, 'failed', error.message)
    })

    return NextResponse.json({
      executionId: execution.id,
      status: 'running',
      message: 'Workflow execution started'
    })
  } catch (error) {
    console.error('Error starting workflow execution:', error)
    return NextResponse.json(
      { error: 'Failed to start workflow execution' },
      { status: 500 }
    )
  }
}

async function executeWorkflow(workflow: any, executionId: string) {
  try {
    // Get the trigger node (first node with type 'trigger')
    const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger')
    if (!triggerNode) {
      throw new Error('No trigger node found in workflow')
    }

    // Build execution graph from edges
    const executionGraph = buildExecutionGraph(workflow.nodes, workflow.edges)
    
    // Execute workflow starting from trigger
    const result = await executeNode(triggerNode, executionGraph, {})
    
    // Update execution with success
    await updateExecutionStatus(executionId, 'completed', null, result)
  } catch (error) {
    await updateExecutionStatus(executionId, 'failed', error instanceof Error ? error.message : 'Unknown error')
  }
}

function buildExecutionGraph(nodes: any[], edges: any[]) {
  const graph: Record<string, string[]> = {}
  
  // Initialize graph with all nodes
  nodes.forEach(node => {
    graph[node.nodeId] = []
  })
  
  // Add edges to graph
  edges.forEach(edge => {
    if (graph[edge.sourceId]) {
      graph[edge.sourceId].push(edge.targetId)
    }
  })
  
  return graph
}

async function executeNode(node: any, graph: Record<string, string[]>, context: any): Promise<any> {
  console.log(`Executing node: ${node.title} (${node.type})`)
  
  // Simulate different node types execution
  let result: any = {}
  
  switch (node.type) {
    case 'trigger':
      // Trigger nodes start the workflow
      result = { triggered: true, timestamp: new Date().toISOString() }
      break
      
    case 'action':
      // Action nodes perform some operation
      result = await executeAction(node, context)
      break
      
    case 'condition':
      // Condition nodes evaluate logic
      result = await executeCondition(node, context)
      break
      
    case 'delay':
      // Delay nodes wait for specified time
      result = await executeDelay(node, context)
      break
      
    case 'email':
      // Email nodes send emails
      result = await executeEmail(node, context)
      break
      
    case 'database':
      // Database nodes perform database operations
      result = await executeDatabase(node, context)
      break
      
    case 'slack':
      // Slack nodes send messages to Slack channels
      result = await executeSlack(node, context)
      break
      
    case 'webhook':
      // Webhook nodes make HTTP requests
      result = await executeWebhook(node, context)
      break
      
    default:
      result = { executed: true, type: node.type }
  }
  
  // Execute child nodes
  const childNodes = graph[node.nodeId] || []
  const childResults = []
  
  for (const childNodeId of childNodes) {
    const childNode = getNodeById(childNodeId, Object.values(graph).length > 0 ? [] : [])
    if (childNode) {
      const childResult = await executeNode(childNode, graph, { ...context, ...result })
      childResults.push(childResult)
    }
  }
  
  return {
    ...result,
    children: childResults
  }
}

async function executeAction(node: any, context: any): Promise<any> {
  // Simulate action execution
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { 
    action: node.title,
    executed: true,
    timestamp: new Date().toISOString()
  }
}

async function executeCondition(node: any, context: any): Promise<any> {
  // Simulate condition evaluation
  await new Promise(resolve => setTimeout(resolve, 500))
  return { 
    condition: node.title,
    result: Math.random() > 0.5, // Random true/false for demo
    timestamp: new Date().toISOString()
  }
}

async function executeDelay(node: any, context: any): Promise<any> {
  // Simulate delay (using config or default 2 seconds)
  const delayMs = node.config?.delayMs || 2000
  await new Promise(resolve => setTimeout(resolve, delayMs))
  return { 
    delay: node.title,
    delayed: true,
    duration: delayMs,
    timestamp: new Date().toISOString()
  }
}

async function executeEmail(node: any, context: any): Promise<any> {
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 1500))
  return { 
    email: node.title,
    sent: true,
    to: node.config?.to || 'unknown@example.com',
    timestamp: new Date().toISOString()
  }
}

async function executeDatabase(node: any, context: any): Promise<any> {
  // Simulate database operation
  await new Promise(resolve => setTimeout(resolve, 800))
  return { 
    database: node.title,
    operation: 'SELECT',
    records: Math.floor(Math.random() * 100), // Random number of records
    timestamp: new Date().toISOString()
  }
}

async function executeSlack(node: any, context: any): Promise<any> {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  // Extract Slack configuration
  const channel = node.config?.channel || '#general'
  const message = node.config?.message || `Workflow executed: ${node.title}`
  
  // Try to send real Slack message if configured
  if (slackService.isConfigured()) {
    try {
      const result = await slackService.sendMessage({
        channel,
        text: message,
        blocks: node.config?.blocks
      })
      
      return { 
        slack: node.title,
        sent: true,
        channel,
        message,
        realMessage: result.success,
        timestamp: result.ts || new Date().toISOString()
      }
    } catch (error) {
      console.error('Slack send failed:', error)
      return { 
        slack: node.title,
        sent: false,
        channel,
        message,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      }
    }
  }
  
  // Fallback to simulation if Slack not configured
  return { 
    slack: node.title,
    sent: true,
    channel,
    message,
    simulated: true,
    timestamp: new Date().toISOString()
  }
}

async function executeWebhook(node: any, context: any): Promise<any> {
  // Simulate webhook call
  await new Promise(resolve => setTimeout(resolve, 1200))
  return { 
    webhook: node.title,
    url: node.config?.url || 'https://example.com/webhook',
    status: 200,
    timestamp: new Date().toISOString()
  }
}

function getNodeById(nodeId: string, nodes: any[]): any {
  return nodes.find(node => node.nodeId === nodeId)
}

async function updateExecutionStatus(
  executionId: string, 
  status: string, 
  error?: string | null, 
  output?: any
) {
  await db.execution.update({
    where: { id: executionId },
    data: {
      status,
      error,
      output,
      completedAt: status !== 'running' ? new Date() : undefined
    }
  })
}