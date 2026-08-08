import { useQuery } from "@tanstack/react-query"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getAllProfiles } from "@/lib/data/profiles"
import { getAllSubscriptions, isSubscriptionActive } from "@/lib/data/access"
import { formatDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Users, Crown, ShieldCheck } from "lucide-react"
import type { Profile, Subscription } from "@/lib/types"

function initials(p: Profile): string {
  return (p.name ?? p.email ?? "U")
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")
}

export default function AdminUsers() {
  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => getAllProfiles(),
  })

  const { data: subscriptions = [] } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => getAllSubscriptions(),
  })

  const subByUid = new Map<string, Subscription>()
  for (const sub of subscriptions) {
    const prev = subByUid.get(sub.uid)
    if (!prev || (isSubscriptionActive(sub) && !isSubscriptionActive(prev))) {
      subByUid.set(sub.uid, sub)
    }
  }

  const admins = profiles.filter((p) => p.isAdmin).length
  const withPlan = [...subByUid.values()].filter((s) => s.status === "active").length

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
        <p className="text-sm text-muted-foreground">
          {profiles.length} usuario{profiles.length === 1 ? "" : "s"} registrado{profiles.length === 1 ? "" : "s"} · {admins} administrador{admins === 1 ? "" : "es"} · {withPlan} con plan activo
        </p>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {profiles.length === 0 ? (
          <Card className="sm:col-span-2 lg:col-span-3">
            <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
              No hay usuarios registrados.
            </CardContent>
          </Card>
        ) : (
          profiles.map((p) => {
            const sub = subByUid.get(p.uid)
            const active = sub ? isSubscriptionActive(sub) : false
            return (
              <Card key={p.uid} className={p.isAdmin ? "border-primary bg-primary/5 ring-1 ring-primary/40 shadow-md" : undefined}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-12">
                      {p.fotoPerfil && <AvatarImage src={p.fotoPerfil} alt={p.name ?? p.email} />}
                      <AvatarFallback className="bg-primary/10 font-semibold">{initials(p)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("truncate font-semibold", p.isAdmin && "text-primary")}>
                          {p.name ?? "Sin nombre"}
                        </p>
                        {p.isAdmin && (
                          <Badge className="gap-1 bg-primary/15 text-primary">
                            <ShieldCheck className="size-3" /> Admin
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted-foreground">{p.email}</p>
                    </div>
                  </div>

                  <dl className="mt-4 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <dt className="flex items-center gap-1.5 text-muted-foreground">
                        <Crown className="size-3.5" /> Plan
                      </dt>
                      <dd>
                        {active ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary">
                            {sub?.planName ?? "Activo"}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sin plan</Badge>
                        )}
                      </dd>
                    </div>
                    {active && sub?.endDate && (
                      <div className="flex items-center justify-between gap-2">
                        <dt className="text-muted-foreground">Vence</dt>
                        <dd>{formatDate(sub.endDate)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Rol</dt>
                      <dd>{p.isAdmin ? "Administrador" : "Alumno"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">Registro</dt>
                      <dd>{formatDate(p.createdAt)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt className="text-muted-foreground">UID</dt>
                      <dd className="truncate text-xs" title={p.uid}>
                        {p.uid}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {profiles.length > 0 && (
        <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-4" /> Los perfiles se crean automáticamente al registrarse.
        </p>
      )}
    </div>
  )
}
