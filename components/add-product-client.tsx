'use client'

import { AddItemForm } from './add-item-form'

export function AddProductClient() {
  const handleProductAdded = () => {
    // Could redirect to products list or show success
    console.log('Product added successfully!')
  }

  return <AddItemForm onItemAdded={handleProductAdded} mode="create" />
}