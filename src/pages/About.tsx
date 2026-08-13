import { useQuery } from "@tanstack/react-query"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getInstructorProfile } from "@/lib/data/instructor"
import { Award, HeartPulse, Quote } from "lucide-react"

export default function About() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ["instructor"],
    queryFn: () => getInstructorProfile(),
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <Badge variant="secondary">Nuestra instructora</Badge>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">Sobre nosotros</h1>
        <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
          Conoce a la profesional que está detrás de cada clase de HipoFit.
        </p>
      </div>

      {isLoading ? (
        <div className="mt-10 grid gap-8 md:grid-cols-[320px_1fr]">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      ) : !profile ? (
        <p className="mt-16 text-center text-muted-foreground">
          Aún no hay información disponible. Vuelve pronto.
        </p>
      ) : (
        <div className="mt-10 grid gap-8 md:grid-cols-[320px_1fr]">
          <div>
            {profile.photoUrl ? (
              <img
                src={profile.photoUrl}
                alt={profile.name}
                className="aspect-[3/4] w-full rounded-2xl border object-cover shadow-lg"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center rounded-2xl border bg-muted text-muted-foreground">
                Sin foto
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight">{profile.name}</h2>
            <p className="mt-1 text-primary">{profile.title}</p>

            {profile.experience && (
              <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                <HeartPulse className="size-4 text-primary" /> {profile.experience}
              </div>
            )}

            {profile.bio && (
              <div className="mt-5 rounded-2xl border bg-card p-5">
                <Quote className="size-5 text-primary/40" />
                <p className="mt-2 whitespace-pre-line leading-relaxed text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {profile.certifications.length > 0 && (
              <div className="mt-6">
                <h3 className="flex items-center gap-2 font-semibold">
                  <Award className="size-5 text-primary" /> Certificaciones
                </h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {profile.certifications.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
