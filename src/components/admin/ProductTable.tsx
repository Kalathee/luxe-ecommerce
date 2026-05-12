"use client"

import { useState, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
} from "@tanstack/react-table"
import { 
  ArrowUpDown, 
  Pencil, 
  Trash2, 
  ExternalLink,
  Plus,
  Search,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"

interface Product {
  id: string
  name: string
  slug: string
  price: number
  inventory: number
  isActive: boolean
  isArchived: boolean
  category: { name: string }
  createdAt: string
}

export function ProductTable({ initialData }: { initialData: Product[] }) {
  const [data] = useState(initialData)
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<Product>[]>(() => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Product
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          <span className="text-xs text-muted-foreground">{row.original.slug}</span>
        </div>
      ),
    },
    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) => (
        <span className="px-2 py-1 rounded-full bg-secondary text-xs font-medium">
          {row.original.category.name}
        </span>
      ),
    },
    {
      accessorKey: "price",
      header: "Price",
      cell: ({ row }) => (
        <span className="font-bold">${row.original.price.toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "inventory",
      header: "Stock",
      cell: ({ row }) => {
        const stock = row.original.inventory
        return (
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${
              stock > 10 ? "bg-emerald-500" : stock > 0 ? "bg-amber-500" : "bg-rose-500"
            }`} />
            <span>{stock}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const isArchived = row.original.isArchived
        const isActive = row.original.isActive
        return (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            isArchived 
              ? "bg-slate-500/10 text-slate-500" 
              : isActive 
                ? "bg-emerald-500/10 text-emerald-500" 
                : "bg-rose-500/10 text-rose-500"
          }`}>
            {isArchived ? "ARCHIVED" : isActive ? "ACTIVE" : "INACTIVE"}
          </span>
        )
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/admin/products/${row.original.id}`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/shop/${row.original.slug}`} target="_blank">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 rounded-xl"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button variant="outline" className="rounded-xl gap-2 flex-1 sm:flex-none">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
          <Button className="rounded-xl gap-2 flex-1 sm:flex-none" asChild>
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground border-b uppercase text-[10px] font-bold tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-4 font-bold">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y border-b last:border-0">
              {table.getRowModel().rows.map((row, i) => (
                <motion.tr 
                  key={row.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-secondary/10 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-6 py-4 bg-secondary/10">
          <div className="text-xs text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {data.length} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg h-8"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg h-8"
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
