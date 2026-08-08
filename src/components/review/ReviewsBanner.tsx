import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight, Quote } from "lucide-react"
import { Stars } from "@/components/review/Stars"
import { cn } from "@/lib/utils"
import type { Review } from "@/lib/types"

const ROTATE_MS = 7000
const PAGE_SIZE = 4

export function ReviewsBanner({ reviews }: { reviews: Review[] }) {
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const pageCount = Math.ceil(reviews.length / PAGE_SIZE)

  useEffect(() => {
    if (paused || pageCount <= 1) return
    timer.current = setInterval(() => {
      setPage((p) => (p + 1) % pageCount)
    }, ROTATE_MS)
    return () => {
      if (timer.current) clearInterval(timer.current)
    }
  }, [paused, pageCount])

  if (reviews.length === 0) return null

  const go = (p: number) => setPage(((p % pageCount) + pageCount) % pageCount)

  const start = page * PAGE_SIZE
  const current = reviews.slice(start, start + PAGE_SIZE)

  // Rellenar a PAGE_SIZE para mantener el layout consistente
  while (current.length < PAGE_SIZE) {
    current.push(undefined as unknown as Review)
  }

  return (
    <div
      className="relative mx-auto mt-8 max-w-6xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div key={page} className="grid animate-in fade-in duration-500 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {current.map((r, i) => (
          <figure
            key={`slot-${page}-${i}`}
            className={cn(
              "relative overflow-hidden rounded-2xl border bg-card p-4 shadow-sm flex-shrink-0",
              !r && "invisible"
            )}
          >
            {r && (
              <>
                <div className="absolute top-3 right-3">
                  <Quote className="size-6 text-primary/15" />
                </div>
                <Stars rating={r.rating} />
                <blockquote className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  &ldquo;{r.comment}&rdquo;
                </blockquote>
                <figcaption className="mt-3 flex items-center gap-2">
                  {r.photoUrl ? (
                    <img src={r.photoUrl} alt={r.userName} className="size-8 rounded-full object-cover" />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold">
                      {r.userName.slice(0, 1)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-semibold">{r.userName}</p>
                    <p className="text-xs text-muted-foreground">{r.videoTitle}</p>
                  </div>
                </figcaption>
              </>
            )}
          </figure>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Comentarios anteriores"
            onClick={() => go(page - 1)}
            className="rounded-full border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
          >
            <ChevronLeft className="size-4" />
          </button>
          <div className="flex items-center gap-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Ir a la página ${i + 1}`}
                onClick={() => go(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === page ? "w-6 bg-primary" : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                )}
              />
            ))}
          </div>
          <button
            type="button"
            aria-label="Comentarios siguientes"
            onClick={() => go(page + 1)}
            className="rounded-full border bg-background p-2 shadow-sm transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
