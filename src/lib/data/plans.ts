import { collection, getDocs, query, where, orderBy, doc, setDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Plan } from "@/lib/types"

const COLLECTION = "plans"

export async function getPlans(opts?: { activeOnly?: boolean }): Promise<Plan[]> {
  const constraints = []
  if (opts?.activeOnly) constraints.push(where("active", "==", true))
  constraints.push(orderBy("price", "asc"))
  const q = query(collection(db, COLLECTION), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as Plan[]
}

export async function upsertPlan(id: string | undefined, data: Omit<Plan, "id">) {
  const ref = id ? doc(db, COLLECTION, id) : doc(collection(db, COLLECTION))
  await setDoc(ref, data, { merge: true })
  return ref.id
}
