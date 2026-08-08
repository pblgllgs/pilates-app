import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Video, Subscription, Purchase } from "@/lib/types"

export function isSubscriptionActive(sub: Subscription | null | undefined): boolean {
  if (!sub) return false
  if (sub.status !== "active") return false
  if (sub.endDate && sub.endDate < Date.now()) return false
  return true
}

export async function getAllSubscriptions(): Promise<Subscription[]> {
  const snap = await getDocs(collection(db, "subscriptions"))
  return snap.docs.map((d) => {
    const data = d.data()
    const end = data.endDate as { toMillis?: () => number } | number | undefined
    return {
      id: d.id,
      ...data,
      endDate: typeof end === "number" ? end : (end?.toMillis?.() ?? undefined),
    } as unknown as Subscription
  })
}

export async function getActiveSubscription(uid: string): Promise<Subscription | null> {
  const q = query(collection(db, "subscriptions"), where("uid", "==", uid), where("status", "==", "active"))
  const snap = await getDocs(q)
  const subs = snap.docs.map((d) => ({ uid: d.id, ...d.data() })) as Subscription[]
  return subs.find(isSubscriptionActive) ?? null
}

export async function hasPurchasedVideo(uid: string, videoId: string): Promise<boolean> {
  const q = query(
    collection(db, "purchases"),
    where("uid", "==", uid),
    where("videoId", "==", videoId),
    where("status", "==", "approved")
  )
  const snap = await getDocs(q)
  return !snap.empty
}

export async function getUserPurchases(uid: string): Promise<Purchase[]> {
  const q = query(collection(db, "purchases"), where("uid", "==", uid), where("status", "==", "approved"))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Purchase[]
}

export async function canWatchVideo(uid: string, video: Video): Promise<boolean> {
  if (video.type === "free") return true
  if (video.type === "paid") {
    const [sub, purchased] = await Promise.all([getActiveSubscription(uid), hasPurchasedVideo(uid, video.id)])
    return isSubscriptionActive(sub) || purchased
  }
  return false
}

export async function getProfile(uid: string) {
  const snap = await getDoc(doc(db, "profiles", uid))
  return snap.exists() ? snap.data() : null
}
