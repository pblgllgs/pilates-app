import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/ui/pagination"
import { Check, X, Hourglass, CheckCircle2, XCircle, Clapperboard, Crown, Search } from "lucide-react"
import { getRequests, approveRequest, rejectRequest } from "@/lib/data/requests"
import { getAllProfiles } from "@/lib/data/profiles"
import { formatPrice, formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { PurchaseRequest, Profile } from "@/lib/types"

type Tab = "pending" | "approved" | "rejected"

function userLabel(r: PurchaseRequest, profiles: Map<string, Profile>): { name: string; photo?: string; email?: string } {
  const p = profiles.get(r.uid)
  if (p) return { name: p.name ?? p.email ?? r.uid, photo: p.fotoPerfil, email: p.email }
  return { name: r.userName ?? r.userEmail ?? r.uid, email: r.userEmail }
}

export default function AdminRequests() {
  const [tab, setTab] = useState<Tab>("pending")
  const [acting, setActing] = useState<string | null>(null)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const PAGE_SIZE = 10

  const pendingQuery = useQuery({
    queryKey: ["requests-pending"],
    queryFn: () => getRequests("pending"),
  })
  const approvedQuery = useQuery({
    queryKey: ["requests-approved"],
    queryFn: () => getRequests("approved"),
  })
  const rejectedQuery = useQuery({
    queryKey: ["requests-rejected"],
    queryFn: () => getRequests("rejected"),
  })

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getAllProfiles(),
  })
  const profilesByUid = new Map(profiles.map((p) => [p.uid, p]))

  const pending = pendingQuery.data ?? []
  const approved = approvedQuery.data ?? []
  const rejected = rejectedQuery.data ?? []
  const requests = tab === "pending" ? pending : tab === "approved" ? approved : rejected

  const q = search.trim().toLowerCase()
  const filtered = q
    ? requests.filter((r) => {
        const u = userLabel(r, profilesByUid)
        const concept = r.kind === "purchase" ? (r.videoTitle ?? "") : (r.planName ?? "")
        return (
          u.name.toLowerCase().includes(q) ||
          (u.email ?? "").toLowerCase().includes(q) ||
          concept.toLowerCase().includes(q)
        )
      })
    : requests

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const refetchAll = () => {
    pendingQuery.refetch()
    approvedQuery.refetch()
    rejectedQuery.refetch()
  }

  const handleApprove = async (req: PurchaseRequest) => {
    setActing(req.id)
    try {
      await approveRequest(req.id)
      toast.success(req.kind === "purchase" ? "Acceso otorgado." : "Suscripción activada.")
      refetchAll()
    } catch (err) {
      toast.error((err as Error).message ?? "No se pudo aprobar.")
    } finally {
      setActing(null)
    }
  }

  const handleReject = async (id: string) => {
    setActing(id)
    try {
      await rejectRequest(id)
      toast.success("Solicitud rechazada.")
      refetchAll()
    } catch {
      toast.error("No se pudo rechazar.")
    } finally {
      setActing(null)
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Solicitudes</h1>
          <p className="text-sm text-muted-foreground">
            Cuando un usuario paga, confirma aquí y se le habilita el acceso.
          </p>
        </div>
        <Tabs value={tab} onValueChange={(v) => {
          setTab(v as Tab)
          setPage(0)
        }}>
          <TabsList>
            <TabsTrigger value="pending" className="gap-1.5">
              <Hourglass className="size-3.5" /> Por aprobar ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="gap-1.5">
              <CheckCircle2 className="size-3.5" /> Aprobadas ({approved.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="gap-1.5">
              <XCircle className="size-3.5" /> Rechazadas ({rejected.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value)
            setPage(0)
          }}
          placeholder="Buscar por usuario o concepto..."
          className="pl-9"
        />
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    {search.trim()
                      ? "No hay solicitudes que coincidan con la búsqueda."
                      : `No hay solicitudes ${
                          tab === "pending" ? "por aprobar" : tab === "approved" ? "aprobadas" : "rechazadas"
                        }.`}
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="max-w-[220px]">
                      <div className="flex items-center gap-2.5">
                        {(() => {
                          const u = userLabel(r, profilesByUid)
                          const initials = u.name
                            .split(/[\s@]+/)
                            .slice(0, 2)
                            .map((s) => s[0]?.toUpperCase() ?? "")
                            .join("")
                          return (
                            <>
                              <Avatar className="size-9 shrink-0">
                                {u.photo && <AvatarImage src={u.photo} alt={u.name} />}
                                <AvatarFallback className="bg-primary/10 text-xs">{initials}</AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <span className="line-clamp-1 font-medium">{u.name}</span>
                                <span className="line-clamp-1 text-xs text-muted-foreground">{u.email ?? ""}</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[260px]">
                      <div className="flex items-start gap-2">
                        {r.kind === "purchase" ? (
                          <Clapperboard className="mt-0.5 size-4 shrink-0 text-primary" />
                        ) : (
                          <Crown className="mt-0.5 size-4 shrink-0 text-primary" />
                        )}
                        <div className="min-w-0">
                          <span className="line-clamp-2 font-medium">
                            {r.kind === "purchase" ? r.videoTitle : r.planName}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {r.kind === "purchase" ? "Compra de clase" : "Suscripción"}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {r.amount != null ? formatPrice(r.amount, r.currency ?? "CLP") : "—"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          r.status === "pending"
                            ? "bg-amber-500/10 text-amber-600"
                            : r.status === "approved"
                              ? "bg-emerald-500/10 text-emerald-600"
                              : "bg-destructive/10 text-destructive"
                        }
                      >
                        {r.status === "pending" ? "Pendiente" : r.status === "approved" ? "Aprobada" : "Rechazada"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(r.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        {r.status === "pending" ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(r)}
                              disabled={acting === r.id}
                              title="Aprobar"
                              className="gap-1"
                            >
                              <Check className="size-4" /> <span className="hidden sm:inline">Aprobar</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(r.id)}
                              disabled={acting === r.id}
                              title="Rechazar"
                              className="gap-1 text-destructive hover:text-destructive"
                            >
                              <X className="size-4" /> <span className="hidden sm:inline">Rechazar</span>
                            </Button>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            {r.decidedAt ? `Resuelta ${formatDate(r.decidedAt)}` : "—"}
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        page={safePage}
        totalPages={totalPages}
        totalItems={filtered.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}
