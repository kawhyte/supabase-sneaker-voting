import { Metadata } from 'next'
import { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Achievements | PurrView',
  description:
    'Explore your wardrobe statistics, achievements, and personal style insights. Track your spending, wardrobe growth, and get personalized recommendations.',
  openGraph: {
    title: 'My Wardrobe Achievements',
    description: 'Check out my style stats and wardrobe insights on PurrView!',
    type: 'website',
    url: '/achievements',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Wardrobe Achievements',
    description: 'Check out my style stats on PurrView!',
  },
}

export default function AchievementsLayout({ children }: { children: ReactNode }) {
  return children
}
