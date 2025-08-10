'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Save, 
  Eye, 
  Send, 
  Image as ImageIcon, 
  Bold, 
  Italic, 
  List, 
  ListOrdered,
  Quote,
  Code,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Calendar,
  Globe,
  Lock,
  EyeOff,
  Hash,
  BookOpen,
  Users,
  Clock,
  Target,
  FileText,
  Palette
} from 'lucide-react'
import { storiesAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface StoryData {
  id?: string
  title: string
  content: string
  excerpt?: string
  coverImage?: string
  tags: string[]
  category: string
  contentType: 'story' | 'poem' | 'article' | 'review'
  visibility: 'public' | 'unlisted' | 'private'
  mature: boolean
  allowComments: boolean
  allowSharing: boolean
  scheduledAt?: string
  seriesId?: string
  partNumber?: number
}

const CONTENT_TYPES = [
  { value: 'story', label: 'Story', icon: BookOpen },
  { value: 'poem', label: 'Poem', icon: Type },
  { value: 'article', label: 'Article', icon: FileText },
  { value: 'review', label: 'Review', icon: Target }
]

const CATEGORIES = [
  'Fiction', 'Non-Fiction', 'Poetry', 'Drama', 'Mystery', 'Romance', 
  'Fantasy', 'Science Fiction', 'Horror', 'Thriller', 'Adventure',
  'Biography', 'History', 'Philosophy', 'Self-Help', 'Technology',
  'Travel', 'Food', 'Health', 'Business', 'Education'
]

export default function WritePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const editorRef = useRef<HTMLTextAreaElement>(null)
  const [activeTab, setActiveTab] = useState('write')
  const [wordCount, setWordCount] = useState(0)
  const [readingTime, setReadingTime] = useState(0)

  const [storyData, setStoryData] = useState<StoryData>({
    title: '',
    content: '',
    excerpt: '',
    coverImage: '',
    tags: [],
    category: '',
    contentType: 'story',
    visibility: 'public',
    mature: false,
    allowComments: true,
    allowSharing: true
  })

  const [newTag, setNewTag] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Auto-save functionality
  useEffect(() => {
    if (storyData.title || storyData.content) {
      const timer = setTimeout(() => {
        handleAutoSave()
      }, 5000) // Auto-save every 5 seconds

      return () => clearTimeout(timer)
    }
  }, [storyData.title, storyData.content])

  // Calculate word count and reading time
  useEffect(() => {
    const words = storyData.content.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
    setReadingTime(Math.ceil(words.length / 200)) // 200 words per minute
  }, [storyData.content])

  // Load existing story for editing
  useEffect(() => {
    const storyId = searchParams.get('edit')
    if (storyId) {
      loadStory(storyId)
    }
  }, [searchParams])

  const loadStory = async (storyId: string) => {
    try {
      setIsLoading(true)
      const response = await storiesAPI.getStory(storyId)
      const story = response.data
      
      setStoryData({
        id: story.id,
        title: story.title,
        content: story.content,
        excerpt: story.excerpt || '',
        coverImage: story.coverImage || '',
        tags: story.tags || [],
        category: story.category || '',
        contentType: story.contentType || 'story',
        visibility: story.visibility || 'public',
        mature: story.mature || false,
        allowComments: story.allowComments !== false,
        allowSharing: story.allowSharing !== false,
        scheduledAt: story.scheduledAt || '',
        seriesId: story.seriesId || '',
        partNumber: story.partNumber || undefined
      })
    } catch (error) {
      console.error('Error loading story:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAutoSave = async () => {
    if (!storyData.title && !storyData.content) return

    try {
      setIsSaving(true)
      const saveData = {
        ...storyData,
        isDraft: true,
        isPublished: false
      }

      if (storyData.id) {
        await storiesAPI.updateStory(storyData.id, saveData)
      } else {
        const response = await storiesAPI.createStory(saveData)
        setStoryData(prev => ({ ...prev, id: response.data.id }))
      }
      
      setLastSaved(new Date())
    } catch (error) {
      console.error('Auto-save failed:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveDraft = async () => {
    await handleAutoSave()
  }

  const handlePublish = async () => {
    if (!storyData.title.trim() || !storyData.content.trim()) {
      alert('Please provide both title and content before publishing.')
      return
    }

    try {
      setIsLoading(true)
      const publishData = {
        ...storyData,
        isDraft: false,
        isPublished: true,
        publishedAt: storyData.scheduledAt || new Date().toISOString()
      }

      if (storyData.id) {
        await storiesAPI.updateStory(storyData.id, publishData)
      } else {
        await storiesAPI.createStory(publishData)
      }

      router.push('/dashboard')
    } catch (error) {
      console.error('Error publishing story:', error)
      alert('Failed to publish story. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreview = () => {
    setIsPreviewMode(!isPreviewMode)
    setActiveTab(isPreviewMode ? 'write' : 'preview')
  }

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = editorRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = storyData.content.substring(start, end)
    
    const newText = storyData.content.substring(0, start) + 
                   before + selectedText + after + 
                   storyData.content.substring(end)
    
    setStoryData({ ...storyData, content: newText })
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const addTag = () => {
    if (newTag.trim() && !storyData.tags.includes(newTag.trim())) {
      setStoryData({
        ...storyData,
        tags: [...storyData.tags, newTag.trim()]
      })
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setStoryData({
      ...storyData,
      tags: storyData.tags.filter(tag => tag !== tagToRemove)
    })
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Here you would typically upload to a cloud service
    // For now, we'll use FileReader for demo
    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      insertFormatting(`![Image](${imageUrl})`)
    }
    reader.readAsDataURL(file)
  }

  if (!user) {
    router.push('/login')
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading story...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {storyData.id ? 'Edit Story' : 'Write New Story'}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>{wordCount} words</span>
              <span>{readingTime} min read</span>
              {lastSaved && (
                <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
              )}
              {isSaving && <span className="text-blue-600">Saving...</span>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleSaveDraft} disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </Button>
            <Button onClick={handlePublish} disabled={isLoading}>
              <Send className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="write">Write</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>

              <TabsContent value="write" className="space-y-6">
                {/* Title */}
                <div>
                  <Input
                    placeholder="Story title..."
                    value={storyData.title}
                    onChange={(e) => setStoryData({ ...storyData, title: e.target.value })}
                    className="text-3xl font-bold border-none px-0 py-4 focus:ring-0 placeholder:text-gray-400"
                  />
                </div>

                {/* Formatting Toolbar */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-white rounded-lg border">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('**', '**')}
                    title="Bold"
                  >
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('*', '*')}
                    title="Italic"
                  >
                    <Italic className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('\n# ', '')}
                    title="Heading 1"
                  >
                    <Heading1 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('\n## ', '')}
                    title="Heading 2"
                  >
                    <Heading2 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('\n### ', '')}
                    title="Heading 3"
                  >
                    <Heading3 className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('\n- ', '')}
                    title="Bullet List"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('\n1. ', '')}
                    title="Numbered List"
                  >
                    <ListOrdered className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('\n> ', '')}
                    title="Quote"
                  >
                    <Quote className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('`', '`')}
                    title="Code"
                  >
                    <Code className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => insertFormatting('[text](url)', '')}
                    title="Link"
                  >
                    <Link className="w-4 h-4" />
                  </Button>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      title="Insert Image"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Content Editor */}
                <div>
                  <Textarea
                    ref={editorRef}
                    placeholder="Start writing your story..."
                    value={storyData.content}
                    onChange={(e) => setStoryData({ ...storyData, content: e.target.value })}
                    className="min-h-[600px] text-lg leading-relaxed border-none px-0 py-4 focus:ring-0 resize-none"
                  />
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-6">
                <div className="prose prose-lg max-w-none bg-white p-8 rounded-lg">
                  {storyData.title && (
                    <h1 className="text-4xl font-bold mb-6">{storyData.title}</h1>
                  )}
                  <div className="whitespace-pre-wrap">
                    {storyData.content || 'Start writing to see preview...'}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Story Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Content Type */}
                <div>
                  <Label>Content Type</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {CONTENT_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        type="button"
                        variant={storyData.contentType === type.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setStoryData({ ...storyData, contentType: type.value as any })}
                        className="justify-start"
                      >
                        <type.icon className="w-4 h-4 mr-2" />
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Category */}
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={storyData.category}
                    onChange={(e) => setStoryData({ ...storyData, category: e.target.value })}
                    className="w-full mt-1 p-2 border rounded-md"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Visibility */}
                <div>
                  <Label>Visibility</Label>
                  <div className="space-y-2 mt-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="public"
                        checked={storyData.visibility === 'public'}
                        onChange={(e) => setStoryData({ ...storyData, visibility: e.target.value as any })}
                        className="mr-2"
                      />
                      <Globe className="w-4 h-4 mr-2" />
                      Public
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="unlisted"
                        checked={storyData.visibility === 'unlisted'}
                        onChange={(e) => setStoryData({ ...storyData, visibility: e.target.value as any })}
                        className="mr-2"
                      />
                      <EyeOff className="w-4 h-4 mr-2" />
                      Unlisted
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="visibility"
                        value="private"
                        checked={storyData.visibility === 'private'}
                        onChange={(e) => setStoryData({ ...storyData, visibility: e.target.value as any })}
                        className="mr-2"
                      />
                      <Lock className="w-4 h-4 mr-2" />
                      Private
                    </label>
                  </div>
                </div>

                {/* Schedule Publishing */}
                <div>
                  <Label htmlFor="scheduledAt">Schedule Publishing</Label>
                  <Input
                    id="scheduledAt"
                    type="datetime-local"
                    value={storyData.scheduledAt}
                    onChange={(e) => setStoryData({ ...storyData, scheduledAt: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Options */}
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storyData.mature}
                      onChange={(e) => setStoryData({ ...storyData, mature: e.target.checked })}
                      className="mr-2"
                    />
                    Mature content
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storyData.allowComments}
                      onChange={(e) => setStoryData({ ...storyData, allowComments: e.target.checked })}
                      className="mr-2"
                    />
                    Allow comments
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={storyData.allowSharing}
                      onChange={(e) => setStoryData({ ...storyData, allowSharing: e.target.checked })}
                      className="mr-2"
                    />
                    Allow sharing
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cover Image</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Input
                    placeholder="Image URL"
                    value={storyData.coverImage}
                    onChange={(e) => setStoryData({ ...storyData, coverImage: e.target.value })}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) {
                        // Handle file upload here
                        const reader = new FileReader()
                        reader.onload = (e) => {
                          setStoryData({ ...storyData, coverImage: e.target?.result as string })
                        }
                        reader.readAsDataURL(file)
                      }
                    }}
                    className="w-full text-sm"
                  />
                  {storyData.coverImage && (
                    <img
                      src={storyData.coverImage}
                      alt="Cover preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    />
                    <Button type="button" onClick={addTag} size="sm">
                      <Hash className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {storyData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="cursor-pointer hover:bg-red-100"
                        onClick={() => removeTag(tag)}
                      >
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Excerpt</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Brief description of your story..."
                  value={storyData.excerpt}
                  onChange={(e) => setStoryData({ ...storyData, excerpt: e.target.value })}
                  className="min-h-[100px]"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {storyData.excerpt.length}/500 characters
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}