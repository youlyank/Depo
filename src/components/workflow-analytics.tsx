'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  PieChart,
  Timer,
  Zap,
  Target
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AnalyticsData {
  totalExecutions: number
  successRate: number
  averageExecutionTime: number
  mostUsedWorkflows: Array<{
    id: string
    name: string
    executions: number
    successRate: number
  }>
  recentActivity: Array<{
    id: string
    workflowName: string
    status: string
    duration: number
    timestamp: string
  }>
  performanceMetrics: {
    dailyExecutions: Array<{ date: string; count: number }>
    successByType: Record<string, number>
    errorRates: Record<string, number>
  }
}

export default function WorkflowAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      // Simulate API call - in real app, this would fetch from analytics API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockData: AnalyticsData = {
        totalExecutions: 1247,
        successRate: 94.5,
        averageExecutionTime: 2.3,
        mostUsedWorkflows: [
          { id: '1', name: 'Daily Report Email', executions: 342, successRate: 98.2 },
          { id: '2', name: 'User Onboarding', executions: 256, successRate: 96.1 },
          { id: '3', name: 'Slack Notifications', executions: 189, successRate: 92.3 },
          { id: '4', name: 'Data Backup', executions: 145, successRate: 99.3 },
          { id: '5', name: 'Error Monitoring', executions: 98, successRate: 89.7 }
        ],
        recentActivity: [
          { id: '1', workflowName: 'Daily Report Email', status: 'completed', duration: 1.2, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
          { id: '2', workflowName: 'User Onboarding', status: 'completed', duration: 0.8, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() },
          { id: '3', workflowName: 'Slack Notifications', status: 'failed', duration: 3.4, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
          { id: '4', workflowName: 'Data Backup', status: 'completed', duration: 5.1, timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
          { id: '5', workflowName: 'Error Monitoring', status: 'completed', duration: 0.5, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString() }
        ],
        performanceMetrics: {
          dailyExecutions: [
            { date: '2024-01-01', count: 145 },
            { date: '2024-01-02', count: 167 },
            { date: '2024-01-03', count: 189 },
            { date: '2024-01-04', count: 156 },
            { date: '2024-01-05', count: 178 },
            { date: '2024-01-06', count: 201 },
            { date: '2024-01-07', count: 211 }
          ],
          successByType: {
            'email': 98.2,
            'slack': 92.3,
            'database': 99.3,
            'webhook': 89.7,
            'http-request': 91.4
          },
          errorRates: {
            'webhook': 10.3,
            'http-request': 8.6,
            'slack': 7.7,
            'email': 1.8,
            'database': 0.7
          }
        }
      }
      
      setAnalytics(mockData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="text-center py-8">
        <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No analytics data available</h3>
        <p className="text-muted-foreground">
          Run some workflows to see analytics here
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Monitor your workflow performance and usage patterns
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as const).map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === '7d' ? '7 days' : range === '30d' ? '30 days' : '90 days'}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Executions</p>
                <p className="text-2xl font-bold">{analytics.totalExecutions.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +12% from last period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Success Rate</p>
                <p className="text-2xl font-bold">{analytics.successRate}%</p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  +2.3% from last period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Timer className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Avg. Execution Time</p>
                <p className="text-2xl font-bold">{analytics.averageExecutionTime}s</p>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  +0.2s from last period
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Active Workflows</p>
                <p className="text-2xl font-bold">{analytics.mostUsedWorkflows.length}</p>
                <p className="text-xs text-muted-foreground">
                  Currently running
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Used Workflows */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Most Used Workflows
            </CardTitle>
            <CardDescription>
              Top workflows by execution count
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.mostUsedWorkflows.map((workflow, index) => (
                <div key={workflow.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{workflow.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {workflow.executions} executions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={workflow.successRate > 95 ? 'default' : 'secondary'}>
                      {workflow.successRate}% success
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest workflow executions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {analytics.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(activity.status)}
                      <div>
                        <p className="font-medium text-sm">{activity.workflowName}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{activity.duration}s</p>
                      <Badge 
                        variant={activity.status === 'completed' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
          <CardDescription>
            Success rates by workflow type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Success Rates by Type</h4>
              <div className="space-y-2">
                {Object.entries(analytics.performanceMetrics.successByType).map(([type, rate]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Error Rates by Type</h4>
              <div className="space-y-2">
                {Object.entries(analytics.performanceMetrics.errorRates)
                  .sort(([,a], [,b]) => b - a)
                  .map(([type, rate]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-muted rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{rate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}