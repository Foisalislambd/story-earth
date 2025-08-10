import axios from 'axios'
import { API_BASE_URL } from './utils'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface User {
  id: string
  username: string
  email: string
  firstName?: string
  lastName?: string
  displayName?: string
  avatar?: string
  bio?: string
  website?: string
  location?: string
  socialLinks?: Record<string, string>
  storiesCount: number
  followersCount: number
  followingCount: number
  totalLikes: number
  totalViews: number
  isVerified: boolean
  status: 'active' | 'suspended' | 'banned' | 'deleted'
  lastActiveAt: string
  preferences: {
    notifications: {
      email: boolean
      push: boolean
      likes: boolean
      comments: boolean
      follows: boolean
      stories: boolean
    }
    privacy: {
      showEmail: boolean
      showLocation: boolean
      allowMessages: boolean
    }
  }
  createdAt: string
  updatedAt: string
}

export interface Story {
  id: string
  title: string
  content: string
  excerpt?: string
  slug: string
  coverImage?: string
  images?: string[]
  tags: string[]
  category?: string
  contentType: 'story' | 'poem' | 'article' | 'review'
  visibility: 'public' | 'unlisted' | 'private'
  isPublished: boolean
  isDraft: boolean
  publishedAt?: string
  scheduledAt?: string
  viewsCount: number
  likesCount: number
  commentsCount: number
  sharesCount: number
  bookmarksCount: number
  readingTime?: number
  language: string
  mature: boolean
  allowComments: boolean
  allowSharing: boolean
  seriesId?: string
  partNumber?: number
  collaborators?: string[]
  metadata?: Record<string, any>
  authorId: string
  author?: User
  series?: Series
  createdAt: string
  updatedAt: string
}

export interface Series {
  id: string
  title: string
  description?: string
  slug: string
  coverImage?: string
  isCompleted: boolean
  isPublished: boolean
  totalParts?: number
  estimatedParts?: number
  tags: string[]
  category?: string
  mature: boolean
  authorId: string
  author?: User
  stories?: Story[]
  storyCount?: number
  publishedStoryCount?: number
  collaborators?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface Bookmark {
  id: string
  userId: string
  storyId: string
  collectionName: string
  notes?: string
  tags?: string[]
  story?: Story
  user?: User
  createdAt: string
  updatedAt: string
}

export interface Share {
  id: string
  userId?: string
  storyId: string
  platform: 'twitter' | 'facebook' | 'linkedin' | 'reddit' | 'whatsapp' | 'telegram' | 'email' | 'copy_link' | 'other'
  ipAddress?: string
  userAgent?: string
  referrer?: string
  story?: Story
  user?: User
  createdAt: string
}

export interface ReadingProgress {
  id: string
  userId: string
  storyId: string
  progressPercentage: number
  lastPosition?: number
  timeSpent: number
  isCompleted: boolean
  completedAt?: string
  lastReadAt: string
  story?: Story
  createdAt: string
  updatedAt: string
}

export interface Comment {
  id: string
  content: string
  userId: string
  storyId: string
  parentId?: string
  author: User
  replies?: Comment[]
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  message: string
  user: User
  token: string
}

export interface StoriesResponse {
  stories: Story[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface BookmarksResponse {
  bookmarks: Bookmark[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface SeriesResponse {
  series: Series[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface UserStats {
  totalStories: number
  totalViews: number
  totalLikes: number
  totalComments: number
  totalFollowers: number
  totalFollowing: number
}

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  getProfile: () =>
    api.get<{ user: User }>('/auth/me'),
  
  updateProfile: (data: Partial<User>) =>
    api.put<{ user: User }>('/auth/profile', data),
  
  followUser: (userId: string) =>
    api.post(`/auth/follow/${userId}`),
  
  getUserByUsername: (username: string) =>
    api.get<{ user: User }>(`/auth/user/${username}`),
}

// Stories API
export const storiesAPI = {
  getStories: (params?: {
    page?: number
    limit?: number
    category?: string
    tag?: string
    search?: string
    sortBy?: 'latest' | 'popular' | 'oldest'
    contentType?: string
    visibility?: string
    mature?: boolean
  }) => api.get<StoriesResponse>('/stories', { params }),
  
  getStory: (slug: string) =>
    api.get<Story>(`/stories/${slug}`),
  
  createStory: (data: Partial<Story>) =>
    api.post<Story>('/stories', data),
  
  updateStory: (id: string, data: Partial<Story>) =>
    api.put<Story>(`/stories/${id}`, data),
  
  deleteStory: (id: string) =>
    api.delete(`/stories/${id}`),
  
  likeStory: (id: string) =>
    api.post(`/stories/${id}/like`),
  
  addComment: (id: string, data: { content: string; parentId?: string }) =>
    api.post<{ comment: Comment }>(`/stories/${id}/comments`, data),
  
  getUserStories: (params?: { page?: number; limit?: number }) =>
    api.get<StoriesResponse>('/stories/user/my-stories', { params }),

  shareStory: (data: { storyId: string; platform: string; referrer?: string }) =>
    api.post('/shares', data),

  reportStory: (storyId: string, data: { reason: string; description?: string }) =>
    api.post(`/stories/${storyId}/report`, data),
}

// Bookmarks API
export const bookmarksAPI = {
  getBookmarks: (params?: {
    page?: number
    limit?: number
    collection?: string
    search?: string
  }) => api.get<BookmarksResponse>('/bookmarks', { params }),

  getCollections: () =>
    api.get<{ collections: Array<{ name: string; count: number }> }>('/bookmarks/collections'),

  addBookmark: (data: {
    storyId: string
    collectionName?: string
    notes?: string
    tags?: string[]
  }) => api.post<Bookmark>('/bookmarks', data),

  updateBookmark: (id: string, data: {
    collectionName?: string
    notes?: string
    tags?: string[]
  }) => api.put<Bookmark>(`/bookmarks/${id}`, data),

  removeBookmark: (id: string) =>
    api.delete(`/bookmarks/${id}`),

  removeBookmarkByStory: (storyId: string) =>
    api.delete(`/bookmarks/story/${storyId}`),

  checkBookmark: (storyId: string) =>
    api.get<{ isBookmarked: boolean; bookmark?: Bookmark }>(`/bookmarks/check/${storyId}`),
}

// Series API
export const seriesAPI = {
  getSeries: (params?: {
    page?: number
    limit?: number
    category?: string
    search?: string
    sortBy?: 'latest' | 'oldest' | 'alphabetical' | 'stories'
  }) => api.get<SeriesResponse>('/series', { params }),

  getSeriesBySlug: (slug: string) =>
    api.get<Series>(`/series/${slug}`),

  createSeries: (data: {
    title: string
    description: string
    coverImage?: string
    category?: string
    tags?: string[]
    estimatedParts?: number
    mature?: boolean
  }) => api.post<Series>('/series', data),

  updateSeries: (id: string, data: Partial<Series>) =>
    api.put<Series>(`/series/${id}`, data),

  deleteSeries: (id: string) =>
    api.delete(`/series/${id}`),

  getUserSeries: (params?: { page?: number; limit?: number }) =>
    api.get<SeriesResponse>('/series/user/my-series', { params }),

  addStoryToSeries: (seriesId: string, data: { storyId: string; partNumber?: number }) =>
    api.post(`/series/${seriesId}/stories`, data),

  removeStoryFromSeries: (seriesId: string, storyId: string) =>
    api.delete(`/series/${seriesId}/stories/${storyId}`),

  reorderSeries: (seriesId: string, data: { storyOrder: Array<{ storyId: string; partNumber: number }> }) =>
    api.put(`/series/${seriesId}/reorder`, data),
}

// Shares API
export const sharesAPI = {
  recordShare: (data: { storyId: string; platform: string; referrer?: string }) =>
    api.post('/shares', data),

  getShareStats: (storyId: string) =>
    api.get(`/shares/story/${storyId}/stats`),

  getUserShareHistory: (params?: { page?: number; limit?: number }) =>
    api.get('/shares/user/history', { params }),

  getTrendingStories: (params?: { timeframe?: '1d' | '7d' | '30d'; limit?: number }) =>
    api.get('/shares/trending', { params }),

  getShareAnalytics: (params?: { timeframe?: '7d' | '30d' | '90d' }) =>
    api.get('/shares/analytics', { params }),
}

// User API
export const userAPI = {
  getUserStats: () =>
    api.get<UserStats>('/auth/stats'),

  getFollowing: (params?: { page?: number; limit?: number }) =>
    api.get('/auth/following', { params }),

  getFollowers: (params?: { page?: number; limit?: number }) =>
    api.get('/auth/followers', { params }),

  searchUsers: (params: { query: string; page?: number; limit?: number }) =>
    api.get('/auth/search', { params }),
}

export default api