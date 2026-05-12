"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Save, X, Info, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { CategoryInput } from "@/lib/validations/admin"

interface CategoryFormProps {
  initialData?: any
}

export function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState<Partial<CategoryInput>>(initialData || {
    name: "",
    slug: "",
    description: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const generateSlug = () => {
    if (!formData.name) return
    const slug = formData.name
      .toLowerCase()
      .replace(/[^\w ]+/g, "")
      .replace(/ +/g, "-")
    setFormData(prev => ({ ...prev, slug }))
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Note: We'd need an API route for categories too, but for now we'll simulate or add it
      const response = await fetch("/api/admin/categories", {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to save category")

      toast(initialData ? "Category updated" : "Category created")
      router.push("/admin/categories")
      router.refresh()
    } catch (error: any) {
      toast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-8 bg-card border rounded-2xl p-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{initialData ? "Edit Category" : "New Category"}</h2>
        <p className="text-sm text-muted-foreground">Define a collection for your products.</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium">Category Name</label>
          <Input 
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={generateSlug}
            placeholder="e.g. Footwear"
            className="h-12 rounded-xl"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Slug</label>
          <Input 
            name="slug"
            value={formData.slug}
            onChange={handleInputChange}
            className="h-12 rounded-xl font-mono text-xs"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Description</label>
          <Textarea 
            name="description"
            value={formData.description || ""}
            onChange={handleInputChange}
            placeholder="Optional description..."
            className="rounded-xl"
          />
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="flex-1 rounded-xl">
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1 rounded-xl">
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {initialData ? "Update" : "Create"}
        </Button>
      </div>
    </form>
  )
}
