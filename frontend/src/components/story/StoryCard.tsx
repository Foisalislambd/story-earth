import Link from 'next/link'
import { Story } from '@/lib/api'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { formatDate, formatReadingTime, truncateText } from '@/lib/utils'
import { Heart, MessageCircle, Eye, User } from 'lucide-react'

interface StoryCardProps {
  story: Story
}

export default function StoryCard({ story }: StoryCardProps) {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
      <div className="relative">
        {story.coverImage && (
          <div className="aspect-video relative overflow-hidden rounded-t-lg">
            <img
              src={story.coverImage}
              alt={story.title}
              className="object-cover w-full h-full"
            />
          </div>
        )}
        
        {story.category && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-medium">
            {story.category}
          </span>
        )}
      </div>

      <CardContent className="p-6">
        <div className="space-y-3">
          <Link href={`/story/${story.slug}`}>
            <h3 className="text-xl font-semibold hover:text-primary transition-colors line-clamp-2">
              {story.title}
            </h3>
          </Link>
          
          <p className="text-muted-foreground text-sm line-clamp-3">
            {story.excerpt || truncateText(story.content, 150)}
          </p>
          
          {story.tags && story.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {story.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded"
                >
                  #{tag}
                </span>
              ))}
              {story.tags.length > 3 && (
                <span className="text-xs text-muted-foreground">
                  +{story.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="px-6 pb-6 pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {story.author?.avatar ? (
              <img
                src={story.author.avatar}
                alt={story.author.username}
                className="w-6 h-6 rounded-full"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                <User className="w-3 h-3" />
              </div>
            )}
            <div className="text-sm">
              <Link
                href={`/user/${story.author?.username}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {story.author?.username}
              </Link>
              <div className="text-muted-foreground text-xs">
                {formatDate(story.publishedAt || story.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Heart className="w-3 h-3" />
              <span>{story.likesCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageCircle className="w-3 h-3" />
              <span>{story.commentsCount}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{story.viewsCount}</span>
            </div>
            {story.readingTime && (
              <span>{formatReadingTime(story.readingTime)}</span>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}