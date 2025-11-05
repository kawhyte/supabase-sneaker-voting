'use client'

import { useState, useEffect } from 'react'
import { FunFactCard } from './FunFactCard'
import { generateFunFacts, type FunFact } from '@/lib/fun-facts-generator'
import { Button } from '@/components/ui/button'
import { RefreshCw } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

interface FunFactsSectionProps {
  userId: string
}

export function FunFactsSection({ userId }: FunFactsSectionProps) {
  const [facts, setFacts] = useState<FunFact[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    loadFacts()
  }, [userId])

  async function loadFacts() {
    setIsLoading(true)
    try {
      const generated = await generateFunFacts(userId, 6)
      setFacts(generated)
    } catch (error) {
      console.error('Error generating fun facts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  async function refreshFacts() {
    setIsRefreshing(true)
    try {
      const generated = await generateFunFacts(userId, 6)
      setFacts(generated)
    } catch (error) {
      console.error('Error refreshing fun facts:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  if (isLoading) {
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">Fun Facts 🎉</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-lg" />
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-12" aria-labelledby="fun-facts-title">
      <div className="flex items-center justify-between mb-6">
        <h2 id="fun-facts-title" className="text-2xl font-bold text-foreground">
          Fun Facts 🎉
        </h2>

        <Button
          onClick={refreshFacts}
          disabled={isRefreshing}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {facts.map((fact, index) => (
          <FunFactCard key={fact.id} fact={fact} index={index} />
        ))}
      </div>
    </section>
  )
}
