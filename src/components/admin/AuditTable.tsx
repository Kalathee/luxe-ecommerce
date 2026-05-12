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
import { Search, Shield, Info, Clock, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AuditLog {
  id: string
  action: string
  entityType: string
  entityId: string
  details: string | null
  ipAddress: string | null
  createdAt: string
  admin: { name: string | null; email: string | null }
}

export function AuditTable({ initialData }: { initialData: AuditLog[] }) {
  const [data] = useState(initialData)
  const [globalFilter, setGlobalFilter] = useState("")

  const columns = useMemo<ColumnDef<AuditLog>[]>(() => [
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="font-bold text-xs">{row.original.action}</span>
        </div>
      ),
    },
    {
      accessorKey: "admin.name",
      header: "Admin",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-xs">{row.original.admin.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.admin.email}</span>
        </div>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Target",
      cell: ({ row }) => (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary font-mono">
          {row.original.entityType}:{row.original.entityId.slice(0, 8)}
        </span>
      ),
    },
    {
      accessorKey: "ipAddress",
      header: "IP / Info",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
          <Globe className="h-3 w-3" />
          {row.original.ipAddress}
        </div>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Timestamp",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-muted-foreground text-[10px]">
          <Clock className="h-3 w-3" />
          {new Date(row.original.createdAt).toLocaleString()}
        </div>
      ),
    },
    {
      id: "details",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="icon" className="h-7 w-7" title={row.original.details || ""}>
            <Info className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ], [])

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="space-y-6">
      <div className="relative w-full sm:w-96">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="pl-10 rounded-xl text-xs h-9"
        />
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-secondary/30 text-muted-foreground border-b uppercase text-[9px] font-bold tracking-wider">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-6 py-3 font-bold">
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y border-b last:border-0">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-secondary/10 transition-colors">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
