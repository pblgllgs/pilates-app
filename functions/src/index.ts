import { setGlobalOptions } from "firebase-functions/v2"
import { onCall } from "firebase-functions/v2/https"
import * as admin from "firebase-admin"

setGlobalOptions({ region: process.env.FUNCTIONS_REGION || "us-central1", maxInstances: 10 })

admin.initializeApp()
const db = admin.firestore()

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
