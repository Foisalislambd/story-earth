'use client'

import { useEffect, useState } from 'react'
import { Story, storiesAPI } from '@/lib/api'
import StoryCard from '@/components/story/StoryCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, Clock, BookOpen } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'oldest'>('latest')

  useEffect(() => {
    loadStories()
  }, [sortBy])

  const loadStories = async () => {
    try {
      setLoading(true)
      const response = await storiesAPI.getStories({
        limit: 12,
        sortBy,
        search: searchTerm || undefined
      })
      setStories(response.data.stories)
    } catch (error) {
      console.error('Error loading stories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadStories()
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 via-transparent to-secondary/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl font-bold tracking-tight">
              Share Your Stories with the{' '}
              <span className="text-primary">World</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Discover amazing stories from writers around the globe. Share your own tales, 
              connect with readers, and be part of a vibrant storytelling community.
            </p>
            <div className="flex items-center justify-center space-x-4">
              <Button asChild size="lg" className="text-lg px-8">
                <Link href="/register">Start Writing</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8">
                <Link href="/discover">Explore Stories</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <h2 className="text-2xl font-semibold">Latest Stories</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant={sortBy === 'latest' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('latest')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Latest
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('popular')}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Popular
                </Button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-12">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-64"></div>
                </div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No stories found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all stories.' 
                  : 'Be the first to share a story with the community!'
                }
              </p>
              <Button asChild>
                <Link href="/write">Write the First Story</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h2 className="text-3xl font-bold">Ready to Share Your Story?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of writers who are sharing their creativity and connecting with readers worldwide.
            </p>
            <Button asChild size="lg">
              <Link href="/register">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
