import { z } from "zod"

// Product Validation
export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().positive("Price must be positive"),
  compareAt: z.number().positive().optional().nullable(),
  inventory: z.number().int().min(0, "Inventory cannot be negative"),
  categoryId: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).min(1, "At least one image is required"),
  sku: z.string().optional().nullable(),
  variants: z.array(z.any()).optional().nullable(),
})

export type ProductInput = z.infer<typeof productSchema>

// Category Validation
export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters"),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
})

export type CategoryInput = z.infer<typeof categorySchema>

// Order Status Validation
export const orderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
    "CANCELLED",
    "REFUNDED",
  ]),
})

// Image Upload Validation
export const imageUploadSchema = z.object({
  file: z.any() // Handled via FormData in route
    .refine((file) => file?.size <= 5 * 1024 * 1024, "Max file size is 5MB")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file?.type),
      "Only .jpg, .png and .webp formats are supported"
    ),
})
