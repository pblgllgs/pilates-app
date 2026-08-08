import { collection, getDocs, type DocumentData, type QueryDocumentSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Profile } from "@/lib/types"

const COLLECTION = "profiles"

function toProfile(d: QueryDocumentSnapshot<DocumentData>): Profile {
  const data = d.data()
  const ts = data.createdAt as { toMillis?: () => number } | number | undefined
  return {
    id: d.id,
    ...data,
    createdAt: typeof ts === "number" ? ts : (ts?.toMillis?.() ?? 0),
  } as Profile
}

export async function getAllProfiles(): Promise<Profile[]> {
  const snap = await getDocs(collection(db, COLLECTION))
  return snap.docs
    .map((d) => toProfile(d as QueryDocumentSnapshot<DocumentData>))
    .sort((a, b) => b.createdAt - a.createdAt)
}
