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
  Eye, 
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { motion } from "framer-motion"

interface Order {
  id: string
  orderNumber: string
  totalAmountCents: number
  status: string
  user: { name: string; email: string }
  _count: { items: number }
  createdAt: string
}

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-500",
  PAID: "bg-emerald-500/10 text-emerald-500",
  PROCESSING: "bg-blue-500/10 text-blue-500",
  SHIPPED: "bg-purple-500/10 text-purple-500",
  DELIVERED: "bg-emerald-500/20 text-emerald-600",
  CANCELLED: "bg-rose-500/10 text-rose-500",
  REFUNDED: "bg-slate-500/10 text-slate-500",
}

export function OrderTable({ initialData }: { initialData: Order[] }) {
  const [data] = useState(initialData)
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<Order>[]>(() => [
    {
      accessorKey: "orderNumber",
      header: "Order",
      cell: ({ row }) => <span className="font-mono font-bold">{row.original.orderNumber}</span>,
    },
    {
      accessorKey: "user.name",
      header: "Customer",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.user?.name || "Guest"}</span>
          <span className="text-xs text-muted-foreground">{row.original.user?.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      accessorKey: "totalAmountCents",
      header: "Total",
      cell: ({ row }) => (
        <span className="font-bold">${(row.original.totalAmountCents / 100).toFixed(2)}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColors[row.original.status] || ""}`}>
          {row.original.status}
        </span>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" className="h-8 gap-2 rounded-lg" asChild>
              <Link href={`/admin/orders/${row.original.id}`}>
                <Eye className="h-4 w-4" />
                Details
              </Link>
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
            placeholder="Search orders..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10 rounded-xl"
          />
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
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
            Showing {table.getRowModel().rows.length} of {data.length} orders
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
