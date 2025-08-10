import Link from 'next/link'
import { Story } from '@/lib/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatDate, formatReadingTime, truncateText } from '@/lib/utils'
import { Heart, MessageCircle, Eye, User, Clock } from 'lucide-react'

interface StoryCardProps {
  story: Story
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="h-full hover-lift group overflow-hidden rounded-2xl border-0 shadow-lg hover:shadow-2xl bg-white">
      <div className="relative">
        {story.coverImage ? (
          <div className="aspect-[4/3] relative overflow-hidden">
            <img
              src={story.coverImage}
              alt={story.title}
              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
          </div>
        ) : (
          <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100 relative">
            <div className="absolute inset-0 bg-gradient-primary opacity-20"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl opacity-30">📖</div>
            </div>
          </div>
        )}
        
        {story.category && (
          <span className="absolute top-4 left-4 bg-gradient-primary text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg backdrop-blur-sm">
            {story.category}
          </span>
        )}

        {/* Reading time indicator */}
        {story.readingTime && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-700 text-xs px-2 py-1 rounded-full flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{formatReadingTime(story.readingTime)}</span>
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <Link href={`/story/${story.slug}`}>
            <h3 className="text-xl font-bold hover:text-transparent hover:bg-clip-text hover:bg-gradient-primary transition-all duration-300 line-clamp-2 leading-tight">
              {story.title}
            </h3>
          </Link>
          
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {story.excerpt || truncateText(story.content, 150)}
          </p>
          
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {story.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs px-2.5 py-1 rounded-full font-medium border border-purple-200"
                >
                  #{tag}
                </span>
              ))}
              {story.tags.length > 3 && (
                <span className="text-xs text-gray-500 font-medium">
                  +{story.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            {story.author?.avatar ? (
              <img
                src={story.author.avatar}
                alt={story.author.username}
                className="w-8 h-8 rounded-full ring-2 ring-purple-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="text-sm">
              <Link
                href={`/user/${story.author?.username}`}
                className="font-semibold text-gray-800 hover:text-purple-600 transition-colors"
              >
                {story.author?.username}
              </Link>
              <div className="text-gray-500 text-xs">
                {formatDate(story.publishedAt || story.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <div className="flex items-center space-x-1 hover:text-red-500 transition-colors">
              <Heart className="w-3.5 h-3.5" />
              <span className="font-medium">{story.likesCount}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-blue-500 transition-colors">
              <MessageCircle className="w-3.5 h-3.5" />
              <span className="font-medium">{story.commentsCount}</span>
            </div>
            <div className="flex items-center space-x-1 hover:text-green-500 transition-colors">
              <Eye className="w-3.5 h-3.5" />
              <span className="font-medium">{story.viewsCount}</span>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}