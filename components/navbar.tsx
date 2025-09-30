'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Home, Plus, BarChart3 } from 'lucide-react'

export function Navbar() {
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <nav
     
      className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/80"
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/">
            <div
        
              className="flex items-center gap-2 cursor-pointer"
            >
              <span className="text-2xl">👟</span>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Sneaker Tracker
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant={isActive('/') ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Home className="h-2 w-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>

            <Link href="/add-new-item">
              <Button
                variant={isActive('/add-new-item') ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Plus className="h-2 w-2" />
                <span className="hidden sm:inline">Add Sneaker</span>
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button
                variant={isActive('/dashboard') ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-2 w-2" />
                <span className="hidden sm:inline">Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}