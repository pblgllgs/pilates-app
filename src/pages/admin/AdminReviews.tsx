import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pagination } from "@/components/ui/pagination"
import { Stars } from "@/components/review/Stars"
import { Check, Star, X } from "lucide-react"
import { getReviews, setReviewStatus, setReviewFeatured } from "@/lib/data/reviews"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"
import type { Review } from "@/lib/types"

const PAGE_SIZE = 12

export default function AdminReviews() {
  const { data: reviews = [], refetch } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: () => getReviews(),
  })
  const [acting, setActing] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const totalPages = Math.max(1, Math.ceil(reviews.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageItems = reviews.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE)

  const run = async (id: string, fn: () => Promise<void>, message: string) => {
    setActing(id)
    try {
      await fn()
      toast.success(message)
      refetch()
    } catch {
      toast.error("No se pudo actualizar.")
    } finally {
      setActing(null)
    }
  }

  const pending = reviews.filter((r) => r.status === "pending")
  const approved = reviews.filter((r) => r.status === "approved")

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Comentarios</h1>
        <p className="text-sm text-muted-foreground">
          Aprueba los comentarios de los alumnos y elige cuáles destacar en el banner del home.
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {reviews.length === 0 ? (
          <Card className="md:col-span-2">
            <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
              Todavía no hay comentarios.
            </CardContent>
          </Card>
        ) : (
          pageItems.map((r: Review) => (
            <Card key={r.id} className={r.status === "pending" ? "border-primary/40" : undefined}>
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Stars rating={r.rating} />
                    <span className="text-sm font-medium">{r.userName}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Badge variant={r.status === "approved" ? "secondary" : "default"}>
                      {r.status === "approved" ? "Aprobado" : "Pendiente"}
                    </Badge>
                    {r.featured && (
                      <Badge variant="outline" className="gap-1 text-amber-600">
                        <Star className="size-3 fill-amber-500 text-amber-500" /> Destacado
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="mt-1 text-xs font-normal text-muted-foreground">
                  {r.videoTitle} · {formatDate(r.createdAt)}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-2">
                <p className="text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.status === "pending" ? (
                    <Button
                      size="sm"
                      onClick={() => run(r.id, () => setReviewStatus(r.id, "approved"), "Comentario aprobado.")}
                      disabled={acting === r.id}
                      className="gap-1"
                    >
                      <Check className="size-4" /> Aprobar
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant={r.featured ? "default" : "outline"}
                        onClick={() =>
                          run(r.id, () => setReviewFeatured(r.id, !r.featured), r.featured ? "Quitado del home." : "Destacado en el home.")
                        }
                        disabled={acting === r.id}
                        className="gap-1"
                      >
                        <Star className="size-4" /> {r.featured ? "Quitar" : "Destacar"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => run(r.id, () => setReviewStatus(r.id, "pending"), "Comentario ocultado.")}
                        disabled={acting === r.id}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <X className="size-4" /> Ocultar
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {reviews.length > 0 && (
        <p className="mt-4 text-sm text-muted-foreground">
          {pending.length} pendiente{pending.length === 1 ? "" : "s"} · {approved.length} aprobado{approved.length === 1 ? "" : "s"}
        </p>
      )}

      <Pagination
        page={safePage}
        totalPages={totalPages}
        totalItems={reviews.length}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
      />
    </div>
  )
}
