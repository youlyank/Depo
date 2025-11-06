export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'delay' | 'webhook' | 'email' | 'database' | 'slack' | 'google-sheets' | 'discord' | 'http-request'
  title: string
  description: string
  config?: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface GeneratedWorkflow {
  name: string
  description: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
}

export class WorkflowGenerator {
  private zai: ZAI

  constructor() {
    this.zai = null as any
  }

  private async initialize() {
    if (!this.zai) {
      this.zai = await ZAI.create()
    }
  }

  async generateWorkflow(prompt: string): Promise<GeneratedWorkflow> {
    await this.initialize()

    try {
      const systemPrompt = `You are an expert automation workflow builder. When given a user's request, create a structured workflow that accomplishes their goal.

Your response must be a valid JSON object with the following structure:
{
  "name": "Brief descriptive workflow name",
  "description": "One-sentence description of what this workflow does",
  "nodes": [
    {
      "id": "unique_node_id",
      "type": "trigger|action|condition|delay|webhook|email|database|slack|google-sheets|discord|http-request",
      "title": "Human-readable node title",
      "description": "What this node does",
      "config": {},
      "position": { "x": number, "y": number }
    }
  ],
  "edges": [
    {
      "id": "unique_edge_id", 
      "source": "source_node_id",
      "target": "target_node_id"
    }
  ]
}

Node types and their uses:
- trigger: Starts the workflow (schedule, webhook, manual, etc.)
- action: Performs an action (send email, call API, update database, etc.)
- condition: Branches logic based on conditions
- delay: Waits for a specified time
- webhook: Receives HTTP requests
- email: Sends emails
- database: Database operations (read, write, update)
- slack: Send messages to Slack channels
- google-sheets: Read/write to Google Sheets
- discord: Send messages to Discord channels
- http-request: Make HTTP requests to any API

Position nodes in a logical flow from left to right with proper spacing.
Always include at least one trigger node.
Make sure all edges reference valid node IDs.
The workflow should be practical and implementable.

Enhanced node configurations:
- slack: { "channel": "#general", "message": "Hello from workflow!" }
- google-sheets: { "spreadsheetId": "abc123", "range": "A1:B10", "operation": "read" }
- discord: { "webhook": "https://discord.com/api/webhooks/...", "message": "Workflow update" }
- http-request: { "url": "https://api.example.com", "method": "POST", "headers": {}, "body": {} }

Example for "Send Slack notification when database record is created":
{
  "name": "Database to Slack Notification",
  "description": "Monitors database for new records and sends Slack notifications",
  "nodes": [
    {
      "id": "trigger_1",
      "type": "database",
      "title": "Database Trigger",
      "description": "Triggers when new record is created",
      "config": { "operation": "watch", "table": "users" },
      "position": { "x": 100, "y": 100 }
    },
    {
      "id": "action_1", 
      "type": "slack",
      "title": "Send Slack Notification",
      "description": "Notify team about new user",
      "config": { "channel": "#general", "message": "New user registered!" },
      "position": { "x": 300, "y": 100 }
    }
  ],
  "edges": [
    { "id": "edge_1", "source": "trigger_1", "target": "action_1" }
  ]
}`

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Create a workflow for: ${prompt}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        throw new Error('No response from AI')
      }

      // Parse the JSON response
      const workflowData = JSON.parse(content)
      
      // Validate the structure
      this.validateWorkflow(workflowData)
      
      return workflowData
    } catch (error) {
      console.error('Error generating workflow:', error)
      throw new Error(`Failed to generate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  private validateWorkflow(workflow: any): asserts workflow is GeneratedWorkflow {
    if (!workflow.name || typeof workflow.name !== 'string') {
      throw new Error('Workflow must have a valid name')
    }
    
    if (!workflow.description || typeof workflow.description !== 'string') {
      throw new Error('Workflow must have a valid description')
    }
    
    if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
      throw new Error('Workflow must have at least one node')
    }
    
    if (!Array.isArray(workflow.edges)) {
      throw new Error('Workflow must have a valid edges array')
    }

    // Validate nodes
    const nodeIds = new Set()
    for (const node of workflow.nodes) {
      if (!node.id || typeof node.id !== 'string') {
        throw new Error('Each node must have a valid id')
      }
      
      if (nodeIds.has(node.id)) {
        throw new Error(`Duplicate node ID: ${node.id}`)
      }
      nodeIds.add(node.id)
      
      if (!['trigger', 'action', 'condition', 'delay', 'webhook', 'email', 'database', 'slack', 'google-sheets', 'discord', 'http-request'].includes(node.type)) {
        throw new Error(`Invalid node type: ${node.type}`)
      }
      
      if (!node.title || typeof node.title !== 'string') {
        throw new Error('Each node must have a valid title')
      }
      
      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        throw new Error('Each node must have valid position coordinates')
      }
    }

    // Validate edges
    for (const edge of workflow.edges) {
      if (!edge.source || !edge.target) {
        throw new Error('Each edge must have valid source and target')
      }
      
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        throw new Error('Edge references non-existent node')
      }
    }

    // Check if there's at least one trigger
    const hasTrigger = workflow.nodes.some(node => node.type === 'trigger')
    if (!hasTrigger) {
      throw new Error('Workflow must have at least one trigger node')
    }
  }

  async optimizeWorkflow(workflow: GeneratedWorkflow): Promise<GeneratedWorkflow> {
    await this.initialize()

    try {
      const systemPrompt = `You are an expert workflow optimizer. Review the given workflow and suggest improvements to make it more efficient, reliable, and maintainable.

Your response must be a valid JSON object with the same structure as the input, but with optimizations applied.
Focus on:
1. Removing unnecessary nodes
2. Combining similar operations
3. Adding error handling
4. Improving node arrangements
5. Adding missing validations

Do not change the core functionality, only optimize it.`

      const completion = await this.zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Optimize this workflow: ${JSON.stringify(workflow, null, 2)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })

      const content = completion.choices[0]?.message?.content
      if (!content) {
        return workflow // Return original if optimization fails
      }

      const optimizedWorkflow = JSON.parse(content)
      this.validateWorkflow(optimizedWorkflow)
      
      return optimizedWorkflow
    } catch (error) {
      console.error('Error optimizing workflow:', error)
      return workflow // Return original workflow if optimization fails
    }
  }
}

export const workflowGenerator = new WorkflowGenerator()