import * as cron from 'node-cron'
import { db } from '@/lib/db'

export interface ScheduledWorkflow {
  id: string
  workflowId: string
  schedule: string
  task: cron.ScheduledTask
}

class WorkflowScheduler {
  private scheduledWorkflows: Map<string, ScheduledWorkflow> = new Map()

  async initialize() {
    console.log('Initializing workflow scheduler...')
    
    // Load all active scheduled workflows from database
    const workflows = await db.workflow.findMany({
      where: {
        isActive: true,
        schedule: {
          not: null
        }
      }
    })

    for (const workflow of workflows) {
      if (workflow.schedule) {
        this.scheduleWorkflow(workflow.id, workflow.schedule)
      }
    }

    console.log(`Loaded ${workflows.length} scheduled workflows`)
  }

  scheduleWorkflow(workflowId: string, schedule: string) {
    // Validate cron expression
    if (!cron.validate(schedule)) {
      throw new Error(`Invalid cron expression: ${schedule}`)
    }

    // Remove existing schedule if any
    this.unscheduleWorkflow(workflowId)

    // Create new scheduled task
    const task = cron.schedule(schedule, async () => {
      await this.executeScheduledWorkflow(workflowId)
    }, {
      scheduled: false
    })

    // Store the scheduled workflow
    this.scheduledWorkflows.set(workflowId, {
      id: workflowId,
      workflowId,
      schedule,
      task
    })

    // Start the task
    task.start()
    
    console.log(`Scheduled workflow ${workflowId} with cron: ${schedule}`)
  }

  unscheduleWorkflow(workflowId: string) {
    const scheduled = this.scheduledWorkflows.get(workflowId)
    if (scheduled) {
      scheduled.task.stop()
      this.scheduledWorkflows.delete(workflowId)
      console.log(`Unscheduled workflow ${workflowId}`)
    }
  }

  updateWorkflowSchedule(workflowId: string, schedule: string | null) {
    if (schedule) {
      this.scheduleWorkflow(workflowId, schedule)
    } else {
      this.unscheduleWorkflow(workflowId)
    }
  }

  private async executeScheduledWorkflow(workflowId: string) {
    try {
      console.log(`Executing scheduled workflow: ${workflowId}`)
      
      // Get workflow details
      const workflow = await db.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
          edges: true
        }
      })

      if (!workflow || !workflow.isActive) {
        console.log(`Workflow ${workflowId} not found or inactive, skipping execution`)
        return
      }

      // Create execution record
      const execution = await db.execution.create({
        data: {
          workflowId,
          status: 'running',
          input: { triggeredBy: 'scheduler' }
        }
      })

      // Execute workflow (reuse existing execution logic)
      await this.runWorkflow(workflow, execution.id)
      
    } catch (error) {
      console.error(`Error executing scheduled workflow ${workflowId}:`, error)
    }
  }

  private async runWorkflow(workflow: any, executionId: string) {
    try {
      // Get the trigger node
      const triggerNode = workflow.nodes.find((node: any) => node.type === 'trigger')
      if (!triggerNode) {
        throw new Error('No trigger node found in workflow')
      }

      // Build execution graph
      const executionGraph = this.buildExecutionGraph(workflow.nodes, workflow.edges)
      
      // Execute workflow
      const result = await this.executeNode(triggerNode, executionGraph, {})
      
      // Update execution with success
      await db.execution.update({
        where: { id: executionId },
        data: {
          status: 'completed',
          output: result,
          completedAt: new Date()
        }
      })

      console.log(`Scheduled workflow execution completed: ${executionId}`)
    } catch (error) {
      await db.execution.update({
        where: { id: executionId },
        data: {
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          completedAt: new Date()
        }
      })
    }
  }

  private buildExecutionGraph(nodes: any[], edges: any[]) {
    const graph: Record<string, string[]> = {}
    
    nodes.forEach(node => {
      graph[node.nodeId] = []
    })
    
    edges.forEach(edge => {
      if (graph[edge.sourceId]) {
        graph[edge.sourceId].push(edge.targetId)
      }
    })
    
    return graph
  }

  private async executeNode(node: any, graph: Record<string, string[]>, context: any): Promise<any> {
    console.log(`Executing node: ${node.title} (${node.type})`)
    
    let result: any = {}
    
    switch (node.type) {
      case 'trigger':
        result = { triggered: true, timestamp: new Date().toISOString() }
        break
      case 'action':
        result = await this.executeAction(node, context)
        break
      case 'condition':
        result = await this.executeCondition(node, context)
        break
      case 'delay':
        result = await this.executeDelay(node, context)
        break
      case 'email':
        result = await this.executeEmail(node, context)
        break
      case 'database':
        result = await this.executeDatabase(node, context)
        break
      case 'webhook':
        result = await this.executeWebhook(node, context)
        break
      default:
        result = { executed: true, type: node.type }
    }
    
    // Execute child nodes
    const childNodes = graph[node.nodeId] || []
    const childResults = []
    
    for (const childNodeId of childNodes) {
      const childNode = this.getNodeById(childNodeId, Object.values(graph).length > 0 ? [] : [])
      if (childNode) {
        const childResult = await this.executeNode(childNode, graph, { ...context, ...result })
        childResults.push(childResult)
      }
    }
    
    return {
      ...result,
      children: childResults
    }
  }

  private async executeAction(node: any, context: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { 
      action: node.title,
      executed: true,
      timestamp: new Date().toISOString()
    }
  }

  private async executeCondition(node: any, context: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 500))
    return { 
      condition: node.title,
      result: Math.random() > 0.5,
      timestamp: new Date().toISOString()
    }
  }

  private async executeDelay(node: any, context: any): Promise<any> {
    const delayMs = node.config?.delayMs || 2000
    await new Promise(resolve => setTimeout(resolve, delayMs))
    return { 
      delay: node.title,
      delayed: true,
      duration: delayMs,
      timestamp: new Date().toISOString()
    }
  }

  private async executeEmail(node: any, context: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1500))
    return { 
      email: node.title,
      sent: true,
      to: node.config?.to || 'unknown@example.com',
      timestamp: new Date().toISOString()
    }
  }

  private async executeDatabase(node: any, context: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 800))
    return { 
      database: node.title,
      operation: 'SELECT',
      records: Math.floor(Math.random() * 100),
      timestamp: new Date().toISOString()
    }
  }

  private async executeWebhook(node: any, context: any): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 1200))
    return { 
      webhook: node.title,
      url: node.config?.url || 'https://example.com/webhook',
      status: 200,
      timestamp: new Date().toISOString()
    }
  }

  private getNodeById(nodeId: string, nodes: any[]): any {
    return nodes.find(node => node.nodeId === nodeId)
  }

  getScheduledWorkflows() {
    return Array.from(this.scheduledWorkflows.values()).map(sw => ({
      id: sw.id,
      workflowId: sw.workflowId,
      schedule: sw.schedule
    }))
  }

  shutdown() {
    console.log('Shutting down workflow scheduler...')
    for (const scheduled of this.scheduledWorkflows.values()) {
      scheduled.task.stop()
    }
    this.scheduledWorkflows.clear()
    console.log('Workflow scheduler shut down')
  }
}

export const workflowScheduler = new WorkflowScheduler()