'use client'

import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { PenTool, LogOut, User, Home, Search, Sparkles } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="border-b border-purple-100 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 sticky top-0 z-50 shadow-sm">
      <div className="container">
        <div className="flex h-20 items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-10">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-primary rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative bg-gradient-primary p-2 rounded-xl">
                  <PenTool className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                StoryShare
              </span>
              <Sparkles className="h-4 w-4 text-purple-400 opacity-60" />
            </Link>
            
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/" 
                className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-purple-600 transition-all duration-300 hover:scale-105"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link 
                href="/discover" 
                className="flex items-center space-x-2 text-sm font-semibold text-gray-600 hover:text-purple-600 transition-all duration-300 hover:scale-105"
              >
                <Search className="h-4 w-4" />
                <span>Discover</span>
              </Link>
            </nav>
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Button asChild variant="ghost" size="sm" className="hidden sm:flex h-10 px-6 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200 hover:border-purple-300 text-purple-700 font-semibold transition-all duration-300">
                  <Link href="/write" className="flex items-center space-x-2">
                    <PenTool className="h-4 w-4" />
                    <span>Write</span>
                  </Link>
                </Button>
                
                <div className="flex items-center space-x-3">
                  <Button asChild variant="ghost" size="sm" className="h-10 px-4 hover:bg-purple-50 transition-all duration-300">
                    <Link href="/profile" className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center">
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <span className="font-semibold text-gray-700 hidden sm:block">{user.username}</span>
                    </Link>
                  </Button>
                  
                  <Button 
                    onClick={logout} 
                    variant="ghost" 
                    size="sm"
                    className="h-10 w-10 p-0 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-300"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Button asChild variant="ghost" size="sm" className="h-10 px-6 font-semibold text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-300">
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="h-10 px-6 bg-gradient-primary hover:shadow-glow transform hover:scale-105 transition-all duration-300 font-semibold">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}