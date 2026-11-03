import colors from "tailwindcss/colors"
import plugin from "tailwindcss/plugin"

/**
 * Sistema de temas do SIGBio.
 *
 * As paletas `gray`, `slate`, `blue` (cor de destaque) e as paletas semânticas
 * passam a ser variáveis CSS (`--c-{paleta}-{tom}`) em formato "r g b".
 * No modo claro os valores são idênticos aos do Tailwind (aparência atual).
 * No modo escuro (`html.dark`) os tons são remapeados; a cor de destaque
 * é trocada via `html[data-accent="..."]`.
 */

const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

const hexToRgb = (hex) => {
  const h = hex.replace("#", "")
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}
const rgbToHex = (rgb) => "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("")
const channels = (hex) => hexToRgb(hex).join(" ")

function hexToHsl(hex) {
  const [r, g, b] = hexToRgb(hex).map((v) => v / 255)
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  const d = max - min
  let h = 0, s = 0
  if (d) {
    s = d / (1 - Math.abs(2 * l - 1))
    if (max === r) h = ((g - b) / d) % 6
    else if (max === g) h = (b - r) / d + 2
    else h = (r - g) / d + 4
    h *= 60
    if (h < 0) h += 360
  }
  return [h, s, l]
}
function hslToHex([h, s, l]) {
  const k = (n) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return rgbToHex([f(0), f(8), f(4)].map((v) => Math.round(v * 255)))
}

/** Paletas semânticas (estado/categoria) mantidas, apenas adaptadas ao escuro. */
const SEMANTIC = [
  "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
  "cyan", "sky", "indigo", "violet", "purple", "fuchsia", "pink", "rose",
]

/** Cinzas do modo escuro (superfícies e textos). */
const DARK_NEUTRAL = {
  50: "#1c1c21", 100: "#232329", 200: "#33333b", 300: "#45454f", 400: "#8b8b97",
  500: "#a1a1ab", 600: "#b7b7c0", 700: "#cdcdd4", 800: "#e0e0e5", 900: "#efeff2", 950: "#fafafa",
}

/** Cores de destaque disponíveis com suas cores-base (swatches oficiais). */
export const ACCENT_SWATCHES = {
  blue: "#1C3F94",
  teal: "#18a3ad",
  green: "#095f06",
  violet: "#5b21b6",
  rose: "#df32c8",
  orange: "#e76814",
}

/** Gera a paleta completa (50-950) calibrada a partir do swatch fornecido. */
function generateScaleFromHex(baseHex, isBlueDefault) {
  if (isBlueDefault) {
    return {
      ...colors.blue,
      800: "#1C3F94",
      900: "#193985",
    }
  }
  const cleanHex = baseHex.replace("#", "").slice(0, 6)
  const [h, s, baseL] = hexToHsl("#" + cleanHex)
  const scale = {}
  SHADES.forEach((shade) => {
    let l
    if (shade <= 500) {
      const targetMidL = Math.max(baseL, 0.45)
      const factor = (shade - 50) / 450
      l = 0.96 - factor * (0.96 - targetMidL)
    } else {
      const targetMidL = Math.max(baseL, 0.45)
      const factor = (shade - 500) / 450
      l = targetMidL - factor * (targetMidL - 0.10)
    }
    const sat = shade <= 100 ? Math.min(s, 0.65) : s
    scale[shade] = hslToHex([h, sat, Math.max(0.05, Math.min(0.98, l))])
  })
  scale[800] = "#" + cleanHex
  scale[900] = hslToHex([h, s, Math.max(0.08, baseL * 0.78)])
  return scale
}

export const ACCENTS = {
  blue: generateScaleFromHex(ACCENT_SWATCHES.blue, true),
  teal: generateScaleFromHex(ACCENT_SWATCHES.teal, false),
  green: generateScaleFromHex(ACCENT_SWATCHES.green, false),
  violet: generateScaleFromHex(ACCENT_SWATCHES.violet, false),
  rose: generateScaleFromHex(ACCENT_SWATCHES.rose, false),
  orange: generateScaleFromHex(ACCENT_SWATCHES.orange, false),
}

/** Remapeia uma paleta clara para o modo escuro. */
function darkScale(p, accent) {
  const [h, s] = hexToHsl(p[600] || p[500])
  const tint = (l) => hslToHex([h, Math.min(s, 0.55), l])
  return {
    50: tint(0.12), 100: tint(0.16), 200: tint(0.22),
    300: p[700], 400: p[500], 500: p[500],
    600: p[500], 700: p[400],
    800: accent ? p[500] : p[300],
    900: accent ? p[600] : p[200],
    950: p[100],
  }
}

const vars = (name, scale) =>
  Object.fromEntries(SHADES.map((s) => [`--c-${name}-${s}`, channels(scale[s])]))

function getHslChannels(hex, targetL) {
  const [h, s, l] = hexToHsl(hex)
  const finalL = targetL !== undefined ? targetL : l
  return `${Math.round(h * 10) / 10} ${Math.round(s * 1000) / 10}% ${Math.round(finalL * 1000) / 10}%`
}

const brandVars = (key, p, dark, isDefault) => {
  const swatch = ACCENT_SWATCHES[key] || p[800]
  if (dark) {
    return {
      "--brand-blue": p[500],
      "--brand-blue-hover": p[400],
      "--primary": getHslChannels(swatch, 0.60),
      "--primary-foreground": "0 0% 100%",
      "--ring": getHslChannels(swatch, 0.55),
      "--sidebar-primary": getHslChannels(swatch, 0.55),
      "--sidebar-primary-foreground": "0 0% 100%",
    }
  }
  return {
    "--brand-blue": isDefault ? "#1C3F94" : swatch,
    "--brand-blue-hover": isDefault ? "#193985" : p[900],
    "--primary": getHslChannels(swatch, 0.35),
    "--primary-foreground": "0 0% 98%",
    "--ring": getHslChannels(swatch, 0.40),
    "--sidebar-primary": getHslChannels(swatch, 0.35),
    "--sidebar-primary-foreground": "0 0% 98%",
  }
}

const makeScale = (name) =>
  Object.fromEntries(
    SHADES.map((s) => [s, `rgb(var(--c-${name}-${s}) / <alpha-value>)`])
  )

export const themeColors = {
  gray: makeScale("gray"),
  slate: makeScale("slate"),
  blue: makeScale("blue"),
  ...Object.fromEntries(SEMANTIC.map((n) => [n, makeScale(n)])),
}

export const themePlugin = plugin(({ addBase }) => {
  const light = { ":root": {}, }
  const dark = { ":root.dark": { "color-scheme": "dark" } }

  Object.assign(light[":root"], vars("gray", colors.gray), vars("slate", colors.slate))
  Object.assign(dark[":root.dark"], vars("gray", DARK_NEUTRAL), vars("slate", DARK_NEUTRAL))
  for (const n of SEMANTIC) {
    Object.assign(light[":root"], vars(n, colors[n]))
    Object.assign(dark[":root.dark"], vars(n, darkScale(colors[n], false)))
  }

  Object.entries(ACCENTS).forEach(([key, p]) => {
    const isDefault = key === "blue"
    const lightSel = isDefault ? ":root" : `:root[data-accent="${key}"]`
    const darkSel = isDefault ? ":root.dark" : `:root.dark[data-accent="${key}"]`
    light[lightSel] = Object.assign(light[lightSel] || {}, vars("blue", p), brandVars(key, p, false, isDefault))
    dark[darkSel] = Object.assign(dark[darkSel] || {}, vars("blue", darkScale(p, true)), brandVars(key, p, true, isDefault))
  })

  addBase(light)
  addBase(dark)
})
