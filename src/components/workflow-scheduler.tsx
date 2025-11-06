'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Clock, 
  Calendar, 
  Play, 
  Pause, 
  Save,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface WorkflowSchedulerProps {
  workflowId: string
  currentSchedule?: string
  onScheduleUpdate?: (schedule: string) => void
}

const commonSchedules = [
  { label: 'Every minute', cron: '* * * * *', description: 'Runs every minute' },
  { label: 'Every 5 minutes', cron: '*/5 * * * *', description: 'Runs every 5 minutes' },
  { label: 'Every hour', cron: '0 * * * *', description: 'Runs at the start of every hour' },
  { label: 'Every day at 9 AM', cron: '0 9 * * *', description: 'Runs daily at 9:00 AM' },
  { label: 'Every Monday at 9 AM', cron: '0 9 * * 1', description: 'Runs every Monday at 9:00 AM' },
  { label: 'First day of month', cron: '0 9 1 * *', description: 'Runs on the 1st of every month at 9:00 AM' },
]

export default function WorkflowScheduler({ 
  workflowId, 
  currentSchedule, 
  onScheduleUpdate 
}: WorkflowSchedulerProps) {
  const [schedule, setSchedule] = useState(currentSchedule || '')
  const [customCron, setCustomCron] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSchedule = async (newSchedule: string) => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/workflows/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
          schedule: newSchedule
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update schedule')
      }

      const result = await response.json()
      setSchedule(newSchedule)
      setMessage({ type: 'success', text: result.message })
      onScheduleUpdate?.(newSchedule)
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update schedule' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnschedule = async () => {
    setIsLoading(true)
    setMessage(null)
    
    try {
      const response = await fetch('/api/workflows/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workflowId,
          schedule: null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to unschedule')
      }

      setSchedule('')
      setMessage({ type: 'success', text: 'Workflow unscheduled' })
      onScheduleUpdate?.('')
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to unschedule workflow' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCustomSchedule = () => {
    if (customCron.trim()) {
      handleSchedule(customCron.trim())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Workflow Scheduling
        </CardTitle>
        <CardDescription>
          Set up automatic execution of your workflow on a schedule
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-2">
            {schedule ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium">Scheduled</span>
                <Badge variant="secondary">{schedule}</Badge>
              </>
            ) : (
              <>
                <Pause className="h-5 w-5 text-gray-500" />
                <span className="font-medium">Not Scheduled</span>
              </>
            )}
          </div>
          {schedule && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUnschedule}
              disabled={isLoading}
            >
              <Pause className="h-4 w-4 mr-2" />
              Unschedule
            </Button>
          )}
        </div>

        {/* Message */}
        {message && (
          <div className={`p-3 rounded-lg flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200' 
              : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span className="text-sm">{message.text}</span>
          </div>
        )}

        {/* Common Schedules */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Common Schedules</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {commonSchedules.map((s) => (
              <div
                key={s.cron}
                className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  schedule === s.cron 
                    ? 'border-primary bg-primary/5' 
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleSchedule(s.cron)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">{s.label}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{s.description}</p>
                    <code className="text-xs bg-muted px-2 py-1 rounded mt-2 block">
                      {s.cron}
                    </code>
                  </div>
                  {schedule === s.cron && (
                    <CheckCircle className="h-4 w-4 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Cron Expression */}
        <div>
          <Label htmlFor="custom-cron" className="text-sm font-medium mb-3 block">
            Custom Cron Expression
          </Label>
          <div className="flex gap-2">
            <Input
              id="custom-cron"
              placeholder="e.g., 0 */2 * * * (every 2 hours)"
              value={customCron}
              onChange={(e) => setCustomCron(e.target.value)}
              className="font-mono"
            />
            <Button 
              onClick={handleCustomSchedule}
              disabled={!customCron.trim() || isLoading}
            >
              <Save className="h-4 w-4 mr-2" />
              Set
            </Button>
          </div>
          <div className="mt-2 flex items-start gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3 mt-0.5" />
            <div>
              <p>Cron format: minute hour day month weekday</p>
              <p>Example: 0 9 * * 1 = 9:00 AM every Monday</p>
            </div>
          </div>
        </div>

        {/* Schedule Info */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800 dark:text-blue-200 mb-1">
                How scheduling works:
              </p>
              <ul className="text-blue-700 dark:text-blue-300 space-y-1 text-xs">
                <li>• Workflows run automatically based on the cron schedule</li>
                <li>• The scheduler handles execution in the background</li>
                <li>• All executions are logged and can be monitored</li>
                <li>• Workflows must be active to run on schedule</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}