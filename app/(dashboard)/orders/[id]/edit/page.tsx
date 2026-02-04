"use client"
import { useRouter } from "next/navigation"

export default function EditOrderPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="btn-ghost">Back</button>
        <h1 className="text-2xl font-semibold">Edit Order</h1>
      </div>
      <p className="text-muted-foreground">Order ID: {id}</p>
    </div>
  )
}
