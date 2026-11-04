import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function openInNewTab(url: string) {
  window.open(url, '_blank', 'noopener,noreferrer')
}

/**
 * Formata caminhos hierárquicos de localização para exibir apenas a sala/filha final no frontend.
 * Ex: "UCDB -> Biotério -> Sala C" -> "Sala C"
 * Também trata separadores com seta unicode: "UCDB → Biotério → Sala C" -> "Sala C"
 */
export function formatarLocalizacao(caminho?: string | null, fallback?: string): string {
  if (!caminho || !caminho.trim()) {
    return fallback || ""
  }
  const partes = caminho.split(/\s*(?:->|→)\s*/)
  const ultimaParte = partes[partes.length - 1]?.trim()
  return ultimaParte || fallback || caminho
}
