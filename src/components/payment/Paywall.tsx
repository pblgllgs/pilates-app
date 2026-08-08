import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Lock, ShoppingCart, Crown, Hourglass, CheckCircle2 } from "lucide-react"
import type { Video, PurchaseRequest } from "@/lib/types"
import { formatPrice } from "@/lib/format"
import { createPurchaseRequest, getUserRequests } from "@/lib/data/requests"
import { toast } from "sonner"
import { useAuth } from "@/store/auth"

export function Paywall({ video }: { video: Video }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pending, setPending] = useState<PurchaseRequest | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!user) {
      setChecking(false)
      return
    }
    getUserRequests(user.uid)
      .then((requests) => {
        const found = requests.find((r) => r.kind === "purchase" && r.videoId === video.id)
        if (found && found.status === "pending") setPending(found)
      })
      .finally(() => setChecking(false))
  }, [user, video.id])

  const goToLogin = () => navigate("/login", { state: { from: `/videos/${video.id}` } })

  const handleRequest = async () => {
    if (!user) return goToLogin()
    setLoading(true)
    try {
      await createPurchaseRequest(user.uid, video.id)
      const requests = await getUserRequests(user.uid)
      setPending(requests.find((r) => r.kind === "purchase" && r.videoId === video.id) ?? null)
      toast.success("Solicitud enviada. El administrador la revisará.")
    } catch {
      toast.error("No se pudo enviar la solicitud.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          {pending ? <Hourglass className="h-8 w-8 text-primary" /> : <Lock className="h-8 w-8 text-primary" />}
        </div>

        {pending ? (
          <>
            <div>
              <h3 className="text-xl font-bold">Solicitud pendiente</h3>
              <p className="mt-1 text-muted-foreground">
                Ya enviaste tu solicitud para esta clase. El administrador la revisará y, cuando confirme tu pago,
                tendrás acceso automáticamente.
              </p>
            </div>
            <Button size="lg" disabled className="w-full max-w-sm">
              <Hourglass className="size-4" /> Pendiente de aprobación
            </Button>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-bold">Contenido exclusivo</h3>
              <p className="mt-1 text-muted-foreground">
                Esta clase es de pago. Solicita el acceso y el administrador te lo confirmará cuando recibas tu pago.
              </p>
            </div>

            {video.price != null && (
              <div className="text-3xl font-extrabold">{formatPrice(video.price, video.currency)}</div>
            )}

            <div className="flex w-full max-w-sm flex-col gap-3">
              <Button size="lg" onClick={handleRequest} disabled={loading || checking}>
                <ShoppingCart className="size-4" />
                {loading ? "Enviando solicitud..." : checking ? "Verificando..." : "Solicitar acceso a esta clase"}
              </Button>
              <Button size="lg" variant="secondary" onClick={() => navigate("/precios")}>
                <Crown className="size-4" />
                Ver suscripción por todo el catálogo
              </Button>
            </div>
          </>
        )}

        <p className="flex items-center gap-1 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5" /> El acceso se habilita cuando el administrador confirma tu pago
        </p>

        {!user && (
          <p className="text-sm">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Inicia sesión
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
