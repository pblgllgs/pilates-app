import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { VideoCard, VideoCardSkeleton } from "@/components/video/VideoCard"
import { getPublishedVideos, getCategories } from "@/lib/data/videos"
import type { Video } from "@/lib/types"

type Filter = "all" | "free" | "paid"

export default function Videos() {
  const [filter, setFilter] = useState<Filter>("all")
  const [category, setCategory] = useState("all")

  const { data: videos, isLoading } = useQuery({
    queryKey: ["published-videos"],
    queryFn: () => getPublishedVideos(),
  })
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  })

  const filtered = (videos ?? []).filter((v: Video) => {
    if (filter !== "all" && v.type !== filter) return false
    if (category !== "all" && v.category !== category) return false
    return true
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Clases</h1>
        <p className="text-muted-foreground">Explora nuestro catálogo. Clases gratis y de pago.</p>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="free">Gratis</TabsTrigger>
            <TabsTrigger value="paid">De pago</TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las categorías</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : filtered.map((video) => <VideoCard key={video.id} video={video} />)}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="mt-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">No hay clases que coincidan con tu búsqueda.</p>
        </div>
      )}
    </div>
  )
}
