import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  doc,
  updateDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { PurchaseRequest } from "@/lib/types"
import { getVideo } from "@/lib/data/videos"
import { getPlans } from "@/lib/data/plans"

const COLLECTION = "requests"

function toMillis(value: unknown): number | undefined {
  const ts = value as { toMillis?: () => number } | number | undefined
  if (ts == null) return undefined
  return typeof ts === "number" ? ts : ts.toMillis?.()
}

function toRequest(d: { id: string; data: () => Record<string, unknown> }): PurchaseRequest {
  const data = d.data()
  return {
    ...(data as unknown as PurchaseRequest),
    id: d.id,
    createdAt: toMillis(data.createdAt) ?? Date.now(),
    decidedAt: toMillis(data.decidedAt),
  }
}

export async function createPurchaseRequest(uid: string, videoId: string): Promise<string> {
  const video = await getVideo(videoId)
  if (!video) throw new Error("Video no encontrado.")

  const existing = await getUserRequests(uid)
  const alreadyPending = existing.find(
    (r) => r.kind === "purchase" && r.videoId === videoId && r.status === "pending"
  )
  if (alreadyPending) return alreadyPending.id

  const ref = await addDoc(collection(db, COLLECTION), {
    uid,
    kind: "purchase",
    videoId,
    videoTitle: video.title,
    amount: video.price ?? null,
    currency: video.currency ?? null,
    status: "pending",
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function createSubscriptionRequest(uid: string, planId: string): Promise<string> {
  const plans = await getPlans({ activeOnly: true })
  const plan = plans.find((p) => p.id === planId)
  if (!plan) throw new Error("Plan no encontrado.")

  const existing = await getUserRequests(uid)
  const alreadyPending = existing.find(
    (r) => r.kind === "subscription" && r.planId === planId && r.status === "pending"
  )
  if (alreadyPending) return alreadyPending.id

  const ref = await addDoc(collection(db, COLLECTION), {
    uid,
    kind: "subscription",
    planId,
    planName: plan.name,
    amount: plan.price,
    currency: plan.currency,
    status: "pending",
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getUserRequests(uid: string): Promise<PurchaseRequest[]> {
  const q = query(collection(db, COLLECTION), where("uid", "==", uid), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map(toRequest)
}

export async function getRequests(status?: "pending" | "approved" | "rejected"): Promise<PurchaseRequest[]> {
  const constraints = []
  if (status) constraints.push(where("status", "==", status))
  constraints.push(orderBy("createdAt", "desc"))
  const q = query(collection(db, COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(toRequest)
}

export async function approveRequest(id: string): Promise<void> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  if (!snap.exists()) throw new Error("Solicitud no encontrada.")
  const req = snap.data() as PurchaseRequest
  if (req.status !== "pending") throw new Error("La solicitud ya fue resuelta.")

  if (req.kind === "purchase" && req.videoId) {
    await addDoc(collection(db, "purchases"), {
      uid: req.uid,
      videoId: req.videoId,
      videoTitle: req.videoTitle ?? "Clase",
      amount: req.amount ?? null,
      currency: req.currency ?? "CLP",
      status: "approved",
      createdAt: serverTimestamp(),
    })
  } else if (req.kind === "subscription" && req.planId) {
    const plans = await getPlans()
    const plan = plans.find((p) => p.id === req.planId)
    const interval = plan?.interval ?? "month"
    const now = Date.now()
    const endDate =
      interval === "year"
        ? now + 365 * 24 * 60 * 60 * 1000
        : interval === "semester"
          ? now + 180 * 24 * 60 * 60 * 1000
          : now + 30 * 24 * 60 * 60 * 1000
    await setDoc(
      doc(db, "subscriptions", req.uid),
      {
        uid: req.uid,
        planId: req.planId,
        planName: req.planName ?? plan?.name ?? "Suscripción",
        status: "active",
        startDate: now,
        endDate,
        createdAt: serverTimestamp(),
      },
      { merge: true }
    )
  }

  await updateDoc(doc(db, COLLECTION, id), {
    status: "approved",
    decidedAt: serverTimestamp(),
  })
}

export async function rejectRequest(id: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), {
    status: "rejected",
    decidedAt: serverTimestamp(),
  })
}
