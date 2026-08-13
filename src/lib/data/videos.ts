import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  limit,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Video } from "@/lib/types"

const COLLECTION = "videos"

function toVideo(d: { id: string; data: () => Record<string, unknown> }): Video {
  const data = d.data()
  const ts = data.createdAt as { toMillis?: () => number } | number | undefined
  return {
    ...(data as unknown as Video),
    id: d.id,
    createdAt: typeof ts === "number" ? ts : (ts?.toMillis?.() ?? 0),
  }
}

export async function getVideos(opts?: { type?: "free" | "paid"; category?: string; publishedOnly?: boolean }) {
  const constraints = []
  if (opts?.publishedOnly) constraints.push(where("status", "==", "published"))
  if (opts?.type) constraints.push(where("type", "==", opts.type))
  constraints.push(orderBy("createdAt", "desc"))
  const q = query(collection(db, COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map(toVideo)
}

export async function getPublishedVideos(opts?: { type?: "free" | "paid"; category?: string }) {
  return getVideos({ ...opts, publishedOnly: true })
}

export async function getVideo(id: string): Promise<Video | null> {
  const snap = await getDoc(doc(db, COLLECTION, id))
  return snap.exists() ? toVideo(snap) : null
}

export async function getCategories(): Promise<string[]> {
  const snap = await getDocs(collection(db, COLLECTION))
  const set = new Set<string>()
  snap.docs.forEach((d) => {
    const cat = d.data().category
    if (cat) set.add(cat)
  })
  return Array.from(set).sort()
}

export async function createVideo(data: Omit<Video, "id" | "createdAt">): Promise<string> {
  const ref = doc(collection(db, COLLECTION))
  await setDoc(ref, { ...data, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateVideo(id: string, data: Partial<Video>) {
  await updateDoc(doc(db, COLLECTION, id), data as Record<string, unknown>)
}

export async function deleteVideo(id: string) {
  await deleteDoc(doc(db, COLLECTION, id))
}

export async function getVideosByIds(ids: string[]): Promise<Video[]> {
  if (ids.length === 0) return []
  const results: Video[] = []
  for (const id of ids) {
    const v = await getVideo(id)
    if (v) results.push(v)
  }
  return results
}

export async function getRecentVideos(count = 4): Promise<Video[]> {
  const q = query(collection(db, COLLECTION), where("status", "==", "published"), orderBy("createdAt", "desc"), limit(count))
  const snap = await getDocs(q)
  return snap.docs.map(toVideo)
}
