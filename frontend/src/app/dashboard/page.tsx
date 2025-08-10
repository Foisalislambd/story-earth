'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, 
  Edit, 
  Eye, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  TrendingUp,
  Users,
  Calendar,
  Globe,
  Lock,
  EyeOff,
  MoreHorizontal,
  Trash2,
  BookOpen,
  BarChart3,
  Bell,
  Settings,
  FileText,
  Clock,
  Target,
  Archive,
  Star,
  Download
} from 'lucide-react'
import { storiesAPI, userAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface Story {
  id: string
  title: string
  excerpt: string
  content: string
  slug: string
  coverImage?: string
  isPublished: boolean
  isDraft: boolean
  visibility: 'public' | 'unlisted' | 'private'
  publishedAt?: string
  createdAt: string
  updatedAt: string
  viewsCount: number
  likesCount: number
  commentsCount: number
  sharesCount: number
  readingTime: number
  category?: string
  tags: string[]
  contentType: string
}

interface UserStats {
  totalStories: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalFollowers: number
  totalFollowing: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stories, setStories] = useState<Story[]>([])
  const [stats, setStats] = useState<UserStats>({
    totalStories: 0,
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFollowers: 0,
    totalFollowing: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('stories')

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    loadDashboardData()
  }, [user, router])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Load user stories
      const storiesResponse = await storiesAPI.getUserStories()
      setStories(storiesResponse.data.stories || [])
      
      // Load user stats
      const statsResponse = await userAPI.getUserStats()
      setStats(statsResponse.data || stats)
      
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteStory = async (storyId: string) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return
    }

    try {
      await storiesAPI.deleteStory(storyId)
      setStories(stories.filter(story => story.id !== storyId))
    } catch (error) {
      console.error('Error deleting story:', error)
      alert('Failed to delete story. Please try again.')
    }
  }

  const getVisibilityIcon = (visibility: string) => {
    switch (visibility) {
      case 'public':
        return <Globe className="w-4 h-4" />
      case 'unlisted':
        return <EyeOff className="w-4 h-4" />
      case 'private':
        return <Lock className="w-4 h-4" />
      default:
        return <Globe className="w-4 h-4" />
    }
  }

  const getContentTypeIcon = (contentType: string) => {
    switch (contentType) {
      case 'story':
        return <BookOpen className="w-4 h-4" />
      case 'poem':
        return <FileText className="w-4 h-4" />
      case 'article':
        return <FileText className="w-4 h-4" />
      case 'review':
        return <Target className="w-4 h-4" />
      default:
        return <BookOpen className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back, {user.username}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" asChild>
              <Link href="/profile">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Link>
            </Button>
            <Button asChild>
              <Link href="/write">
                <Plus className="w-4 h-4 mr-2" />
                New Story
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Stories</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalStories}</p>
                </div>
                <BookOpen className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Views</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalViews.toLocaleString()}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Likes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalLikes.toLocaleString()}</p>
                </div>
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Followers</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalFollowers.toLocaleString()}</p>
                </div>
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="stories">Stories</TabsTrigger>
            <TabsTrigger value="drafts">Drafts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="bookmarks">Bookmarks</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="stories" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Published Stories</h2>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="grid gap-6">
              {stories.filter(story => story.isPublished).map((story) => (
                <Card key={story.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon(story.contentType)}
                          <h3 className="text-xl font-semibold text-gray-900">{story.title}</h3>
                          {getVisibilityIcon(story.visibility)}
                          <Badge variant="secondary" className="ml-2">
                            {story.contentType}
                          </Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">{story.excerpt}</p>
                        
                        <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {story.viewsCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-4 h-4" />
                            {story.likesCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-4 h-4" />
                            {story.commentsCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-4 h-4" />
                            {story.sharesCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {story.readingTime} min read
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          {story.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {story.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{story.tags.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/story/${story.slug}`}>
                            <Eye className="w-4 h-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/write?edit=${story.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteStory(story.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <span className="text-sm text-gray-500">
                        Published on {formatDate(story.publishedAt || story.createdAt)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Last updated {formatDate(story.updatedAt)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {stories.filter(story => story.isPublished).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No published stories yet</h3>
                    <p className="text-gray-600 mb-6">Start writing your first story to share with the world!</p>
                    <Button asChild>
                      <Link href="/write">
                        <Plus className="w-4 h-4 mr-2" />
                        Write Your First Story
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="drafts" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">Draft Stories</h2>
              <span className="text-sm text-gray-500">
                {stories.filter(story => story.isDraft).length} drafts
              </span>
            </div>

            <div className="grid gap-6">
              {stories.filter(story => story.isDraft).map((story) => (
                <Card key={story.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getContentTypeIcon(story.contentType)}
                          <h3 className="text-xl font-semibold text-gray-900">{story.title || 'Untitled'}</h3>
                          <Badge variant="secondary">Draft</Badge>
                        </div>
                        
                        <p className="text-gray-600 mb-4 line-clamp-2">
                          {story.excerpt || story.content.substring(0, 150) + '...'}
                        </p>
                        
                        <div className="text-sm text-gray-500">
                          Last edited {formatDate(story.updatedAt)}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/write?edit=${story.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Continue Writing
                          </Link>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteStory(story.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {stories.filter(story => story.isDraft).length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Archive className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No drafts</h3>
                    <p className="text-gray-600 mb-6">All your stories are published or you haven't started any drafts yet.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-semibold">Analytics</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Views Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                      <p>Analytics chart coming soon</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Stories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stories
                      .filter(story => story.isPublished)
                      .sort((a, b) => b.viewsCount - a.viewsCount)
                      .slice(0, 5)
                      .map((story, index) => (
                        <div key={story.id} className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-600">
                            {index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 truncate">{story.title}</p>
                            <p className="text-sm text-gray-500">{story.viewsCount.toLocaleString()} views</p>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookmarks" className="space-y-6">
            <h2 className="text-2xl font-semibold">Bookmarked Stories</h2>
            
            <Card>
              <CardContent className="p-12 text-center">
                <Bookmark className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
                <p className="text-gray-600">Stories you bookmark will appear here for easy access.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <h2 className="text-2xl font-semibold">Recent Activity</h2>
            
            <Card>
              <CardContent className="p-12 text-center">
                <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-600">Your recent interactions and notifications will appear here.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}