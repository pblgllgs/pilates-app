export function extractYouTubeId(input: string): string | null {
  const m = input.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  )
  if (m) return m[1]
  return /^[A-Za-z0-9_-]{11}$/.test(input.trim()) ? input.trim() : null
}

export function isYouTubeUrl(input: string): boolean {
  return extractYouTubeId(input) !== null
}

export function toYouTubeEmbedUrl(input: string): string | null {
  const id = extractYouTubeId(input)
  if (!id) return null
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    iv_load_policy: "3",
    showinfo: "0",
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}

export function youtubeThumbnailUrl(input: string): string | null {
  const id = extractYouTubeId(input)
  return id ? `https://img.youtube.com/vi/${id}/maxresdefault.jpg` : null
}
