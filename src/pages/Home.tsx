import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { VideoCard, VideoCardSkeleton } from "@/components/video/VideoCard"
import { ReviewsBanner } from "@/components/review/ReviewsBanner"
import { getRecentVideos } from "@/lib/data/videos"
import { getFeaturedReviews } from "@/lib/data/reviews"
import { PlayCircle, Sparkles, Users, Video as VideoIcon, ArrowRight } from "lucide-react"

const features = [
  {
    icon: PlayCircle,
    title: "Clases completas",
    description: "Sesiones de pilates guiadas paso a paso, de principiante a avanzado.",
  },
  {
    icon: Sparkles,
    title: "Suscripción total",
    description: "Acceso ilimitado a todas las clases con una suscripción mensual o anual.",
  },
  {
    icon: VideoIcon,
    title: "Compra por clase",
    description: "¿Solo te interesa una clase? Cómprala por separado y quédate con ella.",
  },
  {
    icon: Users,
    title: "Para todos los niveles",
    description: "Contenido adaptado a principiantes, intermedios y avanzados.",
  },
]

export default function Home() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["recent-videos"],
    queryFn: () => getRecentVideos(4),
  })

  const { data: reviews = [] } = useQuery({
    queryKey: ["featured-reviews"],
    queryFn: () => getFeaturedReviews(24),
  })

  const featured = videos?.slice(0, 4) ?? []

  return (
    <div>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary/10 via-background to-secondary" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <Badge variant="secondary" className="mb-4">
              Clases online de pilates
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Entrena pilates donde y cuando quieras
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              Clases de pilates en video con instrucción profesional. Suscríbete a todo el catálogo o compra solo las
              clases que necesites.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/videos">
                  Ver clases <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/precios">Ver precios</Link>
              </Button>
            </div>
          </div>
          <div className="relative hidden aspect-video overflow-hidden rounded-2xl border shadow-xl lg:block">
            <iframe
              className="h-full w-full"
              src="https://www.youtube-nocookie.com/embed/2mkR5LPhOC4?autoplay=1&mute=1&loop=1&playlist=2mkR5LPhOC4&rel=0&modestbranding=1&playsinline=1"
              title="Video de promoción"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
            <span className="absolute left-3 top-3 rounded-full bg-background/80 px-3 py-1 text-xs font-medium backdrop-blur">
              Video de promoción
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">¿Por qué PilatesStudio?</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="rounded-2xl border bg-card p-6">
              <f.icon className="h-8 w-8 text-primary" />
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Clases destacadas</h2>
          <Button asChild variant="ghost">
            <Link to="/videos">
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)
            : featured.map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
            <h2 className="text-center text-2xl font-bold tracking-tight sm:text-3xl">
              Comentarios de nuestros alumnos
            </h2>
            <ReviewsBanner reviews={reviews} />
          </div>
        </section>
      )}

      <section className="border-t bg-muted/40">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-14 text-center sm:px-6 md:flex-row md:text-left">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Empieza hoy mismo</h2>
            <p className="mt-2 text-muted-foreground">
              Crea tu cuenta gratis y explora nuestras clases gratuitas.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/registro">Crear cuenta gratis</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
