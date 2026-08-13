# Patrón de Proyecto — Familia Firebase (Vite + React + Firebase)

> Documento de referencia para agentes de IA. Aplica a proyectos **React (Vite) + Firebase**
> (Auth + Firestore + opcional Cloud Functions). Referencias reales: `E:\frontend\box`,
> `E:\frontend\pilates`, `E:\frontend\programa-rv`.
> Variantes: **JS** (`*.jsx`, Tailwind v3, deploy Docker/nginx) y **TS** (Tailwind v4 + React Query,
> deploy Firebase Hosting + Functions).

---

## 1. Resumen en una línea

**Vite + React** como frontend, **Firebase** (Auth + Firestore + opcional Functions) como backend
sin servidor, datos protegidos por **Firestore Security Rules**, y deploy vía **Firebase Hosting**
o **Docker/nginx** según el proyecto.

- Idioma de la UI: **Español (Chile)**. Sin comentarios salvo que se pidan.
- Configuración de Firebase desde **variables de entorno** (`VITE_FIREBASE_*`), nunca hardcodeada.
- Placeholders: `<proyecto>`, `<entidad>`.

---

## 2. Stack (probado)

```jsonc
// dependencies típicas
"firebase": "^10/11",
"react", "react-dom", "react-router-dom",
// opcional según proyecto:
"@tanstack/react-query", "zustand", "sonner", "lucide-react", "date-fns"

// devDependencies
"@tailwindcss/vite" (v4) | "tailwindcss" + "postcss" (v3),
"@vitejs/plugin-react", "typescript" (TS) | none (JS), "vite", "oxlint"
```

Scripts típicos:

```jsonc
"scripts": {
  "dev": "vite",
  "build": "vite build",            // TS: "tsc -b && vite build"
  "preview": "vite preview",
  "lint": "oxlint .",
  "backup": "...", "restore": "..."  // box: copias de Firestore
}
```

---

## 3. Estructura de carpetas

```
├── .env.example              # VITE_FIREBASE_API_KEY / AUTH_DOMAIN / PROJECT_ID / ...
├── firebase.json             # hosting + functions (pilates)
├── firestore.rules           # reglas de seguridad Firestore
├── firestore.indexes.json    # índices compuestos
├── docker-compose.yml        # (box, programa-rv) nginx + node
├── Dockerfile + nginx.conf   # deploy en contenedor
├── functions/                # Cloud Functions (pilates)
└── src/
    ├── main.jsx|tsx          # BrowserRouter > App
    ├── firebase.ts|js        # init de Firebase (env vars)
    ├── auth / context|store  # login email+password / Google (Zustand o Context)
    ├── data / lib            # lecturas Firestore
    ├── components/           # ui + layout + páginas
    └── pages/
```

---

## 4. Configuración Firebase

### `src/firebase.ts` (inicialización)

```ts
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
```

### Auth

- Email/password + Google (`signInWithPopup(new GoogleAuthProvider())`).
- Estado de sesión con `onAuthStateChanged` (Context o Zustand).
- Datos por usuario en Firestore usando `uid`.

### Firestore (`firestore.rules`)

Patrón: lectura/escritura solo del propio usuario, admin si existe rol.

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;
    }
    match /usuarios/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 5. Deploy

### Firebase Hosting + Functions (`pilates`)

```bash
npm run build                    # genera dist/
npx firebase deploy --only hosting
npx firebase deploy --only functions   # Cloud Functions (nodejs20)
```

`firebase.json` con `hosting.public = "dist"`, SPA rewrite `** -> /index.html`,
y `functions.source = "functions"` (predeploy build).

### Docker / nginx (`box`, `programa-rv`)

- `Dockerfile` multi-etapa: `node` build → `nginx` sirviendo `dist` con `nginx.conf`
  (SPA: `try_files $uri /index.html`).
- `docker-compose.yml` para levantar en local/`<proyecto>`.

---

## 6. Conexión real

1. https://console.firebase.google.com → crear proyecto.
2. Activar **Authentication** (Email/Password y/o Google).
3. Activar **Firestore** (región preferida, p. ej. `europe-west3`) y subir `firestore.rules`.
4. Crear app web y copiar el `firebaseConfig` a `.env`.
5. `npm install && npm run dev`.

---

## 7. Checklist para replicar

1. [ ] Scaffold Vite + React (+ TS) + Tailwind.
2. [ ] `.env.example` con `VITE_FIREBASE_*` + `src/firebase.ts`.
3. [ ] Auth (email/password + Google) con estado global.
4. [ ] Datos en Firestore con reglas por usuario en `firestore.rules`.
5. [ ] `firebase.json` + Hosting (o Docker/nginx) según el deploy objetivo.
6. [ ] Verificación: `npm run lint && npm run build`.
