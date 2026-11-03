const pad = (n: number) => String(n).padStart(2, "0")

/** "YYYY-MM-DDTHH:mm" no horário local (sem segundos) */
export function getLocalIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Formata um objeto Date para string "YYYY-MM-DDTHH:mm:ss" no horário local (evita timezone shift de .toISOString()) */
export function formatToLocalIso(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

/** Converte ISO (ou já local) para "YYYY-MM-DDTHH:mm" local */
export function toLocalIso(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso.slice(0, 16)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** "YYYY-MM-DDTHH:mm" -> Date local */
export function parseLocalIso(localIso: string): Date | null {
  if (!localIso) return null
  const d = new Date(localIso)
  return isNaN(d.getTime()) ? null : d
}

/** Normaliza "YYYY-MM-DD" -> "YYYY-MM-DDT00:00:00" e "YYYY-MM-DDTHH:mm" -> "YYYY-MM-DDTHH:mm:00" */
export function parseDateInput(s: string): string {
  if (!s) return s
  if (s.length === 10) return `${s}T00:00:00`
  if (s.length === 16) return `${s}:00`
  return s
}

/** Converte ISO da API (YYYY-MM-DD ou YYYY-MM-DDT00:00:00) para "dd/MM/yyyy" sem shift de timezone */
export function formatIsoToPtBr(iso?: string | null): string {
  if (!iso) return ""
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!m) return iso
  return `${m[3]}/${m[2]}/${m[1]}`
}

/** Converte string "YYYY-MM-DD" ou "YYYY-MM-DDT00:00:00" para Date local seguro para DatePicker */
export function isoToLocalDate(iso?: string | null): Date | undefined {
  if (!iso) return undefined
  // Se for apenas YYYY-MM-DD, força T00:00:00 para evitar parse UTC (new Date("YYYY-MM-DD") é UTC)
  const normalized = iso.length === 10 ? `${iso}T00:00:00` : iso
  const d = new Date(normalized)
  return isNaN(d.getTime()) ? undefined : d
}

/** "YYYY-MM-DDTHH:mm" local atual para max de datetime-local */
export function localIsoNow(): string {
  return getLocalIso()
}
