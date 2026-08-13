import { create } from "zustand"
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import type { Profile } from "@/lib/types"

interface AuthState {
  user: User | null
  profile: Profile | null
  loading: boolean
  initialized: boolean
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  refreshProfile: () => Promise<void>
}

async function getOrCreateProfile(user: User): Promise<Profile> {
  const ref = doc(db, "profiles", user.uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    const data = snap.data()
    const ts = data.createdAt as { toMillis?: () => number } | number | undefined
    return {
      ...(data as Profile),
      createdAt: typeof ts === "number" ? ts : (ts?.toMillis?.() ?? Date.now()),
    }
  }
  const profile: Profile = {
    uid: user.uid,
    email: user.email ?? "",
    name: user.displayName ?? undefined,
    isAdmin: false,
    createdAt: Date.now(),
    fotoPerfil: user.photoURL ?? undefined,
  }
  await setDoc(ref, { ...profile, createdAt: serverTimestamp() })
  return profile
}

export async function registerWithEmail(
  email: string,
  password: string,
  name?: string
): Promise<void> {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  if (cred.user) {
    await setDoc(doc(db, "profiles", cred.user.uid), {
      uid: cred.user.uid,
      email: cred.user.email ?? "",
      name: name ?? null,
      isAdmin: false,
      createdAt: serverTimestamp(),
      fotoPerfil: null,
    })
  }
}

export async function updateProfile(uid: string, patch: { name?: string; fotoPerfil?: string }): Promise<void> {
  const ref = doc(db, "profiles", uid)
  const data: Record<string, unknown> = {}
  if (patch.name !== undefined) data.name = patch.name
  if (patch.fotoPerfil !== undefined) data.fotoPerfil = patch.fotoPerfil
  await setDoc(ref, data, { merge: true })
  await useAuth.getState().refreshProfile()
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,
  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),
  refreshProfile: async () => {
    const { user } = useAuth.getState()
    if (!user) return
    const profile = await getOrCreateProfile(user)
    set({ profile })
  },
}))

export function initAuth() {
  onAuthStateChanged(auth, async (user) => {
    const { setUser, setProfile, initialized } = useAuth.getState()
    setUser(user)
    if (user) {
      try {
        const profile = await getOrCreateProfile(user)
        setProfile(profile)
      } catch {
        setProfile(null)
      }
    } else {
      setProfile(null)
    }
    if (!initialized) useAuth.setState({ initialized: true })
  })
}

export async function loginWithEmail(email: string, password: string) {
  await signInWithEmailAndPassword(auth, email, password)
}

export async function loginWithGoogle() {
  await signInWithPopup(auth, new GoogleAuthProvider())
}

export async function logout() {
  await signOut(auth)
}
