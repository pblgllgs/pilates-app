import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { getVideo } from "@/lib/data/videos"
import { canWatchVideo, isSubscriptionActive, getActiveSubscription } from "@/lib/data/access"
import { useAuth } from "@/store/auth"
import { VideoPlayer } from "@/components/video/VideoPlayer"
import { Paywall } from "@/components/payment/Paywall"
import { ReviewSection } from "@/components/review/ReviewSection"
import { ReviewList } from "@/components/review/ReviewList"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Clock, Lock, Crown } from "lucide-react"
import { formatPrice, formatDuration } from "@/lib/format"

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [access, setAccess] = useState<boolean | null>(null)

  const { data: video, isLoading } = useQuery({
    queryKey: ["video", id],
    queryFn: () => getVideo(id ?? ""),
    enabled: !!id,
  })

  useEffect(() => {
    let active = true
    if (!video || video.type === "free") {
      if (active) setAccess(video ? true : null)
      return
    }
    if (!user) {
      setAccess(false)
      return
    }
    canWatchVideo(user.uid, video).then((ok) => {
      if (active) setAccess(ok)
    })
    return () => {
      active = false
    }
  }, [video, user])

  if (isLoading || !video) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Skeleton className="aspect-video w-full rounded-xl" />
        <Skeleton className="mt-6 h-8 w-1/2" />
        <Skeleton className="mt-3 h-4 w-2/3" />
      </div>
    )
  }

  const paid = video.type === "paid"
  const isEmbed = video.playableUrl?.includes("embed") ?? false

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
        <Link to="/videos">
          <ArrowLeft className="size-4" /> Volver a clases
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          {access ? (
            <VideoPlayer
              embedUrl={isEmbed ? video.playableUrl : undefined}
              src={!isEmbed ? video.playableUrl : undefined}
              poster={video.thumbnailUrl}
              title={video.title}
            />
          ) : (
            <div className="relative overflow-hidden rounded-xl border">
              {video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={video.title} className="aspect-video w-full object-cover blur-md" />
              ) : (
                <div className="aspect-video w-full bg-muted" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
                <div className="flex flex-col items-center gap-3 text-white">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
                    <Lock className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-semibold">Clase bloqueada</p>
                </div>
              </div>
            </div>
          )}

          <h1 className="mt-6 text-2xl font-bold tracking-tight sm:text-3xl">{video.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Badge variant={paid ? "default" : "secondary"}>{paid ? formatPrice(video.price, video.currency) : "GRATIS"}</Badge>
            <span>{video.category}</span>
            {video.level && <span>· {video.level}</span>}
            {video.duration && (
              <span className="flex items-center gap-1">
                · <Clock className="size-3.5" /> {formatDuration(video.duration)}
              </span>
            )}
          </div>

          <p className="mt-5 whitespace-pre-line text-muted-foreground">{video.description}</p>

          {access && <ReviewSection videoId={video.id} videoTitle={video.title} />}

          <ReviewList videoId={video.id} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          {paid && !access ? <Paywall video={video} /> : <AccessCard paid={paid} />}
        </aside>
      </div>
    </div>
  )
}

function AccessCard({ paid }: { paid: boolean }) {
  const { user, profile } = useAuth()
  const [sub, setSub] = useState<{ active: boolean } | null>(null)

  useEffect(() => {
    if (!user) return
    getActiveSubscription(user.uid).then((s) => setSub({ active: isSubscriptionActive(s) }))
  }, [user])

  if (!user) {
    return (
      <div className="rounded-xl border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Inicia sesión para ver tu acceso.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-6">
      <h3 className="font-semibold">Tu acceso</h3>
      {!paid && <p className="text-sm text-muted-foreground">Esta clase es gratuita para todos.</p>}
      {sub?.active && (
        <div className="flex items-center gap-2 text-sm">
          <Crown className="size-4 text-primary" /> Tienes una suscripción activa. ¡Disfruta de la clase!
        </div>
      )}
      {profile?.isAdmin && <p className="text-sm text-muted-foreground">Eres administrador.</p>}
      {paid && !sub?.active && !profile?.isAdmin && (
        <p className="text-sm text-muted-foreground">
          Compraste esta clase o tu suscripción te da acceso al catálogo completo.
        </p>
      )}
    </div>
  )
}
