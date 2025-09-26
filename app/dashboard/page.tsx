import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ProductCard from "@/components/ProductCard";

export default async function Dashboard() {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: items, error } = await supabase
    .from("items")
    .select("*, store_links(last_price)");

  if (error) {
    console.error("Error fetching items:", error);
    return <div>Error fetching items.</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">My Tracked Items</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items?.map((item) => (
          <ProductCard
            key={item.id}
            // @ts-ignore
            imageUrl={item.image_url}
            title={item.title}
            // @ts-ignore
            price={item.store_links[0]?.last_price}
          />
        ))}
      </div>
    </div>
  );
}