'use client'

import { useState, useCallback, useEffect } from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Play, 
  Save, 
  Sparkles, 
  Settings, 
  Zap,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  Activity,
  BarChart3,
  Calendar,
  Grid3X3,
  MessageSquare
} from 'lucide-react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import ExecutionMonitor from '@/components/execution-monitor'
import WorkflowScheduler from '@/components/workflow-scheduler'
import WorkflowTemplates from '@/components/workflow-templates'
import WorkflowAnalytics from '@/components/workflow-analytics'
import SlackIntegration from '@/components/slack-integration'

// Sample node types for different automation components
const nodeTypes = {
  trigger: { color: 'bg-green-500', icon: '⚡' },
  action: { color: 'bg-blue-500', icon: '🔧' },
  condition: { color: 'bg-yellow-500', icon: '🔀' },
  delay: { color: 'bg-purple-500', icon: '⏰' },
  webhook: { color: 'bg-red-500', icon: '🌐' },
  database: { color: 'bg-indigo-500', icon: '🗄️' },
  slack: { color: 'bg-purple-500', icon: '💬' },
  'google-sheets': { color: 'bg-green-600', icon: '📊' },
  discord: { color: 'bg-indigo-600', icon: '🎮' },
  email: { color: 'bg-blue-500', icon: '📧' },
}

interface Workflow {
  id: string
  name: string
  description: string
  prompt: string
  nodes: Node[]
  edges: Edge[]
  isActive: boolean
  schedule?: string
  lastRun?: string
  status?: 'success' | 'error' | 'running'
}

export default function Home() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  // Load workflows on component mount
  useEffect(() => {
    loadWorkflows()
  }, [])

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows')
      if (response.ok) {
        const data = await response.json()
        setWorkflows(data)
        if (data.length > 0 && !selectedWorkflow) {
          setSelectedWorkflow(data[0])
          setNodes(data[0].nodes || [])
          setEdges(data[0].edges || [])
        }
      }
    } catch (error) {
      console.error('Failed to load workflows:', error)
    }
  }

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const generateWorkflow = async () => {
    if (!prompt.trim()) return
    
    setIsGenerating(true)
    try {
      const response = await fetch('/api/workflows/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate workflow')
      }

      const newWorkflow = await response.json()
      
      // Reload workflows to get the latest data
      await loadWorkflows()
      
      // Select the newly created workflow
      setSelectedWorkflow(newWorkflow)
      setNodes(newWorkflow.nodes || [])
      setEdges(newWorkflow.edges || [])
      setPrompt('')
    } catch (error) {
      console.error('Failed to generate workflow:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveWorkflow = async () => {
    if (!selectedWorkflow) return
    
    try {
      const response = await fetch(`/api/workflows/${selectedWorkflow.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: selectedWorkflow.name,
          description: selectedWorkflow.description,
          isActive: selectedWorkflow.isActive,
          nodes,
          edges
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save workflow')
      }

      // Reload workflows to get the latest data
      await loadWorkflows()
      
      console.log('Workflow saved successfully')
    } catch (error) {
      console.error('Failed to save workflow:', error)
    }
  }

  const runWorkflow = async (workflowId: string) => {
    try {
      // Update status to running
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'running', lastRun: 'Running...' }
          : w
      ))
      
      const response = await fetch(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to run workflow')
      }

      const result = await response.json()
      
      // Update status to success
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'success', lastRun: 'Just now' }
          : w
      ))
    } catch (error) {
      console.error('Failed to run workflow:', error)
      // Update status to error
      setWorkflows(prev => prev.map(w => 
        w.id === workflowId 
          ? { ...w, status: 'error', lastRun: 'Failed' }
          : w
      ))
    }
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'running':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-10 h-10">
              <img src="/logo.svg" alt="Z.ai Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              AI Workflow Builder
            </h1>
            <Badge variant="secondary" className="ml-auto">
              <Sparkles className="h-3 w-3 mr-1" />
              Powered by AI
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Transform your ideas into automated workflows with AI
          </p>
        </div>

        <Tabs defaultValue="builder" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Builder
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="monitor" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Monitor
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Integrations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - AI Prompt & Workflow List */}
              <div className="lg:col-span-1 space-y-6">
                {/* AI Prompt Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-violet-500" />
                      AI Workflow Generator
                    </CardTitle>
                    <CardDescription>
                      Describe what you want to automate in plain English
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      placeholder="e.g., 'Send me a daily email with website analytics at 8 AM' or 'When a user signs up, add them to the newsletter and send a welcome email'"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      rows={4}
                      className="resize-none"
                    />
                    <Button 
                      onClick={generateWorkflow}
                      disabled={!prompt.trim() || isGenerating}
                      className="w-full"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Workflow
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                {/* Workflow List */}
                <Card>
                  <CardHeader>
                    <CardTitle>My Workflows</CardTitle>
                    <CardDescription>
                      Click to view and edit workflows
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-64">
                      <div className="space-y-3">
                        {workflows.map((workflow) => (
                          <div
                            key={workflow.id}
                            className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                              selectedWorkflow?.id === workflow.id 
                                ? 'border-violet-500 bg-violet-50 dark:bg-violet-950' 
                                : 'border-border hover:border-violet-300'
                            }`}
                            onClick={() => {
                              setSelectedWorkflow(workflow)
                              setNodes(workflow.nodes || [])
                              setEdges(workflow.edges || [])
                            }}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-sm">{workflow.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {workflow.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  {getStatusIcon(workflow.status)}
                                  <span className="text-xs text-muted-foreground">
                                    {workflow.lastRun || 'Never run'}
                                  </span>
                                  {workflow.schedule && (
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-2 w-2 mr-1" />
                                      Scheduled
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    runWorkflow(workflow.id)
                                  }}
                                >
                                  <Play className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>

              {/* Right Panel - Workflow Visualization */}
              <div className="lg:col-span-2">
                <Card className="h-[600px]">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>
                        {selectedWorkflow ? selectedWorkflow.name : 'Select a Workflow'}
                      </CardTitle>
                      <CardDescription>
                        {selectedWorkflow 
                          ? `AI Generated: ${selectedWorkflow.prompt}` 
                          : 'Choose a workflow from the list or generate a new one'
                        }
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={saveWorkflow}>
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => selectedWorkflow && runWorkflow(selectedWorkflow.id)}
                        disabled={!selectedWorkflow}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Run
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="h-[500px] p-0">
                    {selectedWorkflow ? (
                      <div className="h-full">
                        <ReactFlow
                          nodes={nodes}
                          edges={edges}
                          onNodesChange={onNodesChange}
                          onEdgesChange={onEdgesChange}
                          onConnect={onConnect}
                          fitView
                          className="bg-slate-50 dark:bg-slate-900"
                        >
                          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
                          <Controls />
                          <MiniMap 
                            nodeColor={(node) => {
                              const type = node.data.type as keyof typeof nodeTypes
                              return nodeTypes[type]?.color || '#6b7280'
                            }}
                            className="bg-background border border-border"
                          />
                        </ReactFlow>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-medium mb-2">No Workflow Selected</h3>
                          <p className="text-muted-foreground max-w-sm">
                            Generate a new workflow with AI or select an existing one to get started
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="templates">
            <WorkflowTemplates 
              onTemplateSelect={(workflow) => {
                setSelectedWorkflow(workflow)
                setNodes(workflow.nodes || [])
                setEdges(workflow.edges || [])
                loadWorkflows()
              }}
            />
          </TabsContent>

          <TabsContent value="monitor">
            <ExecutionMonitor />
          </TabsContent>

          <TabsContent value="schedule">
            <div className="space-y-6">
              {selectedWorkflow ? (
                <WorkflowScheduler 
                  workflowId={selectedWorkflow.id}
                  currentSchedule={selectedWorkflow.schedule}
                  onScheduleUpdate={(schedule) => {
                    setSelectedWorkflow(prev => prev ? { ...prev, schedule } : null)
                    loadWorkflows()
                  }}
                />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Select a Workflow</h3>
                    <p className="text-muted-foreground">
                      Choose a workflow from the Builder tab to set up scheduling
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <WorkflowAnalytics />
          </TabsContent>

          <TabsContent value="integrations">
            <SlackIntegration />
          </TabsContent>
        </Tabs>

        {/* Quick Actions Bar */}
        <div className="mt-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    {workflows.filter(w => w.isActive).length} Active
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Play className="h-3 w-3 text-blue-500" />
                    {workflows.length} Total
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-purple-500" />
                    {workflows.filter(w => w.schedule).length} Scheduled
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}