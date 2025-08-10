import { PenTool, Heart, Sparkles } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-purple-100 bg-gradient-to-r from-purple-50 via-white to-pink-50">
      <div className="container">
        <div className="flex flex-col md:flex-row h-auto md:h-20 items-center justify-between py-6 md:py-0 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-primary p-1.5 rounded-lg">
              <PenTool className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm text-gray-600 font-medium">
              © 2024 StoryShare. Made with{' '}
              <Heart className="inline h-3 w-3 text-red-500 mx-1" />
              for storytellers worldwide.
            </span>
            <Sparkles className="h-3 w-3 text-purple-400" />
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105">
              About
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105">
              Privacy
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105">
              Terms
            </a>
            <a href="#" className="text-gray-600 hover:text-purple-600 font-medium transition-all duration-300 hover:scale-105">
              Support
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}