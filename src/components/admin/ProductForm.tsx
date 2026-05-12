"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Tag, 
  DollarSign, 
  Package, 
  Info,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/toast"
import { ProductInput } from "@/lib/validations/admin"

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  initialData?: any // Full product object for editing
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  
  const [formData, setFormData] = useState<Partial<ProductInput>>(initialData || {
    name: "",
    slug: "",
    description: "",
    price: 0,
    compareAt: null,
    inventory: 0,
    categoryId: "",
    images: [""],
    sku: "",
    isActive: true,
  })

  useEffect(() => {
    fetch("/api/admin/categories")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCategories(data)
      })
      .catch(err => console.error("Error loading categories:", err))
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value
    }))
  }

  const handleImageChange = (index: number, value: string) => {
    const newImages = [...(formData.images || [])]
    newImages[index] = value
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const addImageField = () => {
    setFormData(prev => ({ ...prev, images: [...(prev.images || []), ""] }))
  }

  const removeImageField = (index: number) => {
    if ((formData.images?.length || 0) <= 1) return
    const newImages = (formData.images || []).filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, images: newImages }))
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
      const url = initialData 
        ? `/api/admin/products/${initialData.id}` 
        : "/api/admin/products"
      const method = initialData ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok) throw new Error(result.error || "Something went wrong")

      toast(initialData ? "Product updated successfully" : "Product created successfully")
      router.push("/admin/products")
      router.refresh()
    } catch (error: any) {
      toast(error.message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {initialData ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-muted-foreground">
            {initialData ? "Make changes to your product details." : "Add a new product to your catalog."}
          </p>
        </div>
        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading} className="rounded-xl">
            <X className="mr-2 h-4 w-4" /> Cancel
          </Button>
          <Button type="submit" disabled={loading} className="rounded-xl shadow-lg shadow-primary/20">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {initialData ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Primary Info */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <Info className="h-4 w-4 text-primary" />
              General Information
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={generateSlug}
                  placeholder="e.g. Leather Travel Bag"
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
                  placeholder="leather-travel-bag"
                  className="h-12 rounded-xl font-mono text-xs"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Tell customers about your product..."
                  className="min-h-[200px] rounded-xl"
                  required
                />
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <ImageIcon className="h-4 w-4 text-primary" />
              Product Images
            </div>
            
            <div className="space-y-4">
              {formData.images?.map((url, index) => (
                <div key={index} className="flex gap-2">
                  <Input 
                    value={url}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="h-12 rounded-xl"
                    required
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeImageField(index)}
                    className="h-12 w-12 rounded-xl text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addImageField} className="w-full rounded-xl border-dashed">
                <Plus className="mr-2 h-4 w-4" /> Add Image URL
              </Button>
            </div>
          </section>
        </div>

        {/* Right Column: Pricing & Meta */}
        <div className="space-y-8">
          <section className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <DollarSign className="h-4 w-4 text-primary" />
              Pricing
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Regular Price ($)</label>
                <Input 
                  name="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Compare At Price ($)</label>
                <Input 
                  name="compareAt"
                  type="number"
                  step="0.01"
                  value={formData.compareAt || ""}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <Package className="h-4 w-4 text-primary" />
              Inventory
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">SKU (Stock Keeping Unit)</label>
                <Input 
                  name="sku"
                  value={formData.sku || ""}
                  onChange={handleInputChange}
                  placeholder="PRD-001"
                  className="h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Stock Quantity</label>
                <Input 
                  name="inventory"
                  type="number"
                  value={formData.inventory}
                  onChange={handleInputChange}
                  className="h-12 rounded-xl"
                  required
                />
              </div>
            </div>
          </section>

          <section className="bg-card border rounded-2xl p-6 space-y-6">
            <div className="flex items-center gap-2 font-semibold">
              <Tag className="h-4 w-4 text-primary" />
              Category
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Category</label>
                <select 
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors appearance-none"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  )
}
