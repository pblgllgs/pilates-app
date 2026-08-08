import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/store/auth"
import { getVideoReviews } from "@/lib/data/reviews"
import { Stars } from "@/components/review/Stars"
import { formatDate } from "@/lib/format"

export function ReviewList({ videoId }: { videoId: string }) {
  const { user } = useAuth()
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["video-reviews", videoId],
    queryFn: () => getVideoReviews(videoId),
  })

  const visible = reviews
    .filter((r) => r.status === "approved" || (user && r.uid === user.uid))
    .sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="mt-8">
      <h2 className="font-semibold">Comentarios de la clase</h2>
      {isLoading ? (
        <p className="mt-4 text-sm text-muted-foreground">Cargando comentarios…</p>
      ) : visible.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Aún no hay comentarios. ¡Sé el primero en opinar!
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {visible.map((r) => {
            const isOwn = user && r.uid === user.uid
            return (
              <li key={r.id} className="rounded-xl border bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {r.photoUrl ? (
                      <img src={r.photoUrl} alt={r.userName} className="size-7 rounded-full object-cover" />
                    ) : (
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                        {r.userName.slice(0, 1)}
                      </span>
                    )}
                    <span className="text-sm font-medium">{r.userName}</span>
                    {isOwn && (
                      <Badge variant="outline" className="text-[10px]">
                        Tú
                      </Badge>
                    )}
                    {isOwn && r.status === "pending" && (
                      <span className="text-xs text-muted-foreground">· Pendiente de moderación</span>
                    )}
                  </div>
                  <Stars rating={r.rating} />
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground">{formatDate(r.createdAt)}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
