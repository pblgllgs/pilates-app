import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, Crown, CreditCard, Hourglass } from "lucide-react"
import { getPlans } from "@/lib/data/plans"
import { createSubscriptionRequest, getUserRequests } from "@/lib/data/requests"
import { formatPrice } from "@/lib/format"
import { useAuth } from "@/store/auth"
import { toast } from "sonner"
import type { PurchaseRequest } from "@/lib/types"

export default function Pricing() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pendingPlan, setPendingPlan] = useState<string | null>(null)
  const [requesting, setRequesting] = useState<string | null>(null)

  const { data: plans, isLoading } = useQuery({
    queryKey: ["plans"],
    queryFn: () => getPlans({ activeOnly: true }),
  })

  useEffect(() => {
    if (!user) return
    getUserRequests(user.uid).then((requests) => {
      const sub = requests.find((r: PurchaseRequest) => r.kind === "subscription" && r.status === "pending")
      if (sub?.planId) setPendingPlan(sub.planId)
    })
  }, [user])

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      navigate("/login", { state: { from: "/precios" } })
      return
    }
    setRequesting(planId)
    try {
      await createSubscriptionRequest(user.uid, planId)
      setPendingPlan(planId)
      toast.success("Solicitud enviada. El administrador la revisará.")
    } catch {
      toast.error("No se pudo enviar la solicitud.")
    } finally {
      setRequesting(null)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="text-center">
        <Badge variant="secondary" className="mb-4">
          <Crown className="size-3.5" /> Suscripción
        </Badge>
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Elige tu plan</h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Suscríbete para acceder a todo el catálogo de clases, o compra clases individuales desde cada video.
          El pago se coordina con el administrador y se confirma manualmente.
        </p>
      </div>

      <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading
          ? Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-2xl" />)
          : plans?.map((plan) => {
              const isPending = pendingPlan === plan.id
              return (
                <Card key={plan.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2 flex items-end gap-1">
                      <span className="text-4xl font-extrabold">{formatPrice(plan.price, plan.currency)}</span>
                      <span className="mb-1 text-sm text-muted-foreground">
                        /{plan.interval === "month" ? "mes" : plan.interval === "semester" ? "semestre" : "año"}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <ul className="space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={requesting === plan.id || isPending}
                    >
                      {isPending ? (
                        <>
                          <Hourglass className="size-4" /> Solicitud pendiente
                        </>
                      ) : requesting === plan.id ? (
                        "Enviando solicitud..."
                      ) : (
                        <>
                          <CreditCard className="size-4" /> Suscribirme
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
      </div>

      {!isLoading && (!plans || plans.length === 0) && (
        <div className="mt-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">Los planes estarán disponibles pronto.</p>
        </div>
      )}

      <p className="mt-10 text-center text-sm text-muted-foreground">
        ¿Prefieres pagar solo por lo que consumes?{" "}
        <Link to="/videos" className="font-medium text-primary underline-offset-4 hover:underline">
          Compra clases por separado
        </Link>
      </p>
    </div>
  )
}
