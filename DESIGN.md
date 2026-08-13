# Design System — HipoFit

> Brand: HipoFit · Gimnasia hipopresiva online.
> Direction: **Wellness editorial** — salud, respiración y bienestar con estética de revista premium.
> Works with Open Design + coding agents (opencode). Keep this file in the repo so every generation renders on-brand.

## 1. Visual Theme & Atmosphere

Una plataforma de gimnasia hipopresiva con estética de **revista de bienestar editorial**. Mucho whitespace, titulares serif grandes, paleta contenida de papel + verde profundo + un único acento. Bordes finos (hairlines) y espacio hacen el trabajo; sin radios exagerados ni sombras dramáticas. Cada sección alterna papel y superficie con hairlines que separan.

**Key Characteristics:**
- Serif display (Georgia/Fraunces/Iowan) para títulos grandes; sans para body; **mono solo para metadata/eyebrows**
- Sin sombras grandes, sin tarjetas con radio excesivo — bordes (1px hairline) + whitespace
- Kickers / eyebrows en **mono uppercase** con tracking amplio y una línea corta
- Un solo color de acento (**teal `#0f766e`**), usado con moderación
- Imágenes decisivas, recortadas en la parte inferior; fotos en tonos naturales
- Sin gradientes agresivos, sin fondos saturados

## 2. Color Palette & Roles

### Primario / Acento
- **Teal** (`#0f766e`): único acento. CTAs primarios, em itálico del titular, links activos, metadata destacada.
- Hover del acento: usa **Ink** (`#134e4a`) en lugar de oscurecer el teal.

### Superficie & Fondo
- **Papel** (`#fbfaf7`): fondo de página.
- **Superficie** (`#ffffff`): cards, formularios, bandas alternas.
- **Hairline** (`#e7e3da`): todos los bordes de 1px (filas, secciones, nav, footer).

### Neutros & Texto
- **Ink** (`#1f2b29`): tinta principal para títulos y texto. Nunca negro puro.
- **Muted** (`#6b7875`): texto secundario, metadata, kickers.
- **Faint** (`#c0c9c6`): disabled, placeholders, divisores terciarios.

### Semánticos
- **Success** (`#2e7d57`): confirmación.
- **Error** (`#c0392b`): validación de formularios.
- **Info** (`#428bff`): enlaces legales.

## 3. Typography Rules

### Familias
- **Display — serif:** `Georgia, 'Iowan Old Style', 'Times New Roman', Times, serif`. Peso 400–500, solo títulos.
- **Body — sans:** `system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif`. 400–500.
- **Mono — metadata:** `ui-monospace, 'SF Mono', Consolas, Menlo, monospace`. SOLO para kickers, labels, precios, metadatos, duración.

### Jerarquía

| Rol | Tamaño | Peso | Notas |
|-----|--------|------|-------|
| Hero Display | `clamp(2.6rem, 6vw, 5rem)` | 400 | Serif, `1.05`, tracking `-0.02em` |
| Sección | `clamp(2rem, 4vw, 3.2rem)` | 400 | Serif, `1.1`, tracking `-0.015em` |
| Card/Nombre | `20px` | 400 | Serif |
| Body | `16.5px` | 400 | `1.6` |
| Intro | `clamp(1rem, 1.3vw, 1.15rem)` | 400 | Muted |
| Kicker | `11px` mono | 500 | Uppercase, tracking `0.2em`, línea antes |
| Label mono | `11px` mono | 500 | Uppercase, tracking `0.16em` |

### Principios
- **Tres familias, tres roles:** serif = títulos, sans = lectura, mono = metadata.
- Em itálico en el titular con acento teal (p. ej. "entrena *con conciencia*").
- Uppercase solo en mono (kickers/labels). Nunca en serif/sans salvo el logo.
- Leading generoso (1.5–1.65) para lectura cómoda.

## 4. Component Stylings

### Botones
- **Primario (accent):** bg Teal `#0f766e`, texto blanco, `padding 14px 28px`, **radius 2px**, `14px` sans 500. Hover: bg **Ink** `#134e4a`.
- **Outline:** transparente, borde 1px Ink, texto Ink. Hover: bg Ink, texto blanco.
- **Ghost:** texto muted, hover → teal.
- **Link subrayado:** `border-bottom 1px hairline`, hover → teal.

### Nav
- Sticky, bg papel, hairline inferior, altura 68px.
- Logo serif 20px con punto acento teal.
- Links: sans 13px, activo con underline teal de 1px.

### Tarjetas de clase (video)
- Card con borde hairline, **radius 4px**, sin sombra fuerte.
- Imagen `aspect-video` recortada, badge Gratis/Pago mono uppercase.
- Título serif 20px, metadata mono (categoría · duración · fecha), descripción muted.

### Filas de usuario / solicitudes (admin)
- `grid`, avatar cuadrado/redondeado 8px, nombre sans medium, meta mono uppercase muted.
- Hairline inferior entre filas.

### Formularios
- Inputs/selects: bg superficie, borde 1px hairline, **radius 2px**, padding 12px 14px, focus → borde teal.
- Labels: mono 11px uppercase tracking `0.16em`, muted.
- Estado éxito: caja con hairline, icono cuadrado, título serif.

## 5. Layout Principles

- **Max width:** 1200px, container `width: min(100% - clamp(32px,6vw,64px), 1200px)`.
- **Secciones:** padding `clamp(64px, 8vw, 104px)`. Alternar papel ↔ superficie con hairlines.
- **Base de separación:** hairline 1px. Sin sombras ni elevación.
- **Whitespace generoso:** kicker (con línea) → título serif → intro muted → contenido.

## 6. Depth & Elevation

- **Sombras muy sutiles** (solo `0 1px 2px` en hover de cards). Jerarquía con hairlines, escala tipográfica y whitespace.
- Hover: cambio de color (texto/link a teal, botones a Ink). Sin translate.

## 7. Do's and Don'ts

### Do
- Usa el acento teal `#0f766e` con moderación.
- Serif solo para títulos; mono solo para metadata; sans para el resto.
- Bordes hairline de 1px para toda separación.
- Imágenes recortadas en la parte inferior (`object-position: center top`).

### Don't
- No uses radios grandes (nada de píldoras exageradas; máx 4px).
- No uses sombras dramáticas ni gradientes de página completa.
- No pongas párrafos en mono.
- No uses más de un acento.
- No oscurezcas el teal en hover — usa Ink.

## 8. Responsive Behavior

| Width | Cambios |
|-------|---------|
| ≥1024px | Hero 2 columnas, features 4 cols, tarjetas 4 cols |
| 640–1023px | Grids a 2 cols |
| <640px | 1 columna, nav a menú hamburguesa, touch ≥44px |

## 9. Agent Prompt Guide

### Quick Color Reference
- Acento/CTA: "Teal (#0f766e)" · Fondo: "Papel (#fbfaf7)" · Superficie: "Surface (#ffffff)" · Título: "Ink (#1f2b29)" · Secundario: "Muted (#6b7875)" · Borde: "Hairline (#e7e3da)" · Error: "#c0392b"

### Ejemplos
- "Kicker mono uppercase 11px tracking .2em con línea de 32px antes del título serif."
- "Tarjeta de clase: imagen 16/9 recortada abajo, badge mono, título serif 20px, meta mono con categoría y duración, hairline inferior."
- "Botón primario: bg Teal #0f766e, blanco, radius 2px, padding 14px 28px; hover bg Ink."
- "Titular hero serif con <em> itálico en Teal."
