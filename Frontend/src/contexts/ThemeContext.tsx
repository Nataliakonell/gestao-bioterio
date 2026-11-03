import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"

export type ThemeMode = "light" | "dark"
export type AccentKey = "blue" | "teal" | "green" | "violet" | "rose" | "orange"

export interface Appearance {
  mode: ThemeMode
  accent: AccentKey
}

export const ACCENT_OPTIONS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: "blue", label: "Azul", swatch: "#1C3F94" },
  { key: "teal", label: "Turquesa", swatch: "#18a3ad" },
  { key: "green", label: "Verde", swatch: "#095f06" },
  { key: "violet", label: "Violeta", swatch: "#5b21b6" },
  { key: "rose", label: "Rosa", swatch: "#df32c8" },
  { key: "orange", label: "Laranja", swatch: "#e76814" },
]

export const APPEARANCE_STORAGE_KEY = "sigbio:appearance"
export const DEFAULT_APPEARANCE: Appearance = { mode: "light", accent: "blue" }

const isAccent = (v: unknown): v is AccentKey => ACCENT_OPTIONS.some((a) => a.key === v)

export function loadAppearance(): Appearance {
  try {
    const raw = JSON.parse(localStorage.getItem(APPEARANCE_STORAGE_KEY) || "null")
    return {
      mode: raw?.mode === "dark" ? "dark" : "light",
      accent: isAccent(raw?.accent) ? raw.accent : "blue",
    }
  } catch {
    return DEFAULT_APPEARANCE
  }
}

/** Aplica a aparência ao <html> (usado também para a prévia). */
export function applyAppearance({ mode, accent }: Appearance) {
  const root = document.documentElement
  root.classList.toggle("dark", mode === "dark")
  if (accent === "blue") root.removeAttribute("data-accent")
  else root.setAttribute("data-accent", accent)
}

interface ThemeContextValue {
  appearance: Appearance
  /** Persiste e aplica a aparência. */
  saveAppearance: (a: Appearance) => void
  /** Aplica temporariamente, sem persistir. */
  previewAppearance: (a: Appearance) => void
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance] = useState<Appearance>(loadAppearance)

  useEffect(() => {
    applyAppearance(appearance)
  }, [appearance])

  const saveAppearance = useCallback((a: Appearance) => { applyAppearance(a) 
    localStorage.setItem(
      APPEARANCE_STORAGE_KEY,
      JSON.stringify(a)
    )
    setAppearance(a)
  }, [])

  const previewAppearance = useCallback((a: Appearance) => applyAppearance(a), [])

  const value = useMemo(
    () => ({ appearance, saveAppearance, previewAppearance }),
    [appearance, saveAppearance, previewAppearance]
  )
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider")
  return ctx
}
