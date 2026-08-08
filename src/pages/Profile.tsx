import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth, updateProfile } from "@/store/auth"
import { uploadProfilePhoto } from "@/lib/cloudinary"
import { formatDate } from "@/lib/format"
import { toast } from "sonner"
import { Camera, Save, Mail, Calendar, Shield } from "lucide-react"

export default function Profile() {
  const { user, profile } = useAuth()
  const [name, setName] = useState(profile?.name ?? "")
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)

  const initials = (profile?.name ?? user?.email ?? "U")
    .split(/[\s@]+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("")

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const url = await uploadProfilePhoto(file)
      await updateProfile(user.uid, { fotoPerfil: url })
      toast.success("Foto de perfil actualizada.")
    } catch {
      toast.error("No se pudo subir la foto.")
    } finally {
      setUploading(false)
    }
  }

  const handleSaveName = async () => {
    if (!user) return
    setSaving(true)
    try {
      await updateProfile(user.uid, { name: name.trim() })
      toast.success("Nombre actualizado.")
    } catch {
      toast.error("No se pudo actualizar.")
    } finally {
      setSaving(false)
    }
  }

  if (!user) return null

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>
      <p className="mt-1 text-sm text-muted-foreground">Gestiona tu información personal.</p>

      {/* Foto de perfil */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-lg">Foto de perfil</CardTitle>
          <CardDescription>Sube una imagen. Se guardará automáticamente.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <div className="relative">
            <Avatar className="h-24 w-24 border-2">
              <AvatarImage src={profile?.fotoPerfil} alt="Foto de perfil" />
              <AvatarFallback className="bg-primary/10 text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <label
              htmlFor="photo"
              className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border bg-background shadow-md transition-colors hover:bg-muted"
            >
              <Camera className="size-4" />
            </label>
            <Input
              id="photo"
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={handlePhotoChange}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            {uploading ? "Subiendo foto…" : "Haz clic en el ícono de cámara para cambiar tu foto."}
          </div>
        </CardContent>
      </Card>

      {/* Datos personales */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Datos personales</CardTitle>
          <CardDescription>Puedes editar tu nombre. El email no se puede cambiar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="profile-name">Nombre</Label>
            <div className="flex gap-2">
              <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
              <Button onClick={handleSaveName} disabled={saving || name.trim() === profile?.name}>
                {saving ? <Save className="size-4" /> : <Save className="size-4" />}
                Guardar
              </Button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Email</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <Mail className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Cuenta creada</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <Calendar className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">{formatDate(profile?.createdAt)}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-muted-foreground">Rol</Label>
            <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-sm">
              <Shield className="size-4 text-muted-foreground" />
              <span className="text-muted-foreground">{profile?.isAdmin ? "Administrador" : "Alumno"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
