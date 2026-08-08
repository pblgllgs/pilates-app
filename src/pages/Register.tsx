import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { PlayCircle } from "lucide-react"
import { registerWithEmail } from "@/store/auth"
import { toast } from "sonner"

export default function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const passwordValid = password.length >= 6
  const passwordsMatch = confirmPassword !== "" && password === confirmPassword
  const confirmInvalid = confirmPassword !== "" && !passwordsMatch
  const formValid = email.trim() !== "" && isEmailValid && passwordValid && passwordsMatch

  const greenInput = "border-green-500 focus-visible:border-green-500 focus-visible:ring-green-500/30"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isEmailValid) {
      toast.error("Ingresa un email válido.")
      return
    }
    if (password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (!passwordsMatch) {
      toast.error("Las contraseñas no coinciden.")
      return
    }
    setLoading(true)
    try {
      await registerWithEmail(email, password, name)
      navigate("/", { replace: true })
    } catch (err) {
      const code = (err as { code?: string }).code
      if (code === "auth/email-already-in-use") toast.error("Este email ya está registrado.")
      else toast.error("No se pudo crear la cuenta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:px-6">
      <div className="mb-6 flex flex-col items-center text-center">
        <PlayCircle className="h-10 w-10 text-primary" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Crea tu cuenta</h1>
        <p className="mt-1 text-sm text-muted-foreground">Empieza a entrenar pilates hoy</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tucorreo@ejemplo.com"
                className={isEmailValid ? greenInput : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={passwordsMatch ? greenInput : undefined}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Repite la contraseña</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className={confirmInvalid ? "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/30" : passwordsMatch ? greenInput : undefined}
              />
              {confirmInvalid && <p className="text-xs text-destructive">Las contraseñas no coinciden.</p>}
            </div>
            <Button type="submit" className="w-full" disabled={loading || !formValid}>
              {loading ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-muted-foreground">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
