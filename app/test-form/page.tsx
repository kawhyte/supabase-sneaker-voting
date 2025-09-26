import { ManualProductEntry } from '@/components/manual-product-entry'

export default function TestFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🚀 Test Manual Entry Form
          </h1>
          <p className="text-lg text-gray-600">
            Phase 1A - Ultra-simple product entry
          </p>
        </div>

        <ManualProductEntry />

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Running on http://localhost:3002/test-form</p>
        </div>
      </div>
    </div>
  )
}