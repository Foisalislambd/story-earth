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
  avatar?: string
  bio?: string
  storiesCount: number
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
  tags: string[]
  category?: string
  isPublished: boolean
  publishedAt?: string
  viewsCount: number
  likesCount: number
  commentsCount: number
  readingTime?: number
  authorId: string
  author?: User
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
    currentPage: number
    totalPages: number
    totalStories: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Auth API
export const authAPI = {
  register: (data: { username: string; email: string; password: string }) =>
    api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  getProfile: () =>
    api.get<{ user: User }>('/auth/me'),
  
  updateProfile: (data: { username?: string; bio?: string; avatar?: string }) =>
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
  }) => api.get<StoriesResponse>('/stories', { params }),
  
  getStoryBySlug: (slug: string) =>
    api.get<{ story: Story }>(`/stories/${slug}`),
  
  createStory: (data: {
    title: string
    content: string
    excerpt?: string
    coverImage?: string
    tags?: string[]
    category?: string
    isPublished?: boolean
  }) => api.post<{ story: Story }>('/stories', data),
  
  updateStory: (id: string, data: {
    title?: string
    content?: string
    excerpt?: string
    coverImage?: string
    tags?: string[]
    category?: string
    isPublished?: boolean
  }) => api.put<{ story: Story }>(`/stories/${id}`, data),
  
  deleteStory: (id: string) =>
    api.delete(`/stories/${id}`),
  
  likeStory: (id: string) =>
    api.post(`/stories/${id}/like`),
  
  addComment: (id: string, data: { content: string; parentId?: string }) =>
    api.post<{ comment: Comment }>(`/stories/${id}/comments`, data),
  
  getMyStories: (params?: { page?: number; limit?: number }) =>
    api.get<StoriesResponse>('/stories/user/my-stories', { params }),
}

export default api