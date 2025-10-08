'use client'

import { useRouter } from 'next/navigation'
import { RedesignedItemForm } from '@/components/redesigned-item-form'

export default function AddNewItemPage() {
  const router = useRouter()

  const handleItemAdded = () => {
    // Auto-redirect to dashboard after successful submission
    // Short delay allows user to see success toast before transition
    setTimeout(() => {
      router.push('/dashboard')
    }, 100) // Minimal delay - form already waited 800ms
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RedesignedItemForm onItemAdded={handleItemAdded} />
    </div>
  )
}