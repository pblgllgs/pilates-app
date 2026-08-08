import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  doc,
  updateDoc,
  serverTimestamp,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Review } from "@/lib/types"
import { getVideo } from "@/lib/data/videos"
import { getProfile } from "@/lib/data/access"

const COLLECTION = "reviews"

function toReview(d: QueryDocumentSnapshot): Review {
  const data = d.data()
  const ts = data.createdAt as { toMillis?: () => number } | number | undefined
  return {
    id: d.id,
    ...data,
    createdAt: typeof ts === "number" ? ts : (ts?.toMillis?.() ?? Date.now()),
  } as Review
}

interface ReviewInput {
  uid: string
  videoId: string
  videoTitle: string
  comment: string
  rating: number
}

export async function createReview(input: ReviewInput): Promise<string> {
  const video = await getVideo(input.videoId)
  if (!video) throw new Error("Video no encontrado.")

  const existing = await getUserReview(input.uid, input.videoId)
  if (existing) throw new Error("Ya comentaste esta clase.")

  const profile = await getProfile(input.uid)
  const userName = profile?.name || profile?.email || input.uid

  const ref = await addDoc(collection(db, COLLECTION), {
    uid: input.uid,
    videoId: input.videoId,
    videoTitle: input.videoTitle || video.title,
    userName,
    comment: input.comment.trim(),
    rating: input.rating,
    status: "pending",
    featured: false,
    createdAt: serverTimestamp(),
  })
  return ref.id
}

export async function getUserReview(uid: string, videoId: string): Promise<Review | null> {
  const q = query(
    collection(db, COLLECTION),
    where("uid", "==", uid),
    where("videoId", "==", videoId),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  return toReview(snap.docs[0])
}

export async function getVideoReviews(videoId: string): Promise<Review[]> {
  const q = query(collection(db, COLLECTION), where("videoId", "==", videoId))
  const snap = await getDocs(q)
  return snap.docs.map(toReview)
}

export async function getReviews(): Promise<Review[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"))
  const snap = await getDocs(q)
  return snap.docs.map(toReview)
}

export async function getFeaturedReviews(count = 6): Promise<Review[]> {
  const q = query(
    collection(db, COLLECTION),
    where("featured", "==", true),
    where("status", "==", "approved"),
    orderBy("createdAt", "desc"),
    limit(count)
  )
  const snap = await getDocs(q)
  return snap.docs.map(toReview)
}

export async function setReviewStatus(id: string, status: "pending" | "approved"): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { status })
}

export async function setReviewFeatured(id: string, featured: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTION, id), { featured })
}
