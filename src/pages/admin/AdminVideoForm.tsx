import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Clapperboard } from "lucide-react"
import { getVideo, createVideo, updateVideo } from "@/lib/data/videos"
import { extractYouTubeId, isYouTubeUrl, youtubeThumbnailUrl } from "@/lib/youtube"
import { toast } from "sonner"

export default function AdminVideoForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEdit = !!id

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("")
  const [level, setLevel] = useState("")
  const [duration, setDuration] = useState("")
  const [type, setType] = useState<"free" | "paid">("free")
  const [price, setPrice] = useState("")
  const [currency, setCurrency] = useState("ARS")
  const [status, setStatus] = useState<"published" | "draft">("draft")
  const [featured, setFeatured] = useState(false)

  const [youtubeUrl, setYoutubeUrl] = useState("")
  const [playableUrl, setPlayableUrl] = useState("")
  const [thumbnailUrl, setThumbnailUrl] = useState("")

  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(isEdit)

  useEffect(() => {
    if (!isEdit) return
    getVideo(id!).then((v) => {
      if (!v) {
        toast.error("Video no encontrado.")
        navigate("/admin/videos")
        return
      }
      setTitle(v.title)
      setDescription(v.description ?? "")
      setCategory(v.category ?? "")
      setLevel(v.level ?? "")
      setDuration(v.duration ? String(v.duration) : "")
      setType(v.type)
      setPrice(v.price != null ? String(v.price) : "")
      setCurrency(v.currency ?? "ARS")
      setStatus(v.status ?? "draft")
      setFeatured(v.featured ?? false)
      setPlayableUrl(v.playableUrl ?? "")
      setThumbnailUrl(v.thumbnailUrl ?? "")
      if (v.playableUrl && isYouTubeUrl(v.playableUrl)) setYoutubeUrl(v.playableUrl)
      setLoading(false)
    })
  }, [isEdit, id, navigate])

  const handleYoutubeChange = (value: string) => {
    setYoutubeUrl(value)
    if (isYouTubeUrl(value)) {
      setPlayableUrl(value.trim())
      const thumb = youtubeThumbnailUrl(value) ?? ""
      setThumbnailUrl((current) => {
        if (!current || current.startsWith("https://img.youtube.com/vi/")) return thumb
        return current
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error("El título es obligatorio.")
      return
    }
    if (!playableUrl.trim()) {
      toast.error("Pega el enlace de YouTube o una URL de reproducción.")
      return
    }
    setSaving(true)
    try {
      const data = {
        title: title.trim(),
        description: description.trim(),
        category: category.trim() || "General",
        level,
        duration: duration ? Number(duration) : undefined,
        type,
        price: type === "paid" && price ? Number(price) : undefined,
        currency,
        status,
        featured,
        playableUrl: playableUrl.trim(),
        thumbnailUrl: thumbnailUrl.trim() || undefined,
      }
      if (isEdit) {
        await updateVideo(id!, data)
        toast.success("Video actualizado.")
      } else {
        await createVideo(data)
        toast.success("Video creado.")
      }
      navigate("/admin/videos")
    } catch {
      toast.error("No se pudo guardar el video.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">Cargando...</div>
  }

  const youtubeValid = !!extractYouTubeId(youtubeUrl)

  return (
    <div className="mx-auto max-w-3xl">
      <Button asChild variant="ghost" size="sm" className="mb-4 -ml-2 text-muted-foreground">
        <Link to="/admin/videos">
          <ArrowLeft className="size-4" /> Volver
        </Link>
      </Button>

      <h1 className="text-2xl font-bold tracking-tight">{isEdit ? "Editar video" : "Nuevo video"}</h1>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información</CardTitle>
            <CardDescription>Detalles de la clase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Pilates para principiantes - Clase 1" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Descripción</Label>
              <Textarea id="desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Describe la clase, nivel y objetivos." />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cat">Categoría</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="cat">
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yoga">Yoga</SelectItem>
                    <SelectItem value="Reformer">Reformer</SelectItem>
                    <SelectItem value="Mat">Mat</SelectItem>
                    <SelectItem value="Banda">Banda</SelectItem>
                    <SelectItem value="Stretching">Stretching</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="level">Nivel</Label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger id="level">
                    <SelectValue placeholder="Nivel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Principiante">Principiante</SelectItem>
                    <SelectItem value="Intermedio">Intermedio</SelectItem>
                    <SelectItem value="Avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dur">Duración (seg)</Label>
                <Input id="dur" type="number" min={0} value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Ej: 1800" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              <span className="flex items-center gap-2">
                <Clapperboard className="size-5 text-primary" /> Video (YouTube)
              </span>
            </CardTitle>
            <CardDescription>
              Sube el video en YouTube Studio como <strong>No listado</strong> (nadie podrá verlo sin el enlace) y pega aquí la URL o el ID.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
              <li>Entra a <strong>studio.youtube.com</strong> y sube el video.</li>
              <li>En visibilidad elige <strong>No listado</strong>.</li>
              <li>Copia el enlace del video (youtube.com/watch?v=... o youtu.be/...) y pégalo abajo.</li>
            </ol>

            <div className="space-y-2">
              <Label htmlFor="youtube">URL o ID de YouTube</Label>
              <Input
                id="youtube"
                value={youtubeUrl}
                onChange={(e) => handleYoutubeChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=XXXXX o XXXXXXXXXXX"
              />
              {youtubeUrl && (
                <p className={`text-xs ${youtubeValid ? "text-green-600" : "text-destructive"}`}>
                  {youtubeValid ? "Enlace de YouTube válido. La miniatura se obtendrá automáticamente." : "No parece un enlace de YouTube válido."}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="url">URL de reproducción (avanzado)</Label>
              <Input id="url" value={playableUrl} onChange={(e) => setPlayableUrl(e.target.value)} placeholder="Se rellena automáticamente con el enlace de YouTube, o usa una URL mp4 / iframe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="thumb">URL de miniatura</Label>
              <Input id="thumb" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://img.youtube.com/vi/XXXXX/maxresdefault.jpg" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Precio y publicación</CardTitle>
            <CardDescription>Define si la clase es gratuita o de pago.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Switch
                checked={type === "paid"}
                onCheckedChange={(checked) => setType(checked ? "paid" : "free")}
              />
              <div>
                <Label>Clase de pago</Label>
                <p className="text-xs text-muted-foreground">Si está desactivada, la clase será gratuita.</p>
              </div>
            </div>

            {type === "paid" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Precio</Label>
                  <Input id="price" type="number" min={0} step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej: 15000" />
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS (pesos)</SelectItem>
                      <SelectItem value="USD">USD (dólares)</SelectItem>
                      <SelectItem value="MXN">MXN (pesos mexicanos)</SelectItem>
                      <SelectItem value="CLP">CLP (pesos chilenos)</SelectItem>
                      <SelectItem value="PEN">PEN (soles)</SelectItem>
                      <SelectItem value="COP">COP (pesos colombianos)</SelectItem>
                      <SelectItem value="BRL">BRL (reales)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <Switch checked={featured} onCheckedChange={setFeatured} />
              <div>
                <Label>Destacado</Label>
                <p className="text-xs text-muted-foreground">Muestra el video en la sección destacados.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Estado</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "published" | "draft")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/videos")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear video"}
          </Button>
        </div>
      </form>
    </div>
  )
}
