"use client"

import Link from "next/link"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"

export function Header() {
  return (
    <header className="absolute top-0 left-0 w-full z-50 bg-transparent py-6">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          
          {/* Logo (Left) */}
          <div className="flex-shrink-0">
            <Link href="/">
              <Logo />
            </Link>
          </div>

          {/* Navigation (Center) */}
          <nav className="hidden md:flex items-center gap-10 absolute left-1/2 -translate-x-1/2">
            <Link 
              href="#" 
              className="text-sm font-medium text-white hover:text-white/80 transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              href="#" 
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              Markets    
            </Link>
            <Link 
              href="#" 
              className="text-sm font-medium text-white/60 hover:text-white transition-colors"
            >
              About    
            </Link>
          </nav>

          {/* Auth (Right) */}
          <div className="flex items-center gap-6">
            <Link 
              href="#" 
              className="text-sm font-medium text-white/80 hover:text-white transition-colors hidden sm:block"
            >
              Log in
            </Link>
            <Button 
              variant="secondary" 
              className="bg-white text-black hover:bg-white/90 font-medium rounded-xl px-6 h-10"
            >
              Sign up
            </Button>
          </div>

        </div>
      </div>
    </header>
  )
}
