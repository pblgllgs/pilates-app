import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/store/auth"
import { getActiveSubscription, getUserPurchases } from "@/lib/data/access"
import { getVideosByIds } from "@/lib/data/videos"
import { getUserRequests } from "@/lib/data/requests"
import { VideoCard } from "@/components/video/VideoCard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, CalendarDays, ArrowRight, ShieldCheck, Hourglass } from "lucide-react"
import { formatDate } from "@/lib/format"
import type { Subscription, PurchaseRequest } from "@/lib/types"

export default function MyContent() {
  const { user } = useAuth()
  const uid = user?.uid ?? ""

  const [sub, setSub] = useState<Subscription | null>(null)
  const [subLoading, setSubLoading] = useState(true)

  useEffect(() => {
    if (!uid) return
    getActiveSubscription(uid).then((s) => {
      setSub(s)
      setSubLoading(false)
    })
  }, [uid])

  const { data: requests = [] } = useQuery({
    queryKey: ["my-requests", uid],
    queryFn: () => getUserRequests(uid),
    enabled: !!uid,
  })

  const pendingRequests = requests.filter((r: PurchaseRequest) => r.status === "pending")

  const { data: purchases = [] } = useQuery({
    queryKey: ["my-purchases", uid],
    queryFn: () => getUserPurchases(uid),
    enabled: !!uid,
  })

  const { data: purchasedVideos = [] } = useQuery({
    queryKey: ["my-purchased-videos", purchases],
    queryFn: () => getVideosByIds(purchases.map((p) => p.videoId)),
    enabled: purchases.length > 0,
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Mis contenidos</h1>
      <p className="mt-1 text-muted-foreground">Todo lo que has comprado o que tu suscripción desbloquea.</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[340px_1fr]">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Crown className="size-5 text-primary" />
                <h2 className="font-semibold">Suscripción</h2>
              </div>
              {subLoading ? (
                <div className="mt-3 h-4 w-3/4 animate-pulse rounded bg-muted" />
              ) : sub ? (
                <div className="mt-3 space-y-3">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    <ShieldCheck className="size-3.5" /> Activa
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Plan <span className="font-medium text-foreground">{sub.planName}</span>
                  </p>
                  {sub.endDate && (
                    <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <CalendarDays className="size-4" /> Renovación: {formatDate(sub.endDate)}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">Acceso a todo el catálogo de pago.</p>
                </div>
              ) : (
                <div className="mt-3 space-y-3">
                  <p className="text-sm text-muted-foreground">No tienes una suscripción activa.</p>
                  <Button asChild size="sm">
                    <Link to="/precios">
                      Suscribirme <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="font-semibold">Compras realizadas</h2>
              <p className="mt-2 text-3xl font-extrabold">{purchases.length}</p>
              <p className="text-sm text-muted-foreground">clases compradas por separado</p>
            </CardContent>
          </Card>

          {pendingRequests.length > 0 && (
            <Card className="border-primary/40">
              <CardContent className="p-6">
                <div className="flex items-center gap-2">
                  <Hourglass className="size-5 text-primary" />
                  <h2 className="font-semibold">Solicitudes pendientes</h2>
                </div>
                <ul className="mt-3 space-y-2">
                  {pendingRequests.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                      <span className="line-clamp-1 text-muted-foreground">
                        {r.kind === "purchase" ? r.videoTitle : `Suscripción: ${r.planName}`}
                      </span>
                      <Badge variant="secondary" className="shrink-0 bg-amber-500/10 text-amber-600">
                        Pendiente
                      </Badge>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">
                  Cuando el administrador confirme tu pago, se habilitará el acceso.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">Tus clases desbloqueadas</h2>
          {purchasedVideos.length > 0 ? (
            <div className="mt-4 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {purchasedVideos.map((v) => (
                <VideoCard key={v.id} video={v} />
              ))}
            </div>
          ) : (
            <Card className="mt-4">
              <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                <p className="text-muted-foreground">Aún no tienes clases compradas.</p>
                <Button asChild variant="outline" size="sm">
                  <Link to="/videos">
                    Explorar clases <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
