'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, authAPI } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (username: string, email: string, password: string) => Promise<void>
  logout: () => void
  loading: boolean
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token and user on mount
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
      // Verify token is still valid
      authAPI.getProfile()
        .then(response => {
          setUser(response.data.user)
          localStorage.setItem('user', JSON.stringify(response.data.user))
        })
        .catch(() => {
          // Token is invalid, clear storage
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          setToken(null)
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await authAPI.login({ email, password })
      const { user: userData, token: userToken } = response.data

      setUser(userData)
      setToken(userToken)
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Login failed')
    }
  }

  const register = async (username: string, email: string, password: string) => {
    try {
      const response = await authAPI.register({ username, email, password })
      const { user: userData, token: userToken } = response.data

      setUser(userData)
      setToken(userToken)
      localStorage.setItem('token', userToken)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error: any) {
      throw new Error(error.response?.data?.error?.message || 'Registration failed')
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const value = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    updateUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}