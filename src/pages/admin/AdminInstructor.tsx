import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { getInstructorProfile, saveInstructorProfile } from "@/lib/data/instructor"
import { uploadProfilePhoto } from "@/lib/cloudinary"
import { toast } from "sonner"
import { Camera, Save, Plus, Trash2 } from "lucide-react"

export default function AdminInstructor() {
  const { data: profile, refetch } = useQuery({
    queryKey: ["instructor"],
    queryFn: () => getInstructorProfile(),
  })

  const [name, setName] = useState("")
  const [title, setTitle] = useState("")
  const [bio, setBio] = useState("")
  const [experience, setExperience] = useState("")
  const [certifications, setCertifications] = useState<string[]>([""])
  const [photoUrl, setPhotoUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile) return
    setName(profile.name ?? "")
    setTitle(profile.title ?? "")
    setBio(profile.bio ?? "")
    setExperience(profile.experience ?? "")
    setCertifications(profile.certifications?.length ? [...profile.certifications] : [""])
    setPhotoUrl(profile.photoUrl ?? "")
  }, [profile])

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadProfilePhoto(file)
      setPhotoUrl(url)
      toast.success("Foto subida. Guarda para aplicar los cambios.")
    } catch {
      toast.error("No se pudo subir la foto.")
    } finally {
      setUploading(false)
    }
  }

  const setCert = (i: number, v: string) =>
    setCertifications((c) => c.map((x, idx) => (idx === i ? v : x)))
  const addCert = () => setCertifications((c) => [...c, ""])
  const removeCert = (i: number) =>
    setCertifications((c) => (c.length === 1 ? [""] : c.filter((_, idx) => idx !== i)))

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("El nombre es obligatorio.")
      return
    }
    setSaving(true)
    try {
      await saveInstructorProfile({
        name: name.trim(),
        title: title.trim(),
        bio: bio.trim(),
        experience: experience.trim(),
        certifications: certifications.map((c) => c.trim()).filter(Boolean),
        photoUrl: photoUrl.trim() || undefined,
      })
      toast.success("Perfil de la instructora guardado.")
      refetch()
    } catch {
      toast.error("No se pudo guardar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Nuestra instructora</h1>
        <p className="text-sm text-muted-foreground">
          Edita la información que se muestra en la página "Nosotros".
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Foto</CardTitle>
          <CardDescription>Sube una foto de la instructora.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="relative">
              {photoUrl ? (
                <img src={photoUrl} alt="Instructora" className="h-28 w-24 rounded-xl border object-cover" />
              ) : (
                <div className="flex h-28 w-24 items-center justify-center rounded-xl border bg-muted text-muted-foreground">
                  Sin foto
                </div>
              )}
              <label
                htmlFor="photo"
                className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border bg-background shadow-md transition-colors hover:bg-muted"
              >
                <Camera className="size-3.5" />
              </label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploading}
                onChange={handlePhoto}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {uploading ? "Subiendo foto…" : "Haz clic en la cámara para cambiar la foto."}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Información</CardTitle>
          <CardDescription>Datos que se muestran en "Nosotros".</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej: Valentina Rojas" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Título / cargo</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Instructora certificada de Hipopresivos" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp">Experiencia</Label>
            <Input id="exp" value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="Ej: +10 años de experiencia" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Biografía</Label>
            <Textarea id="bio" rows={5} value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Cuenta la historia y enfoque de la instructora..." />
          </div>
          <div className="space-y-2">
            <Label>Certificaciones</Label>
            <div className="space-y-2">
              {certifications.map((c, i) => (
                <div key={i} className="flex gap-2">
                  <Input value={c} onChange={(e) => setCert(i, e.target.value)} placeholder="Ej: Certificación en Gimnasia Hipopresiva" />
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeCert(i)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addCert}>
              <Plus className="size-4" /> Agregar certificación
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} disabled={saving || uploading}>
          <Save className="size-4" /> {saving ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </div>
  )
}
