import { Link } from "react-router-dom"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Clock } from "lucide-react"
import type { Video } from "@/lib/types"
import { formatPrice, formatDuration } from "@/lib/format"
import { cn } from "@/lib/utils"

export function VideoCard({ video }: { video: Video }) {
  const isFree = video.type === "free"

  return (
    <Link to={`/videos/${video.id}`} className="group block">
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {video.thumbnailUrl ? (
            <img
              src={video.thumbnailUrl}
              alt={video.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary">
              <Play className="h-12 w-12 text-primary/60" />
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
              <Play className="h-5 w-5 fill-current" />
            </div>
          </div>
          <Badge
            variant={isFree ? "secondary" : "default"}
            className="absolute left-2 top-2 backdrop-blur-sm"
          >
            {isFree ? "GRATIS" : formatPrice(video.price, video.currency)}
          </Badge>
        </div>
        <CardContent className="p-4">
          <h3 className="line-clamp-1 font-semibold">{video.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{video.description}</p>
        </CardContent>
        <CardFooter className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
          <span>{video.category}</span>
          {video.duration ? (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatDuration(video.duration)}
            </span>
          ) : null}
        </CardFooter>
      </Card>
    </Link>
  )
}

export function VideoCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className={cn("aspect-video animate-pulse bg-muted")} />
      <CardContent className="p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-full animate-pulse rounded bg-muted" />
        <div className="mt-1 h-3 w-2/3 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
