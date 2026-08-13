"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.groqAssistant = exports.makeAdmin = void 0;
const v2_1 = require("firebase-functions/v2");
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const admin = __importStar(require("firebase-admin"));
const groq_sdk_1 = __importDefault(require("groq-sdk"));
(0, v2_1.setGlobalOptions)({ region: process.env.FUNCTIONS_REGION || "us-central1", maxInstances: 10 });
admin.initializeApp();
const db = admin.firestore();
const groqApiKey = (0, params_1.defineSecret)("GROQ_API_KEY");
// Convierte una cuenta en administrador (usar una sola vez en desarrollo).
exports.makeAdmin = (0, https_1.onCall)(async (request) => {
    const email = request.data?.email;
    if (!email)
        throw new Error("email requerido");
    const users = await admin.auth().getUserByEmail(email);
    await db.doc(`profiles/${users.uid}`).set({ uid: users.uid, email, isAdmin: true, updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
    return { ok: true, uid: users.uid };
});
async function buildContext() {
    const [videos, plans, requests, profiles, subscriptions, purchases] = await Promise.all([
        db.collection("videos").get(),
        db.collection("plans").get(),
        db.collection("requests").get(),
        db.collection("profiles").get(),
        db.collection("subscriptions").get(),
        db.collection("purchases").get(),
    ]);
    const publishedVideos = videos.docs.filter((v) => v.data().status === "published").length;
    const freeVideos = videos.docs.filter((v) => v.data().type === "free").length;
    const paidVideos = videos.docs.filter((v) => v.data().type === "paid").length;
    const pendingRequests = requests.docs.filter((r) => r.data().status === "pending").length;
    const approvedRequests = requests.docs.filter((r) => r.data().status === "approved").length;
    const rejectedRequests = requests.docs.filter((r) => r.data().status === "rejected").length;
    const admins = profiles.docs.filter((p) => p.data().isAdmin === true).length;
    const activeSubs = subscriptions.docs.filter((s) => s.data().status === "active" && (s.data().endDate?.toMillis?.() ?? Date.now()) > Date.now()).length;
    const videoList = videos.docs.map((v) => v.data()).map((v) => ({
        titulo: v.title,
        categoria: v.category ?? "Sin categoría",
        tipo: v.type === "free" ? "gratis" : "pago",
        estado: v.status,
        destacado: v.featured === true,
    }));
    const planList = plans.docs.map((p) => p.data()).map((p) => ({
        nombre: p.name,
        precio: p.price,
        moneda: p.currency ?? "CLP",
        intervalo: p.interval,
        activo: p.active === true,
    }));
    const pendingList = requests.docs
        .filter((r) => r.data().status === "pending")
        .map((r) => {
        const d = r.data();
        return d.kind === "purchase"
            ? { tipo: "compra", clase: d.videoTitle ?? d.videoId, monto: d.amount, moneda: d.currency }
            : { tipo: "suscripción", plan: d.planName ?? d.planId, monto: d.amount, moneda: d.currency };
    });
    return `
Datos actuales de PilatesStudio (proyecto pilates-app-98885):

RESUMEN:
- Videos: ${videos.size} totales (${publishedVideos} publicados, ${freeVideos} gratis, ${paidVideos} de pago).
- Planes de suscripción: ${plans.size} (${plans.docs.filter((p) => p.data().active === true).length} activos).
- Solicitudes: ${requests.size} totales (${pendingRequests} pendientes, ${approvedRequests} aprobadas, ${rejectedRequests} rechazadas).
- Usuarios: ${profiles.size} (${admins} administradores).
- Suscripciones activas: ${activeSubs}.
- Compras de clases: ${purchases.size}.

CATÁLOGO DE VIDEOS:
${JSON.stringify(videoList)}

PLANES:
${JSON.stringify(planList)}

SOLICITUDES PENDIENTES:
${JSON.stringify(pendingList)}
`.trim();
}
// Asistente IA (Groq). Solo lo pueden usar administradores.
exports.groqAssistant = (0, https_1.onCall)({
    secrets: [groqApiKey],
}, async (request) => {
    const data = request.data;
    if (!request.auth)
        throw new Error("Debes iniciar sesión.");
    const profile = await db.doc(`profiles/${request.auth.uid}`).get();
    if (!profile.exists || profile.data()?.isAdmin !== true) {
        throw new Error("Solo los administradores pueden usar el asistente.");
    }
    const messages = data?.messages ?? [];
    if (messages.length === 0)
        throw new Error("No hay mensaje.");
    const client = new groq_sdk_1.default({ apiKey: groqApiKey.value() });
    const context = await buildContext();
    const system = data?.system ??
        `Eres un asistente útil para administradores de PilatesStudio, una plataforma de clases de pilates online. Responde de forma clara y concisa en español. Usa los datos reales de la base de datos que se te entregan a continuación para responder sobre el catálogo, planes, usuarios o solicitudes. Si no tienes el dato exacto, indícalo.

DATOS DE LA BASE DE DATOS:
${context}`;
    const completion = await client.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "system", content: system }, ...messages.map((m) => ({ role: m.role, content: m.content }))],
        max_tokens: 1024,
    });
    return { content: completion.choices[0]?.message?.content ?? "No pude generar una respuesta." };
});
//# sourceMappingURL=index.js.map