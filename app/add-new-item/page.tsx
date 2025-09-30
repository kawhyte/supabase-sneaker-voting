'use client'

import { useRouter } from 'next/navigation'
import { RedesignedSneakerForm } from '@/components/redesigned-sneaker-form'

export default function AddNewItemPage() {
  const router = useRouter()

  const handleSneakerAdded = () => {
    // Auto-redirect to dashboard after successful submission
    setTimeout(() => {
      router.push('/dashboard')
    }, 3000)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <RedesignedSneakerForm onSneakerAdded={handleSneakerAdded} />
    </div>
  )
}