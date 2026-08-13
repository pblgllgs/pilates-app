import { doc, getDoc, setDoc, serverTimestamp, type DocumentData } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { InstructorProfile } from "@/lib/types"

const COLLECTION = "nosotros"
const DOC_ID = "instructora"

function toProfile(data: DocumentData): InstructorProfile {
  const ts = data.updatedAt as { toMillis?: () => number } | number | undefined
  return {
    id: DOC_ID,
    ...data,
    updatedAt: typeof ts === "number" ? ts : (ts?.toMillis?.() ?? Date.now()),
  } as InstructorProfile
}

export async function getInstructorProfile(): Promise<InstructorProfile | null> {
  const snap = await getDoc(doc(db, COLLECTION, DOC_ID))
  if (!snap.exists()) return null
  return toProfile(snap.data())
}

export async function saveInstructorProfile(data: Omit<InstructorProfile, "id" | "updatedAt">): Promise<void> {
  await setDoc(
    doc(db, COLLECTION, DOC_ID),
    {
      ...data,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  )
}
