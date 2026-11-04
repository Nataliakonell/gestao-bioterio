/**
 * Utilitários para exportação e sincronização de eventos com Google Calendar, Outlook e download de arquivo .ICS (iCalendar padrão)
 */

export interface CalendarEventData {
  title: string
  description?: string
  location?: string
  startDate: Date | string
  endDate: Date | string
}

function formatDateToUtcIso(dateInput: Date | string): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput
  return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z"
}

/**
 * Gera URL para criar evento no Google Calendar
 */
export function getGoogleCalendarUrl(event: CalendarEventData): string {
  const startIso = formatDateToUtcIso(event.startDate)
  const endIso = formatDateToUtcIso(event.endDate)

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.title,
    dates: `${startIso}/${endIso}`,
    details: event.description || "",
    location: event.location || "",
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Gera URL para criar evento no Outlook Web (Outlook 365 / Live)
 */
export function getOutlookCalendarUrl(event: CalendarEventData): string {
  const startIso = (typeof event.startDate === "string" ? new Date(event.startDate) : event.startDate).toISOString()
  const endIso = (typeof event.endDate === "string" ? new Date(event.endDate) : event.endDate).toISOString()

  const params = new URLSearchParams({
    path: "/calendar/action/compose",
    rru: "addevent",
    subject: event.title,
    startdt: startIso,
    enddt: endIso,
    body: event.description || "",
    location: event.location || "",
  })

  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Gera e dispara download de arquivo .ics padrão compatível com Outlook Desktop, Apple Calendar e qualquer cliente de e-mail/calendário
 */
export function downloadIcsFile(event: CalendarEventData, filename?: string): void {
  const startIso = formatDateToUtcIso(event.startDate)
  const endIso = formatDateToUtcIso(event.endDate)
  const nowIso = formatDateToUtcIso(new Date())

  // Sanitização básica de quebras de linha para iCalendar RFC 5545
  const cleanDesc = (event.description || "").replace(/\n/g, "\\n")
  const cleanTitle = (event.title || "").replace(/\n/g, " ")
  const cleanLoc = (event.location || "").replace(/\n/g, " ")

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SIGBio - Gestao Bioterio UCDB//Eventos//PT",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:sigbio-${Date.now()}@ucdb.br`,
    `DTSTAMP:${nowIso}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    `SUMMARY:${cleanTitle}`,
    `DESCRIPTION:${cleanDesc}`,
    `LOCATION:${cleanLoc}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n")

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.setAttribute("download", `${filename || "evento-sigbio"}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
