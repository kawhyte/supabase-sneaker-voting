import AddItemForm from "@/components/AddItemForm";

export default function Index() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-8">Product Price Tracker</h1>
      <AddItemForm />
    </main>
  );
}
