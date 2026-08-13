// Configuración de Firebase.
// Copia este archivo a src/lib/firebase.ts y completa los valores desde la
// consola de Firebase (Project settings > General > Your apps > Web app).

import { initializeApp, type FirebaseOptions } from "firebase/app"
import { getAuth } from "firebase/auth"
import { initializeFirestore } from "firebase/firestore"
import { getFunctions } from "firebase/functions"

export const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "TU_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "TU_PROYECTO.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "TU_PROYECTO",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "TU_PROYECTO.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:000000000000:web:0000000000000000000000",
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = initializeFirestore(app, { ignoreUndefinedProperties: true })
export const functions = getFunctions(app, "us-central1")
