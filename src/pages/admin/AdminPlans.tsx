import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Check, Save, Trash2 } from "lucide-react"
import { getPlans, upsertPlan } from "@/lib/data/plans"
import { formatPrice } from "@/lib/format"
import { toast } from "sonner"
import type { Plan } from "@/lib/types"

const CURRENCIES = ["ARS", "USD", "MXN", "CLP", "PEN", "COP", "BRL"]

interface PlanDraft {
  id?: string
  name: string
  description: string
  price: string
  currency: string
  interval: "month" | "semester" | "year"
  features: string[]
  active: boolean
}

function toDraft(p: Partial<Plan> & { id?: string }): PlanDraft {
  return {
    id: p.id,
    name: p.name ?? "",
    description: p.description ?? "",
    price: p.price != null ? String(p.price) : "",
    currency: p.currency ?? "ARS",
    interval: p.interval ?? "month",
    features: [...(p.features ?? [])],
    active: p.active ?? true,
  }
}

export default function AdminPlans() {
  const { data: plans = [], refetch } = useQuery({ queryKey: ["admin-plans"], queryFn: () => getPlans() })

  const [drafts, setDrafts] = useState<PlanDraft[]>([])
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({
    name: "",
    description: "",
    price: undefined,
    currency: "ARS",
    interval: "month",
    features: [""],
    active: true,
  })

  const addDraft = () => {
    setDrafts((d) => [...d, toDraft(newPlan)])
    setNewPlan({ name: "", description: "", price: undefined, currency: "ARS", interval: "month", features: [""], active: true })
  }

  const updateDraft = (i: number, patch: Partial<PlanDraft>) => {
    setDrafts((d) => d.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  }

  const saveDraft = async (i: number) => {
    const d = drafts[i]
    if (!d.name?.trim() || !d.price) {
      toast.error("Nombre y precio son obligatorios.")
      return
    }
    await upsertPlan(d.id, {
      name: d.name.trim(),
      description: d.description ?? "",
      price: Number(d.price),
      currency: d.currency ?? "ARS",
      interval: d.interval ?? "month",
      features: (d.features ?? []).filter(Boolean),
      active: d.active ?? true,
    })
    toast.success("Plan guardado.")
    setDrafts((list) => list.filter((_, idx) => idx !== i))
    refetch()
  }

  const deleteDraft = (i: number) => setDrafts((d) => d.filter((_, idx) => idx !== i))

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight">Planes de suscripción</h1>
      <p className="mt-1 text-sm text-muted-foreground">Estos planes se cobran con Mercado Pago (suscripciones).</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                <Badge variant={plan.active ? "secondary" : "outline"}>{plan.active ? "Activo" : "Inactivo"}</Badge>
              </div>
              <CardDescription className="line-clamp-2">{plan.description}</CardDescription>
              <div className="mt-2 text-2xl font-extrabold">
                {formatPrice(plan.price, plan.currency)}
                <span className="text-sm font-normal text-muted-foreground">
                  /{plan.interval === "month" ? "mes" : plan.interval === "semester" ? "semestre" : "año"}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {plan.features.slice(0, 4).map((f) => (
                  <li key={f} className="flex items-start gap-1.5 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-3.5 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => {
                  setDrafts((d) => [...d, toDraft({ ...plan, id: plan.id })])
                }}
              >
                Editar
              </Button>
            </CardFooter>
          </Card>
        ))}

        <Card className="flex flex-col items-center justify-center border-dashed p-6 text-center">
          <Plus className="h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">Agrega un nuevo plan</p>
          <Button variant="outline" size="sm" className="mt-3" onClick={addDraft}>
            + Nuevo plan
          </Button>
        </Card>
      </div>

      {drafts.map((d, i) => (
        <Card key={i} className="mt-6 border-primary/40">
          <CardHeader>
            <CardTitle>{d.id ? `Editar: ${d.name || "Sin nombre"}` : "Nuevo plan"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Nombre</Label>
                <Input value={d.name ?? ""} onChange={(e) => updateDraft(i, { name: e.target.value })} placeholder="Ej: Premium" />
              </div>
              <div className="space-y-2">
                <Label>Descripción</Label>
                <Input value={d.description ?? ""} onChange={(e) => updateDraft(i, { description: e.target.value })} placeholder="Ej: Acceso a todas las clases" />
              </div>
              <div className="space-y-2">
                <Label>Precio</Label>
                <Input type="number" min={0} value={d.price} onChange={(e) => updateDraft(i, { price: e.target.value })} placeholder="Ej: 20000" />
              </div>
              <div className="space-y-2">
                <Label>Moneda</Label>
                <select
                  className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
                  value={d.currency ?? "ARS"}
                  onChange={(e) => updateDraft(i, { currency: e.target.value })}
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Periodo</Label>
                <select
                  className="flex h-9 w-full rounded-lg border bg-background px-3 text-sm"
                  value={d.interval ?? "month"}
                  onChange={(e) => updateDraft(i, { interval: e.target.value as "month" | "semester" | "year" })}
                >
                  <option value="month">Mensual</option>
                  <option value="semester">Semestral</option>
                  <option value="year">Anual</option>
                </select>
              </div>
              <div className="flex items-end pb-1">
                <div className="flex items-center gap-2">
                  <Switch checked={d.active ?? true} onCheckedChange={(v) => updateDraft(i, { active: v })} />
                  <Label>Activo</Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Beneficios (uno por línea)</Label>
              <TextareaList value={d.features ?? []} onChange={(features) => updateDraft(i, { features })} />
            </div>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => deleteDraft(i)}>
              <Trash2 className="size-4 text-destructive" /> Descartar
            </Button>
            <Button size="sm" onClick={() => saveDraft(i)}>
              <Save className="size-4" /> Guardar plan
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

function TextareaList({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const setItem = (i: number, v: string) => onChange(value.map((f, idx) => (idx === i ? v : f)))
  const add = () => onChange([...value, ""])
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-2">
      {value.map((f, i) => (
        <div key={i} className="flex gap-2">
          <Input value={f} onChange={(e) => setItem(i, e.target.value)} placeholder="Ej: Acceso ilimitado a todas las clases" />
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add}>
        <Plus className="size-4" /> Agregar beneficio
      </Button>
    </div>
  )
}
