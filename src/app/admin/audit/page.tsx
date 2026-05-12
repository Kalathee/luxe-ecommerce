import { prisma } from "@/lib/prisma"
import { AuditTable } from "@/components/admin/AuditTable"

async function getAuditLogs() {
  const logs = await prisma.adminAuditLog.findMany({
    include: {
      admin: { select: { name: true, email: true } }
    },
    orderBy: { createdAt: "desc" },
    take: 100
  })

  return logs.map(log => ({
    ...log,
    createdAt: log.createdAt.toISOString(),
    details: log.details ? JSON.stringify(log.details, null, 2) : null
  }))
}

export default async function AdminAuditPage() {
  const logs = await getAuditLogs()

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">Track all administrative actions and system changes.</p>
      </div>

      <AuditTable initialData={logs as any} />
    </div>
  )
}
