import { useQuery } from "@tanstack/react-query"
import { Link } from "react-router-dom"
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
import { Plus, Pencil, Trash2, Play, Star, Clock } from "lucide-react"
import { getVideos, deleteVideo } from "@/lib/data/videos"
import { formatPrice, formatDate, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const categoryStyles: Record<string, string> = {
  Yoga: "bg-violet-500/10 text-violet-600",
  Reformer: "bg-sky-500/10 text-sky-600",
  Mat: "bg-emerald-500/10 text-emerald-600",
  Banda: "bg-amber-500/10 text-amber-600",
  Stretching: "bg-rose-500/10 text-rose-600",
}

export default function AdminVideos() {
  const { data: videos = [], refetch, isLoading } = useQuery({
    queryKey: ["admin-videos"],
    queryFn: () => getVideos(),
  })

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar el video "${title}"?`)) return
    await deleteVideo(id)
    toast.success("Video eliminado.")
    refetch()
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Videos</h1>
          <p className="text-sm text-muted-foreground">Gestiona el catálogo de clases.</p>
        </div>
        <Button asChild>
          <Link to="/admin/videos/nuevo">
            <Plus className="size-4" /> Nuevo video
          </Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Video</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Cargando...
                  </TableCell>
                </TableRow>
              ) : videos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Aún no hay videos. Sube el primero.
                  </TableCell>
                </TableRow>
              ) : (
                videos.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell className="max-w-[280px]">
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          {v.thumbnailUrl ? (
                            <img src={v.thumbnailUrl} alt="" className="h-12 w-20 rounded-lg object-cover" />
                          ) : (
                            <div className="flex h-12 w-20 items-center justify-center rounded-lg bg-muted">
                              <Play className="size-5 text-muted-foreground" />
                            </div>
                          )}
                          {v.duration ? (
                            <span className="absolute bottom-1 right-1 flex items-center gap-0.5 rounded bg-black/70 px-1 text-[10px] font-medium text-white">
                              <Clock className="size-2.5" /> {formatDuration(v.duration)}
                            </span>
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="line-clamp-1 font-medium">{v.title}</span>
                            {v.featured && (
                              <Star className="size-3.5 shrink-0 fill-amber-500 text-amber-500" />
                            )}
                          </div>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <Badge variant={v.type === "free" ? "secondary" : "default"} className="px-1.5 py-0 text-[10px]">
                              {v.type === "free" ? "Gratis" : "Pago"}
                            </Badge>
                            {v.level && (
                              <span className="text-xs text-muted-foreground">{v.level}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {v.type === "paid" && v.price != null
                        ? formatPrice(v.price, v.currency)
                        : <span className="text-muted-foreground">Gratis</span>}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("font-normal", categoryStyles[v.category] ?? "text-muted-foreground")}
                      >
                        {v.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={v.status === "published" ? "secondary" : "outline"}
                        className={
                          v.status === "published"
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }
                      >
                        {v.status === "published" ? "Publicado" : "Borrador"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(v.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-1">
                        <Button asChild variant="ghost" size="icon" title="Editar">
                          <Link to={`/admin/videos/${v.id}/editar`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Eliminar"
                          onClick={() => handleDelete(v.id, v.title)}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
