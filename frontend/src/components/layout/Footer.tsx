import { PenTool } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <PenTool className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              © 2024 StoryShare. Share your stories with the world.
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">
              About
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}