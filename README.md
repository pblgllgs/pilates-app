# PilatesStudio — App de contenido de pago (videos de pilates)

Plataforma web donde un **administrador** sube videos de pilates y los **usuarios** obtienen acceso a clases de **pago** o mediante una **suscripción**. El cobro se realiza **fuera de la app** (transferencia, etc.) y el **administrador confirma el pago manualmente** desde el panel, momento en el que se habilita el acceso. Hay contenido **gratuito** y contenido **de pago**.

## Stack

| Capa        | Tecnología                                                        |
| ----------- | ----------------------------------------------------------------- |
| Frontend    | React 19 + Vite + TypeScript                                      |
| Estilos     | Tailwind CSS v4 + shadcn/ui (Radix)                               |
| Backend     | Firebase (Auth + Firestore + Cloud Functions)                     |
| Videos      | YouTube (no listado, incrustado en la app)                        |
| Estado      | Zustand + TanStack Query                                          |

> **Pagos:** no hay pasarela integrada. El usuario solicita el acceso, coordina el pago con el administrador (fuera de la app) y el admin lo confirma desde el panel **Solicitudes**.

## Estructura

```
src/
  lib/
    firebase.ts            # Config Firebase (tus credenciales)
    types.ts               # Modelos: Video, Plan, Profile, Purchase, Subscription, PurchaseRequest
    data/                  # Capa de acceso a Firestore (videos, planes, solicitudes, accesos)
    format.ts              # Formateadores de precio/fecha/duración
    youtube.ts             # Helpers para URLs de YouTube (ID, embed, miniatura)
  store/auth.ts            # Estado de autenticación (zustand)
  components/
    layout/                # Navbar, footer, layouts público y admin
    video/                 # VideoCard, VideoPlayer
    payment/               # Paywall (bloqueo de contenido pago + solicitud de acceso)
    ui/                    # Componentes shadcn/ui
  pages/                   # Home, Videos, VideoDetail, Pricing, Login, Register, MyContent
  pages/admin/             # Dashboard, Solicitudes, Videos, VideoForm, Planes
functions/                 # Cloud Functions (makeAdmin)
```

## Modelo de datos (Firestore)

- `profiles/{uid}` — perfil de usuario (`isAdmin`).
- `videos/{id}` — clase: `title`, `description`, `type` (`free`|`paid`), `price`, `currency`, `category`, `level`, `duration`, `thumbnailUrl`, `playableUrl`, `status` (`published`|`draft`), `featured`.
- `plans/{id}` — plan de suscripción: `name`, `price`, `currency`, `interval` (`month`|`year`), `features[]`, `active`.
- `requests/{id}` — solicitud de acceso: `kind` (`purchase`|`subscription`), `uid`, `videoId`/`planId`, `amount`, `status` (`pending`|`approved`|`rejected`), `createdAt`, `decidedAt`.
- `purchases/{id}` — compra aprobada de una clase por un usuario.
- `subscriptions/{uid}` — suscripción activa del usuario.

**Flujo de acceso:**
1. El usuario abre una clase de pago → ve el **Paywall** con el precio.
2. Pulsa "Solicitar acceso" (o "Suscribirme" en Precios) → se crea una **solicitud pendiente**.
3. El admin recibe el pago (fuera de la app) → en el panel **Solicitudes** pulsa **Aprobar**.
4. Se crea la compra/suscripción en Firestore y el usuario obtiene acceso automáticamente.

**Control de acceso:** un usuario puede ver una clase si es `free`, si tiene una **suscripción activa** (`subscriptions` con status `active` y fecha vigente), o si **compró la clase** (`purchases` con status `approved`).

---

## Puesta en marcha

### 1. Proyecto Firebase

1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com).
2. **Authentication** → habilita *Email/Password* (y *Google* si quieres).
3. **Firestore Database** → crea la base de datos en modo producción.
4. **Hosting** y **Functions** → actívalos (Functions usa plan Blaze, gratis dentro de la cuota).
5. Agrega una **App web** y copia sus credenciales al archivo `.env.local` (modelo en `.env.example`).

### 2. Variables de entorno del frontend

Copia `.env.example` a `.env.local` y completa:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FUNCTIONS_REGION=us-central1
```

### 3. Videos en YouTube (hospedaje gratuito)

Los videos se hospedan en un canal de YouTube como **No listado** (invisibles en búsquedas y en el canal; solo accesibles con el enlace).

1. Entra a [studio.youtube.com](https://studio.youtube.com) con la cuenta del estudio.
2. Sube cada clase y elige **No listado** como visibilidad.
3. Copia la URL del video (`youtube.com/watch?v=...`) y pégala en el formulario **Nuevo video** del panel de administración (se rellena automáticamente la reproducción y la miniatura).

### 4. Deploy

```bash
npm run build        # compila el frontend
firebase deploy      # hosting + functions + firestore (pide el plan Blaze para functions)
```

### 5. Primer administrador

Después del deploy, ejecuta una vez la función `makeAdmin` con el email de tu cuenta:

```js
// desde la consola de Firebase (Funciones) o con un cliente:
// await httpsCallable(getFunctions(), "makeAdmin")({ email: "tucorreo@mail.com" })
```

Alternativa manual: crea el documento `profiles/{uid}` con `{ uid, email, isAdmin: true }`.

### 6. Corre en local

```bash
npm install
npm run dev          # Vite en http://localhost:5173
```

---

## Notas importantes

- **Los cobros se gestionan manualmente.** No se conecta ninguna pasarela; el admin verifica el pago y aprueba la solicitud. Si en el futuro quieres pagos automáticos, se integra fácil: crea una preferencia en Mercado Pago/Stripe desde una Cloud Function y un webhook que cree la `purchase`/`subscription` (misma estructura de datos).
- **Seguridad:** las reglas de Firestore (`firestore.rules`) impiden que un usuario lea compras/suscripciones ajenas y que escriba donde no debe. Los videos de pago solo se exponen en el frontend tras la comprobación de acceso. Nota: los videos de YouTube *No listado* son accesibles con el enlace, así que el control de acceso protege la app, no el video en sí.
- **Índices:** al crear la base de datos, despliega los índices compuestos de `firestore.indexes.json` (Firebase te pedirá crearlos automáticamente al hacer las primeras consultas).

## Scripts

```bash
npm run dev       # desarrollo
npm run build     # compila (tsc + vite)
npm run lint      # oxlint
npm run preview   # previsualiza el build

cd functions && npm run build && npm run deploy
```
