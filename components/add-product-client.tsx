'use client'

import { ManualProductEntry } from './manual-product-entry'

export function AddProductClient() {
  const handleProductAdded = () => {
    // Could redirect to products list or show success
    console.log('Product added successfully!')
  }

  return <ManualProductEntry onProductAdded={handleProductAdded} />
}