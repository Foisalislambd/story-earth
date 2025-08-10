'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import StoryShare from '@/components/story/StoryShare'
import StoryBookmark from '@/components/story/StoryBookmark'
import { 
  Heart, 
  MessageCircle, 
  Eye, 
  Clock, 
  Calendar,
  User,
  Tag,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  Flag,
  MoreHorizontal,
  Play,
  Pause
} from 'lucide-react'
import { storiesAPI, authAPI, userAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import type { Story, User as UserType } from '@/lib/api'

export default function StoryPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [story, setStory] = useState<Story | null>(null)
  const [author, setAuthor] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [readingProgress, setReadingProgress] = useState(0)
  const [readingTime, setReadingTime] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [comments, setComments] = useState([])
  const [relatedStories, setRelatedStories] = useState<Story[]>([])

  const slug = params.slug as string

  useEffect(() => {
    if (slug) {
      loadStory()
    }
  }, [slug])

  useEffect(() => {
    // Track reading progress
    if (story && isReading) {
      const interval = setInterval(() => {
        // Simulate reading progress tracking
        setReadingProgress(prev => Math.min(prev + 1, 100))
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [story, isReading])

  const loadStory = async () => {
    try {
      setLoading(true)
      const response = await storiesAPI.getStory(slug)
      const storyData = response.data
      
      setStory(storyData)
      setLikeCount(storyData.likesCount)
      setReadingTime(storyData.readingTime || 0)

      // Load author details if not included
      if (storyData.author) {
        setAuthor(storyData.author)
      }

      // Load related stories
      if (storyData.tags.length > 0) {
        loadRelatedStories(storyData.tags, storyData.id)
      }
    } catch (error) {
      console.error('Error loading story:', error)
      router.push('/404')
    } finally {
      setLoading(false)
    }
  }

  const loadRelatedStories = async (tags: string[], excludeId: string) => {
    try {
      const response = await storiesAPI.getStories({
        tag: tags[0], // Use first tag
        limit: 4
      })
      
      const related = response.data.stories.filter(s => s.id !== excludeId)
      setRelatedStories(related)
    } catch (error) {
      console.error('Error loading related stories:', error)
    }
  }

  const handleLike = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    try {
      await storiesAPI.likeStory(story!.id)
      setIsLiked(!isLiked)
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1)
    } catch (error) {
      console.error('Error liking story:', error)
    }
  }

  const handleFollow = async () => {
    if (!user || !author) return

    try {
      await authAPI.followUser(author.id)
      // Update author follow status
      setAuthor(prev => prev ? { ...prev, isFollowing: !prev.isFollowing } : null)
    } catch (error) {
      console.error('Error following user:', error)
    }
  }

  const toggleReading = () => {
    setIsReading(!isReading)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getContentTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'story': return 'bg-blue-100 text-blue-800'
      case 'poem': return 'bg-purple-100 text-purple-800'
      case 'article': return 'bg-green-100 text-green-800'
      case 'review': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading story...</p>
        </div>
      </div>
    )
  }

  if (!story) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Story not found</h1>
          <p className="text-gray-600 mb-4">The story you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Series Navigation */}
        {story.series && (
          <div className="mb-6 p-4 bg-white rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Part of series:</p>
                <Link 
                  href={`/series/${story.series.slug}`}
                  className="text-lg font-semibold text-purple-600 hover:text-purple-700"
                >
                  {story.series.title}
                </Link>
                {story.partNumber && (
                  <p className="text-sm text-gray-500">Part {story.partNumber}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Story Header */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          {story.coverImage && (
            <div className="relative h-64 sm:h-80">
              <Image
                src={story.coverImage}
                alt={story.title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40" />
              <div className="absolute bottom-4 left-4 right-4">
                <Badge className={`mb-2 ${getContentTypeColor(story.contentType)}`}>
                  {story.contentType}
                </Badge>
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                  {story.title}
                </h1>
                {story.excerpt && (
                  <p className="text-gray-200 text-lg">{story.excerpt}</p>
                )}
              </div>
            </div>
          )}

          <div className="p-6">
            {!story.coverImage && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getContentTypeColor(story.contentType)}>
                    {story.contentType}
                  </Badge>
                  {story.mature && (
                    <Badge variant="destructive">Mature Content</Badge>
                  )}
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {story.title}
                </h1>
                {story.excerpt && (
                  <p className="text-gray-600 text-lg">{story.excerpt}</p>
                )}
              </div>
            )}

            {/* Author and Story Info */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  {author?.avatar && (
                    <Image
                      src={author.avatar}
                      alt={author.username}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <Link 
                      href={`/user/${author?.username}`}
                      className="text-lg font-semibold text-gray-900 hover:text-purple-600"
                    >
                      {author?.displayName || author?.username}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(story.publishedAt || story.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {readingTime} min read
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {story.viewsCount.toLocaleString()} views
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {user && user.id !== story.authorId && (
                  <Button variant="outline" size="sm" onClick={handleFollow}>
                    <User className="w-4 h-4 mr-1" />
                    Follow
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={toggleReading}>
                  {isReading ? (
                    <>
                      <Pause className="w-4 h-4 mr-1" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-1" />
                      Start Reading
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? 'text-red-600 border-red-600' : ''}
                >
                  <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount}
                </Button>
                
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {story.commentsCount}
                </Button>

                <StoryShare 
                  story={{
                    id: story.id,
                    title: story.title,
                    excerpt: story.excerpt,
                    slug: story.slug,
                    author: { username: author?.username || 'Unknown' }
                  }}
                />

                <StoryBookmark storyId={story.id} />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Flag className="w-4 h-4 mr-1" />
                  Report
                </Button>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Reading Progress */}
            {isReading && (
              <div className="mb-6 p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Reading Progress</span>
                  <span className="text-sm text-blue-700">{readingProgress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${readingProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Tags */}
            {story.tags.length > 0 && (
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  {story.tags.map((tag) => (
                    <Link key={tag} href={`/stories?tag=${encodeURIComponent(tag)}`}>
                      <Badge variant="outline" className="hover:bg-gray-100 cursor-pointer">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Story Content */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="prose prose-lg max-w-none">
            <div 
              className="story-content"
              dangerouslySetInnerHTML={{ __html: story.content }}
            />
          </div>
        </div>

        {/* Related Stories */}
        {relatedStories.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Related Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatedStories.map((relatedStory) => (
                <Card key={relatedStory.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      {relatedStory.coverImage && (
                        <Image
                          src={relatedStory.coverImage}
                          alt={relatedStory.title}
                          width={80}
                          height={80}
                          className="rounded object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <Link href={`/story/${relatedStory.slug}`}>
                          <h4 className="font-semibold text-gray-900 hover:text-purple-600 line-clamp-2">
                            {relatedStory.title}
                          </h4>
                        </Link>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {relatedStory.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {relatedStory.viewsCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {relatedStory.likesCount}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {relatedStory.readingTime}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}