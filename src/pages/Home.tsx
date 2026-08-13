import { Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { VideoCard, VideoCardSkeleton } from "@/components/video/VideoCard"
import { ReviewsBanner } from "@/components/review/ReviewsBanner"
import { getRecentVideos } from "@/lib/data/videos"
import { getFeaturedReviews } from "@/lib/data/reviews"
import { PlayCircle, Sparkles, Users, Video as VideoIcon, ArrowRight } from "lucide-react"

const features = [
  {
    icon: PlayCircle,
    title: "Clases completas",
    description: "Sesiones de hipopresivos guiadas paso a paso, de principiante a avanzado.",
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
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-8 bg-muted-foreground/60" />
              Clases online de hipopresivos
            </p>
            <h1 className="mt-6 font-display text-4xl font-normal leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Entrena hipopresivos <em className="text-primary">donde y cuando</em> quieras
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              Clases de hipopresivos en video con instrucción profesional. Suscríbete a todo el catálogo o compra solo las
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
              src="https://www.youtube-nocookie.com/embed/UOqkbqDONkA?autoplay=1&mute=1&loop=1&playlist=UOqkbqDONkA&rel=0&modestbranding=1&playsinline=1"
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

      <section className="mx-auto max-w-7xl border-t px-4 py-20 sm:px-6">
        <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
          <span className="h-px w-8 bg-muted-foreground/60" />
          Beneficios
        </p>
        <h2 className="mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl">¿Por qué HipoFit?</h2>
        <div className="mt-10 grid gap-px overflow-hidden border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <div key={f.title} className="bg-card p-7">
              <f.icon className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-display text-xl">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl border-t px-4 py-20 sm:px-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="flex items-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-8 bg-muted-foreground/60" />
              Catálogo
            </p>
            <h2 className="mt-4 font-display text-3xl font-normal tracking-tight sm:text-4xl">Clases destacadas</h2>
          </div>
          <Button asChild variant="ghost">
            <Link to="/videos">
              Ver todas <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)
            : featured.map((video) => <VideoCard key={video.id} video={video} />)}
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="border-t bg-muted/40">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
            <p className="flex items-center justify-center gap-3 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px w-8 bg-muted-foreground/60" />
              Testimonios
            </p>
            <h2 className="mt-4 text-center font-display text-3xl font-normal tracking-tight sm:text-4xl">
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
