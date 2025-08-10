'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Bookmark, 
  BookmarkCheck,
  Plus,
  Tag,
  X,
  Folder,
  Heart
} from 'lucide-react'
import { bookmarksAPI } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface StoryBookmarkProps {
  storyId: string
  className?: string
  variant?: 'icon' | 'button'
  size?: 'sm' | 'md' | 'lg'
}

interface BookmarkCollection {
  name: string
  count: number
}

export default function StoryBookmark({ 
  storyId, 
  className = '', 
  variant = 'button',
  size = 'md'
}: StoryBookmarkProps) {
  const { user } = useAuth()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [bookmark, setBookmark] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [collections, setCollections] = useState<BookmarkCollection[]>([])
  const [loading, setLoading] = useState(false)

  // Form state
  const [selectedCollection, setSelectedCollection] = useState('Default')
  const [notes, setNotes] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (user) {
      checkBookmarkStatus()
      loadCollections()
    }
  }, [storyId, user])

  const checkBookmarkStatus = async () => {
    try {
      const response = await bookmarksAPI.checkBookmark(storyId)
      setIsBookmarked(response.data.isBookmarked)
      if (response.data.bookmark) {
        setBookmark(response.data.bookmark)
        setSelectedCollection(response.data.bookmark.collectionName || 'Default')
        setNotes(response.data.bookmark.notes || '')
        setTags(response.data.bookmark.tags || [])
      }
    } catch (error) {
      console.error('Error checking bookmark status:', error)
    }
  }

  const loadCollections = async () => {
    try {
      const response = await bookmarksAPI.getCollections()
      setCollections(response.data.collections)
    } catch (error) {
      console.error('Error loading collections:', error)
    }
  }

  const handleBookmark = async () => {
    if (!user) {
      // Redirect to login or show login modal
      return
    }

    if (isBookmarked) {
      // Remove bookmark
      try {
        setLoading(true)
        await bookmarksAPI.removeBookmarkByStory(storyId)
        setIsBookmarked(false)
        setBookmark(null)
        setNotes('')
        setTags([])
        setSelectedCollection('Default')
      } catch (error) {
        console.error('Error removing bookmark:', error)
      } finally {
        setLoading(false)
      }
    } else {
      // Show form to add bookmark
      setShowForm(true)
    }
  }

  const handleSaveBookmark = async () => {
    try {
      setLoading(true)
      
      if (bookmark) {
        // Update existing bookmark
        const response = await bookmarksAPI.updateBookmark(bookmark.id, {
          collectionName: selectedCollection,
          notes,
          tags
        })
        setBookmark(response.data)
      } else {
        // Create new bookmark
        const response = await bookmarksAPI.addBookmark({
          storyId,
          collectionName: selectedCollection,
          notes,
          tags
        })
        setBookmark(response.data)
        setIsBookmarked(true)
      }
      
      setShowForm(false)
      await loadCollections() // Refresh collections
    } catch (error) {
      console.error('Error saving bookmark:', error)
    } finally {
      setLoading(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  if (!user) {
    return null
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const buttonSizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-2'
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleBookmark}
        disabled={loading}
        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${className}`}
        title={isBookmarked ? 'Remove bookmark' : 'Bookmark story'}
      >
        {isBookmarked ? (
          <BookmarkCheck className={`${sizeClasses[size]} text-blue-600`} />
        ) : (
          <Bookmark className={`${sizeClasses[size]} text-gray-500 hover:text-blue-600`} />
        )}
      </button>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <Button
        variant={isBookmarked ? "default" : "outline"}
        size="sm"
        onClick={handleBookmark}
        disabled={loading}
        className={buttonSizeClasses[size]}
      >
        {isBookmarked ? (
          <>
            <BookmarkCheck className={`${sizeClasses[size]} mr-2`} />
            Bookmarked
          </>
        ) : (
          <>
            <Bookmark className={`${sizeClasses[size]} mr-2`} />
            Bookmark
          </>
        )}
      </Button>

      {/* Bookmark Form Modal */}
      {showForm && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50" 
            onClick={() => setShowForm(false)}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">
                    {bookmark ? 'Edit Bookmark' : 'Save to Bookmarks'}
                  </h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Collection Selection */}
                  <div>
                    <Label htmlFor="collection">Collection</Label>
                    <select
                      id="collection"
                      value={selectedCollection}
                      onChange={(e) => setSelectedCollection(e.target.value)}
                      className="w-full mt-1 p-2 border rounded-md"
                    >
                      <option value="Default">Default</option>
                      {collections
                        .filter(c => c.name !== 'Default')
                        .map((collection) => (
                          <option key={collection.name} value={collection.name}>
                            {collection.name} ({collection.count})
                          </option>
                        ))
                      }
                    </select>
                    <div className="mt-2">
                      <Input
                        placeholder="Or create new collection"
                        value=""
                        onChange={(e) => setSelectedCollection(e.target.value)}
                        className="text-sm"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes">Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add your thoughts about this story..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="mt-1 min-h-[80px]"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags (optional)</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        placeholder="Add tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addTag()}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addTag}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => removeTag(tag)}
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                            <X className="w-3 h-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveBookmark}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : (bookmark ? 'Update' : 'Save')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}