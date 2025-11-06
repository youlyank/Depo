'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  PlayCircle,
  BarChart3,
  TrendingUp,
  Timer,
  Zap
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Execution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  input?: any
  output?: any
  error?: string
  startedAt: string
  completedAt?: string
  workflow: {
    name: string
    description: string
  }
}

export default function ExecutionMonitor() {
  const [executions, setExecutions] = useState<Execution[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    running: 0,
    completed: 0,
    failed: 0
  })

  useEffect(() => {
    loadExecutions()
    
    // Set up polling for real-time updates
    const interval = setInterval(loadExecutions, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const loadExecutions = async () => {
    try {
      const response = await fetch('/api/executions')
      if (response.ok) {
        const data = await response.json()
        setExecutions(data)
        
        // Calculate stats
        const newStats = {
          total: data.length,
          running: data.filter((e: Execution) => e.status === 'running').length,
          completed: data.filter((e: Execution) => e.status === 'completed').length,
          failed: data.filter((e: Execution) => e.status === 'failed').length
        }
        setStats(newStats)
      }
    } catch (error) {
      console.error('Failed to load executions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <PlayCircle className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      pending: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
    
    return (
      <Badge className={variants[status as keyof typeof variants] || variants.pending}>
        {status}
      </Badge>
    )
  }

  const getDuration = (execution: Execution) => {
    if (!execution.completedAt) return null
    const start = new Date(execution.startedAt)
    const end = new Date(execution.completedAt)
    const duration = end.getTime() - start.getTime()
    return `${(duration / 1000).toFixed(2)}s`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Executions</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PlayCircle className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Running</p>
                <p className="text-2xl font-bold text-blue-500">{stats.running}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-green-500">{stats.completed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Failed</p>
                <p className="text-2xl font-bold text-red-500">{stats.failed}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Execution List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Executions
              </CardTitle>
              <CardDescription>
                Real-time workflow execution monitoring
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadExecutions}>
              <Timer className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {executions.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No executions yet</h3>
                  <p className="text-muted-foreground">
                    Run a workflow to see execution history here
                  </p>
                </div>
              ) : (
                executions.map((execution) => (
                  <div key={execution.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(execution.status)}
                          <h4 className="font-medium">{execution.workflow.name}</h4>
                          {getStatusBadge(execution.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {execution.workflow.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(execution.startedAt), { addSuffix: true })}
                          </span>
                          {getDuration(execution) && (
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              Duration: {getDuration(execution)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {execution.error && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Error:</strong> {execution.error}
                        </p>
                      </div>
                    )}
                    
                    {execution.output && (
                      <details className="text-xs">
                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                          View Output
                        </summary>
                        <pre className="mt-2 p-2 bg-muted rounded overflow-x-auto">
                          {JSON.stringify(execution.output, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}