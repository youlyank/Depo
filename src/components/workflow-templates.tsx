'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Search, 
  Grid3X3, 
  List, 
  Star, 
  Clock, 
  Zap,
  Filter,
  Sparkles
} from 'lucide-react'

interface Template {
  id: string
  name: string
  description: string
  category: string
  prompt: string
  icon: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

interface WorkflowTemplatesProps {
  onTemplateSelect?: (template: Template) => void
}

const categories = [
  { id: 'all', name: 'All Templates', icon: Grid3X3 },
  { id: 'reporting', name: 'Reporting', icon: '📊' },
  { id: 'user-management', name: 'User Management', icon: '👥' },
  { id: 'communication', name: 'Communication', icon: '💬' },
  { id: 'backup', name: 'Backup', icon: '💾' },
  { id: 'integration', name: 'Integration', icon: '🔗' },
  { id: 'marketing', name: 'Marketing', icon: '📱' },
  { id: 'monitoring', name: 'Monitoring', icon: '🚨' }
]

const difficultyColors = {
  beginner: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}

export default function WorkflowTemplates({ onTemplateSelect }: WorkflowTemplatesProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useState(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
        setFilteredTemplates(data)
      }
    } catch (error) {
      console.error('Failed to load templates:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTemplates = () => {
    let filtered = templates

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory)
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTemplates(filtered)
  }

  useState(() => {
    filterTemplates()
  }, [selectedCategory, searchQuery, templates])

  const handleTemplateSelect = async (template: Template) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId: template.id }),
      })

      if (response.ok) {
        const workflow = await response.json()
        onTemplateSelect?.(workflow)
      }
    } catch (error) {
      console.error('Failed to create workflow from template:', error)
    }
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Workflow Templates</h3>
          <p className="text-sm text-muted-foreground">
            Start with pre-built workflows for common automation tasks
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Templates Grid/List */}
      <ScrollArea className="h-[400px]">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-all hover:scale-105"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl">{template.icon}</div>
                    <Badge className={difficultyColors[template.difficulty]}>
                      {template.difficulty}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-xs">
                      {template.category}
                    </Badge>
                    <Button size="sm" variant="ghost">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTemplates.map((template) => (
              <Card 
                key={template.id} 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{template.icon}</div>
                      <div>
                        <h4 className="font-medium">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className="text-xs">
                            {template.category}
                          </Badge>
                          <Badge className={difficultyColors[template.difficulty]}>
                            {template.difficulty}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}