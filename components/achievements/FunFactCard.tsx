'use client'

import { motion } from 'framer-motion'
import { FunFact } from '@/lib/fun-facts-generator'
import { Button } from '@/components/ui/button'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface FunFactCardProps {
  fact: FunFact
  index: number
}

export function FunFactCard({ fact, index }: FunFactCardProps) {
  const categoryColors: Record<string, string> = {
    personality: 'from-purple-100 to-purple-200 border-purple-300',
    'hidden-gem': 'from-teal-100 to-teal-200 border-teal-300',
    brand: 'from-blue-100 to-blue-200 border-blue-300',
    color: 'from-pink-100 to-pink-200 border-pink-300',
    seasonal: 'from-orange-100 to-orange-200 border-orange-300',
    value: 'from-green-100 to-green-200 border-green-300',
    creativity: 'from-indigo-100 to-indigo-200 border-indigo-300',
    pattern: 'from-gray-100 to-gray-200 border-gray-300',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.3 }}
      className={`bg-gradient-to-br ${categoryColors[fact.category]} border-2 rounded-lg p-6 flex flex-col`}
    >
      {/* Emoji */}
      <div className="text-5xl mb-3">{fact.emoji}</div>

      {/* Title */}
      <h3 className="text-lg font-bold text-foreground mb-2">{fact.title}</h3>

      {/* Message */}
      <p className="text-sm text-muted-foreground flex-1 mb-4">{fact.message}</p>

      {/* Action Button */}
      {fact.actionLabel && fact.actionLink && (
        <Button asChild variant="outline" size="sm" className="w-full">
          <Link href={fact.actionLink} className="gap-2">
            {fact.actionLabel}
            <ExternalLink className="h-3 w-3" />
          </Link>
        </Button>
      )}
    </motion.div>
  )
}
