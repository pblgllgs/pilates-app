import { useState } from "react"
import { Link } from "react-router-dom"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useAuth } from "@/store/auth"
import { getUserReview, createReview } from "@/lib/data/reviews"
import { Stars } from "@/components/review/Stars"
import { toast } from "sonner"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

export function ReviewSection({ videoId, videoTitle }: { videoId: string; videoTitle: string }) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const { data: myReview } = useQuery({
    queryKey: ["my-review", user?.uid, videoId],
    queryFn: () => getUserReview(user!.uid, videoId),
    enabled: !!user,
  })

  if (!user) {
    return (
      <div className="mt-8 rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Inicia sesión para dejar tu comentario y puntuación.{" "}
        <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Iniciar sesión
        </Link>
      </div>
    )
  }

  if (myReview) {
    return (
      <div className="mt-8 rounded-xl border bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Tu comentario</h2>
          <Stars rating={myReview.rating} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{myReview.comment}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          {myReview.status === "pending" ? "Pendiente de moderación." : "Gracias por tu opinión."}
        </p>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating < 1) {
      toast.error("Selecciona una puntuación.")
      return
    }
    if (!comment.trim()) {
      toast.error("Escribe un comentario.")
      return
    }
    setSubmitting(true)
    try {
      await createReview({ uid: user.uid, videoId, videoTitle, comment, rating })
      toast.success("Comentario enviado. Gracias por tu opinión.")
      setComment("")
      setRating(0)
      queryClient.invalidateQueries({ queryKey: ["my-review", user.uid, videoId] })
    } catch (err) {
      toast.error((err as Error).message ?? "No se pudo enviar el comentario.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-xl border bg-card p-6">
      <h2 className="font-semibold">Deja tu comentario</h2>
      <div>
        <p className="mb-1.5 text-sm text-muted-foreground">Tu puntuación</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              className="transition-transform hover:scale-110"
              aria-label={`${i} estrella${i > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "size-7",
                  (hover || rating) >= i ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"
                )}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <label htmlFor="review-comment" className="text-sm text-muted-foreground">
          Comentario
        </label>
        <Textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Qué te pareció la clase?"
          maxLength={500}
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Enviando..." : "Enviar comentario"}
      </Button>
    </form>
  )
}
