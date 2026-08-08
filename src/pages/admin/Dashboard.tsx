import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { getVideos } from "@/lib/data/videos"
import { getPlans } from "@/lib/data/plans"
import { getRequests } from "@/lib/data/requests"
import { Video, Crown, Users, Hourglass } from "lucide-react"

export default function AdminDashboard() {
  const { data: videos = [] } = useQuery({ queryKey: ["admin-videos"], queryFn: () => getVideos() })
  const { data: plans = [] } = useQuery({ queryKey: ["admin-plans"], queryFn: () => getPlans() })
  const { data: pendingRequests = [] } = useQuery({
    queryKey: ["requests-pending"],
    queryFn: () => getRequests("pending"),
  })

  const published = videos.filter((v) => v.status === "published").length
  const paid = videos.filter((v) => v.type === "paid").length

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <Button asChild>
          <Link to="/admin/videos/nuevo">+ Subir video</Link>
        </Button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className={pendingRequests.length > 0 ? "border-primary/50" : undefined}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Hourglass className="size-4" /> Solicitudes pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold">{pendingRequests.length}</p>
            {pendingRequests.length > 0 && (
              <Button asChild variant="link" size="sm" className="mt-1 h-auto p-0">
                <Link to="/admin/solicitudes">Revisar ahora</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Video className="size-4" /> Videos totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold">{videos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Video className="size-4" /> Publicados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold">{published}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Crown className="size-4" /> Videos de pago
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold">{paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="size-4" /> Planes activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold">{plans.filter((p) => p.active).length}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-semibold">Accesos rápidos</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Button asChild variant="outline" className="h-auto flex-col items-start gap-2 p-6">
            <Link to="/admin/solicitudes">
              <Hourglass className="size-6" />
              <span className="text-left">
                <span className="block font-semibold">Solicitudes</span>
                <span className="text-sm text-muted-foreground">Aprobar accesos pagados</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col items-start gap-2 p-6">
            <Link to="/admin/videos">
              <Video className="size-6" />
              <span className="text-left">
                <span className="block font-semibold">Gestionar videos</span>
                <span className="text-sm text-muted-foreground">Subir, editar y publicar contenido</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col items-start gap-2 p-6">
            <Link to="/admin/planes">
              <Crown className="size-6" />
              <span className="text-left">
                <span className="block font-semibold">Gestionar planes</span>
                <span className="text-sm text-muted-foreground">Suscripciones y precios</span>
              </span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-auto flex-col items-start gap-2 p-6">
            <Link to="/admin/usuarios">
              <Users className="size-6" />
              <span className="text-left">
                <span className="block font-semibold">Usuarios</span>
                <span className="text-sm text-muted-foreground">Ver perfiles de los alumnos</span>
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
