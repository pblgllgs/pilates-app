import { setGlobalOptions } from "firebase-functions/v2"
import { onCall } from "firebase-functions/v2/https"
import { defineSecret } from "firebase-functions/params"
import * as admin from "firebase-admin"
import Groq from "groq-sdk"

setGlobalOptions({ region: process.env.FUNCTIONS_REGION || "us-central1", maxInstances: 10 })

admin.initializeApp()
const db = admin.firestore()

const groqApiKey = defineSecret("GROQ_API_KEY")

// Convierte una cuenta en administrador (usar una sola vez en desarrollo).
export const makeAdmin = onCall(async (request) => {
  const email = request.data?.email
  if (!email) throw new Error("email requerido")
  const users = await admin.auth().getUserByEmail(email)
  await db.doc(`profiles/${users.uid}`).set(
    { uid: users.uid, email, isAdmin: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  )
  return { ok: true, uid: users.uid }
})

async function buildContext(): Promise<string> {
  const [videos, plans, requests, profiles, subscriptions, purchases] = await Promise.all([
    db.collection("videos").get(),
    db.collection("plans").get(),
    db.collection("requests").get(),
    db.collection("profiles").get(),
    db.collection("subscriptions").get(),
    db.collection("purchases").get(),
  ])

  const publishedVideos = videos.docs.filter((v) => v.data().status === "published").length
  const freeVideos = videos.docs.filter((v) => v.data().type === "free").length
  const paidVideos = videos.docs.filter((v) => v.data().type === "paid").length

  const pendingRequests = requests.docs.filter((r) => r.data().status === "pending").length
  const approvedRequests = requests.docs.filter((r) => r.data().status === "approved").length
  const rejectedRequests = requests.docs.filter((r) => r.data().status === "rejected").length

  const admins = profiles.docs.filter((p) => p.data().isAdmin === true).length
  const activeSubs = subscriptions.docs.filter(
    (s) => s.data().status === "active" && (s.data().endDate?.toMillis?.() ?? Date.now()) > Date.now()
  ).length

  const videoList = videos.docs.map((v) => v.data()).map((v) => ({
    titulo: v.title,
    categoria: v.category ?? "Sin categoría",
    tipo: v.type === "free" ? "gratis" : "pago",
    estado: v.status,
    destacado: v.featured === true,
  }))

  const planList = plans.docs.map((p) => p.data()).map((p) => ({
    nombre: p.name,
    precio: p.price,
    moneda: p.currency ?? "CLP",
    intervalo: p.interval,
    activo: p.active === true,
  }))

  const pendingList = requests.docs
    .filter((r) => r.data().status === "pending")
    .map((r) => {
      const d = r.data()
      return d.kind === "purchase"
        ? { tipo: "compra", clase: d.videoTitle ?? d.videoId, monto: d.amount, moneda: d.currency }
        : { tipo: "suscripción", plan: d.planName ?? d.planId, monto: d.amount, moneda: d.currency }
    })

  return `
Datos actuales de PilatesStudio (proyecto pilates-app-98885):

RESUMEN:
- Videos: ${videos.size} totales (${publishedVideos} publicados, ${freeVideos} gratis, ${paidVideos} de pago).
- Planes de suscripción: ${plans.size} (${plans.docs.filter((p) => p.data().active === true).length} activos).
- Solicitudes: ${requests.size} totales (${pendingRequests} pendientes, ${approvedRequests} aprobadas, ${rejectedRequests} rechazadas).
- Usuarios: ${profiles.size} (${admins} administradores).
- Suscripciones activas: ${activeSubs}.
- Compras de clases: ${purchases.size}.

CATÁLOGO DE VIDEOS:
${JSON.stringify(videoList)}

PLANES:
${JSON.stringify(planList)}

SOLICITUDES PENDIENTES:
${JSON.stringify(pendingList)}
`.trim()
}

// Asistente IA (Groq). Solo lo pueden usar administradores.
export const groqAssistant = onCall(
  {
    secrets: [groqApiKey],
  },
  async (request) => {
    const data = request.data as { messages?: { role: string; content: string }[]; system?: string } | undefined

    if (!request.auth) throw new Error("Debes iniciar sesión.")
    const profile = await db.doc(`profiles/${request.auth.uid}`).get()
    if (!profile.exists || profile.data()?.isAdmin !== true) {
      throw new Error("Solo los administradores pueden usar el asistente.")
    }

    const messages = data?.messages ?? []
    if (messages.length === 0) throw new Error("No hay mensaje.")

    const client = new Groq({ apiKey: groqApiKey.value() })

    const context = await buildContext()

    const system =
      data?.system ??
      `Eres un asistente útil para administradores de PilatesStudio, una plataforma de clases de pilates online. Responde de forma clara y concisa en español. Usa los datos reales de la base de datos que se te entregan a continuación para responder sobre el catálogo, planes, usuarios o solicitudes. Si no tienes el dato exacto, indícalo.

DATOS DE LA BASE DE DATOS:
${context}`

    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: system }, ...messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))],
      max_tokens: 1024,
    })

    return { content: completion.choices[0]?.message?.content ?? "No pude generar una respuesta." }
  }
)
