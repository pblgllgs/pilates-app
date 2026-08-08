import { toYouTubeEmbedUrl } from "@/lib/youtube"

export function VideoPlayer({
  embedUrl,
  src,
  poster,
  title,
}: {
  embedUrl?: string
  src?: string
  poster?: string
  title: string
}) {
  const youtubeEmbed = src ? toYouTubeEmbedUrl(src) : null
  const iframeSrc = embedUrl ?? youtubeEmbed
  if (iframeSrc) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl border bg-black">
        <iframe
          src={iframeSrc}
          title={title}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    )
  }
  if (src) {
    return (
      <div className="aspect-video overflow-hidden rounded-xl border bg-black">
        <video src={src} poster={poster} controls className="h-full w-full" />
      </div>
    )
  }
  return (
    <div className="aspect-video flex items-center justify-center rounded-xl border bg-muted">
      <p className="text-muted-foreground">Video en proceso de carga...</p>
    </div>
  )
}
