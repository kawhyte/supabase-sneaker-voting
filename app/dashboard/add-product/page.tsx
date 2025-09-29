import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { AddProductClient } from '@/components/add-product-client'

export default async function AddProductPage() {
  let user = null;

  try {
    const supabase = await createClient()
    if (supabase) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()
      user = authUser;
    }
  } catch (error) {
    console.error('Auth error:', error);
  }

  // For now, skip auth redirect to test the form
  // if (!user) {
  //   return redirect('/login')
  // }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Add New Product
          </h1>
          <p className="text-lg text-gray-600">
            Manually add a sneaker to your tracking system
          </p>
        </div>

        <AddProductClient />

        <div className="mt-8 text-center">
          <a
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}