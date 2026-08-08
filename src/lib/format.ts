export function formatPrice(price?: number, currency = "ARS") {
  if (price == null) return ""
  try {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency,
      maximumFractionDigits: currency === "ARS" || currency === "CLP" ? 0 : 2,
    }).format(price)
  } catch {
    return `${price} ${currency}`
  }
}

export function formatDuration(seconds?: number) {
  if (!seconds) return ""
  const m = Math.floor(seconds / 60)
  const s = Math.round(seconds % 60)
  return `${m}:${s.toString().padStart(2, "0")}`
}

export function formatDate(ts?: number) {
  if (!ts) return ""
  return new Date(ts).toLocaleDateString("es-AR", { year: "numeric", month: "short", day: "numeric" })
}
