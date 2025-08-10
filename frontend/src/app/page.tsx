'use client'

import { useEffect, useState } from 'react'
import { Story, storiesAPI } from '@/lib/api'
import StoryCard from '@/components/story/StoryCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, Clock, BookOpen, Sparkles, Users, Heart, Star, ArrowRight, Zap } from 'lucide-react'
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
      <section className="relative py-32 overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
          <div className="absolute inset-0 bg-gradient-primary opacity-10"></div>
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-300 rounded-full opacity-20 blur-3xl float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-pink-300 rounded-full opacity-20 blur-3xl float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-blue-300 rounded-full opacity-20 blur-3xl float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-white/80 backdrop-blur-sm border border-purple-200 rounded-full px-6 py-3 shadow-lg">
              <Sparkles className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Where Stories Come Alive</span>
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>

            {/* Main heading */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight">
                Share Your Stories with the{' '}
                <span className="text-gradient animate-pulse">World</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Discover amazing stories from writers around the globe. Share your own tales, 
                connect with readers, and be part of a vibrant storytelling community.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button asChild size="lg" className="text-lg px-8 py-4 h-auto bg-gradient-primary hover:shadow-glow transform hover:scale-105 transition-all duration-300">
                <Link href="/register" className="flex items-center space-x-2">
                  <span>Start Writing</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-2 hover:bg-purple-50 hover:border-purple-300 transform hover:scale-105 transition-all duration-300">
                <Link href="/discover" className="flex items-center space-x-2">
                  <Search className="h-5 w-5" />
                  <span>Explore Stories</span>
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12">
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Users className="h-8 w-8 text-purple-600" />
                  <span className="text-3xl font-bold text-gray-800">10K+</span>
                </div>
                <p className="text-gray-600 font-medium">Active Writers</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <BookOpen className="h-8 w-8 text-pink-600" />
                  <span className="text-3xl font-bold text-gray-800">50K+</span>
                </div>
                <p className="text-gray-600 font-medium">Stories Published</p>
              </div>
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <Heart className="h-8 w-8 text-red-500" />
                  <span className="text-3xl font-bold text-gray-800">1M+</span>
                </div>
                <p className="text-gray-600 font-medium">Stories Loved</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl font-bold text-gray-800">Why Choose StoryShare?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join a community that celebrates creativity and connects storytellers worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl hover-lift hover:shadow-glow-blue bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-2xl mb-6">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Instant Publishing</h3>
              <p className="text-gray-600">Share your stories with the world in seconds. No waiting, no approval process.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover-lift hover:shadow-glow-pink bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-500 rounded-2xl mb-6">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Vibrant Community</h3>
              <p className="text-gray-600">Connect with fellow writers and readers who share your passion for storytelling.</p>
            </div>
            
            <div className="text-center p-8 rounded-2xl hover-lift hover:shadow-glow bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-100">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-500 rounded-2xl mb-6">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-gray-800">Get Discovered</h3>
              <p className="text-gray-600">Our smart algorithm helps readers discover your stories based on their interests.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-16 bg-gradient-to-r from-gray-50 to-gray-100 border-y border-gray-200">
        <div className="container">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-6 lg:space-y-0">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <h2 className="text-3xl font-bold text-gray-800">Latest Stories</h2>
              <div className="flex items-center space-x-3">
                <Button
                  variant={sortBy === 'latest' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('latest')}
                  className={sortBy === 'latest' ? 'bg-gradient-primary text-white shadow-glow' : 'hover:bg-white/80'}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Latest
                </Button>
                <Button
                  variant={sortBy === 'popular' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setSortBy('popular')}
                  className={sortBy === 'popular' ? 'bg-gradient-primary text-white shadow-glow' : 'hover:bg-white/80'}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Popular
                </Button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search amazing stories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 w-80 h-12 border-2 border-gray-200 focus:border-purple-400 rounded-xl bg-white/80 backdrop-blur-sm"
                />
              </div>
              <Button type="submit" size="lg" className="h-12 px-6 bg-gradient-primary hover:shadow-glow">
                Search
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Stories Grid */}
      <section className="py-20 bg-white">
        <div className="container">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl h-80"></div>
                </div>
              ))}
            </div>
          ) : stories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-6">
                <BookOpen className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">No stories found</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm 
                  ? 'Try adjusting your search terms or browse all stories.' 
                  : 'Be the first to share a story with the community!'
                }
              </p>
              <Button asChild size="lg" className="bg-gradient-primary hover:shadow-glow">
                <Link href="/write" className="flex items-center space-x-2">
                  <span>Write the First Story</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 bg-gradient-to-br from-purple-900 via-pink-800 to-orange-700 text-white relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-yellow-300 rounded-full opacity-20 blur-3xl float" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="container relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to Share Your Story?
            </h2>
            <p className="text-xl md:text-2xl text-purple-100 leading-relaxed">
              Join thousands of writers who are sharing their creativity and connecting with readers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Button asChild size="lg" className="text-lg px-8 py-4 h-auto bg-white text-purple-900 hover:bg-gray-100 transform hover:scale-105 transition-all duration-300">
                <Link href="/register" className="flex items-center space-x-2">
                  <span>Get Started Today</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-4 h-auto border-2 border-white text-white hover:bg-white/10 transform hover:scale-105 transition-all duration-300">
                <Link href="/discover">
                  Discover Stories
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
