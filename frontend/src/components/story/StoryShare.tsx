'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Reddit,
  MessageCircle,
  Mail,
  Copy,
  Check,
  ExternalLink
} from 'lucide-react'
import { sharesAPI } from '@/lib/api'

interface StoryShareProps {
  story: {
    id: string
    title: string
    excerpt?: string
    slug: string
    author: {
      username: string
    }
  }
  trigger?: React.ReactNode
  className?: string
}

const SHARE_PLATFORMS = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-blue-500 hover:bg-blue-600 text-white',
    getUrl: (story: any, url: string) => {
      const text = `"${story.title}" by ${story.author.username}`
      return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600 hover:bg-blue-700 text-white',
    getUrl: (story: any, url: string) => {
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-blue-700 hover:bg-blue-800 text-white',
    getUrl: (story: any, url: string) => {
      const title = `${story.title} by ${story.author.username}`
      const summary = story.excerpt || ''
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
    }
  },
  {
    id: 'reddit',
    name: 'Reddit',
    icon: Reddit,
    color: 'bg-orange-500 hover:bg-orange-600 text-white',
    getUrl: (story: any, url: string) => {
      const title = `${story.title} by ${story.author.username}`
      return `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
    }
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-500 hover:bg-green-600 text-white',
    getUrl: (story: any, url: string) => {
      const text = `Check out this story: "${story.title}" by ${story.author.username} ${url}`
      return `https://wa.me/?text=${encodeURIComponent(text)}`
    }
  },
  {
    id: 'email',
    name: 'Email',
    icon: Mail,
    color: 'bg-gray-600 hover:bg-gray-700 text-white',
    getUrl: (story: any, url: string) => {
      const subject = `Check out: ${story.title}`
      const body = `I thought you might enjoy this story:\n\n"${story.title}" by ${story.author.username}\n\n${story.excerpt || ''}\n\nRead it here: ${url}`
      return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    }
  }
]

export default function StoryShare({ story, trigger, className = '' }: StoryShareProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const storyUrl = `${window.location.origin}/story/${story.slug}`

  const handleShare = async (platform: string) => {
    try {
      // Record the share
      await sharesAPI.recordShare({
        storyId: story.id,
        platform,
        referrer: window.location.href
      })

      // Get platform URL
      const platformData = SHARE_PLATFORMS.find(p => p.id === platform)
      if (platformData) {
        const shareUrl = platformData.getUrl(story, storyUrl)
        window.open(shareUrl, '_blank', 'width=600,height=400,scrollbars=yes,resizable=yes')
      }
    } catch (error) {
      console.error('Error recording share:', error)
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(storyUrl)
      setCopied(true)
      
      // Record the copy action
      await sharesAPI.recordShare({
        storyId: story.id,
        platform: 'copy_link',
        referrer: window.location.href
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying link:', error)
    }
  }

  const triggerButton = trigger || (
    <Button variant="outline" size="sm">
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  )

  return (
    <div className={`relative ${className}`}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {triggerButton}
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Share menu */}
          <div className="absolute bottom-full mb-2 right-0 bg-white rounded-lg shadow-lg border p-4 z-50 min-w-[300px]">
            <div className="mb-3">
              <h3 className="font-semibold text-gray-900 mb-1">Share this story</h3>
              <p className="text-sm text-gray-500 truncate">{story.title}</p>
            </div>

            {/* Platform buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {SHARE_PLATFORMS.map((platform) => {
                const Icon = platform.icon
                return (
                  <Button
                    key={platform.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(platform.id)}
                    className={`justify-start h-10 ${platform.color}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {platform.name}
                  </Button>
                )
              })}
            </div>

            {/* Copy link */}
            <div className="border-t pt-3">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 rounded px-3 py-2 text-sm text-gray-600 truncate">
                  {storyUrl}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyLink}
                  className="shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Native sharing (if supported) */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <div className="border-t pt-3 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await (navigator as any).share({
                        title: story.title,
                        text: story.excerpt,
                        url: storyUrl
                      })
                      
                      // Record native share
                      await sharesAPI.recordShare({
                        storyId: story.id,
                        platform: 'other',
                        referrer: window.location.href
                      })
                    } catch (error) {
                      console.error('Error sharing:', error)
                    }
                  }}
                  className="w-full"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  More sharing options
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}