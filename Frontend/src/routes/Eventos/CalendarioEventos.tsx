import React, { useMemo } from "react"
import FullCalendar from "@fullcalendar/react"
import classicThemePlugin from "@fullcalendar/react/themes/classic"
import dayGridPlugin from "@fullcalendar/react/daygrid"
import timeGridPlugin from "@fullcalendar/react/timegrid"
import interactionPlugin from "@fullcalendar/react/interaction"
import ptBrLocale from "@fullcalendar/react/locales/pt-br"
import "@fullcalendar/react/skeleton.css"
import "@fullcalendar/react/themes/classic/theme.css"
import "@fullcalendar/react/themes/classic/palette.css"
import {
  type EventoListVm,
  isStatusAgendado,
  isStatusEmAndamento,
  isStatusConcluido,
  isStatusCancelado,
  isTipoExterno,
} from "@/services/EventoService"

interface CalendarioEventosProps {
  eventos: EventoListVm[]
  onSelectEvento: (eventoId: number) => void
  onDateClick?: (dateStr: string) => void
}

export function CalendarioEventos({ eventos, onSelectEvento, onDateClick }: CalendarioEventosProps) {
  const calendarEvents = useMemo(() => {
    return eventos.map((evt) => {
      let bg = "#0284c7"
      let border = "#0369a1"

      if (isStatusEmAndamento(evt.status)) {
        bg = "#f59e0b" 
        border = "#d97706"
      } else if (isStatusConcluido(evt.status)) {
        bg = "#10b981" 
        border = "#059669"
      } else if (isStatusCancelado(evt.status)) {
        bg = "#64748b" 
        border = "#475569"
      }

      const agora = new Date()
      const previsao = new Date(evt.dataHoraPrevisaoRetorno)
      if (agora > previsao && !isStatusConcluido(evt.status) && !isStatusCancelado(evt.status)) {
        bg = "#ef4444"
        border = "#dc2626"
      }

      return {
        id: String(evt.id),
        title: `${evt.nome} (${evt.quantidadeAnimais} animais)`,
        start: evt.dataHoraInicio,
        end: evt.dataHoraPrevisaoRetorno,
        backgroundColor: bg,
        borderColor: border,
        textColor: "#ffffff",
        extendedProps: {
          tipoEvento: evt.tipoEvento,
          status: evt.status,
          responsavel: evt.responsavel,
          customBg: bg,
          customBorder: border,
        },
      }
    })
  }, [eventos])

  return (
    <div className="bg-white dark:bg-[#000] rounded-2xl border border-gray-200 dark:border-[#2e3142] p-4 md:p-6 shadow-sm overflow-hidden sigbio-calendar">
      <style>{`
        .sigbio-calendar {
          --fc-classic-primary: #0284c7;
          --fc-classic-primary-foreground: #ffffff;
          --fc-classic-button: #f8fafc;
          --fc-classic-button-border: #e2e8f0;
          --fc-classic-button-foreground: #334155;
          --fc-classic-button-strong: #0284c7;
          --fc-classic-button-strong-border: #0284c7;
          --fc-classic-border: #e2e8f0;
          --fc-classic-strong-border: #cbd5e1;
        }

        .dark .sigbio-calendar {
          --fc-classic-primary: #0284c7;
          --fc-classic-primary-foreground: #ffffff;
          --fc-classic-button: #232634;
          --fc-classic-button-border: #35394d;
          --fc-classic-button-foreground: #e2e8f0;
          --fc-classic-button-strong: #0284c7;
          --fc-classic-button-strong-border: #0284c7;
          --fc-classic-border: #2e3142;
          --fc-classic-strong-border: #3f445b;
        }

        .sigbio-calendar .fc-classic-AVD {
          font-size: 1.25rem !important;
          font-weight: 700 !important;
          color: #1e293b !important;
          text-align: center;
        }

        .dark .sigbio-calendar .fc-classic-AVD {
          color: #f1f5f9 !important;
        }

        /* Tema dark: números e fundo preto do tema classic */
        .dark .sigbio-calendar .fc-classic-GAX {
          color: #ffffff !important;
        }

        .dark .sigbio-calendar .fc-classic-Jk3 {
          background-color: #000 !important;
        }

        /* Cores de texto dos cabeçalhos dos dias e números da data */
        .dark .sigbio-calendar .fc-col-header-cell-cushion,
        .dark .sigbio-calendar .fc-daygrid-day-number,
        .dark .sigbio-calendar .fc-timegrid-slot-label-cushion {
          color: #ffffff !important;
        }

        /* Fundo de dias de outro mês e dia atual */
        .dark .sigbio-calendar .fc-daygrid-day.fc-day-other {
          background-color: rgba(15, 23, 42, 0.4) !important;
        }
        .dark .sigbio-calendar .fc-daygrid-day.fc-day-today {
          background-color: rgba(2, 132, 199, 0.12) !important;
        }

        /* Borda de slots e dias */
        .dark .sigbio-calendar td,
        .dark .sigbio-calendar th,
        .dark .sigbio-calendar .fc-theme-classic td,
        .dark .sigbio-calendar .fc-theme-classic th,
        .dark .sigbio-calendar .fc-scrollgrid {
          border-color: #2e3142 !important;
        }

        /* Botões do FullCalendar no dark mode */
        .dark .sigbio-calendar .fc-button {
          background-color: #232634 !important;
          border-color: #35394d !important;
          color: #e2e8f0 !important;
        }

        .dark .sigbio-calendar .fc-button:hover {
          background-color: #2c3042 !important;
          border-color: #4b526d !important;
        }

        .dark .sigbio-calendar .fc-button-active,
        .dark .sigbio-calendar .fc-button-primary:not(:disabled).fc-button-active {
          background-color: #0284c7 !important;
          border-color: #0284c7 !important;
          color: #ffffff !important;
        }

        /* Mais eventos popover / dialog */
        .dark .sigbio-calendar .fc-popover {
          background-color: #000000 !important;
          border-color: #2e3142 !important;
          color: #f1f5f9 !important;
        }

        .dark .sigbio-calendar .fc-popover-header {
          background-color: #1a1c23 !important;
          color: #f1f5f9 !important;
        }

        .sigbio-calendar button {
          cursor: pointer !important;
          transition: all 0.15s ease-in-out;
        }

        .sigbio-calendar button:hover {
          filter: brightness(0.96);
        }

        .sigbio-calendar .fc-event {
          border-radius: 6px !important;
          padding: 2px 6px !important;
          font-size: 0.75rem !important;
          cursor: pointer !important;
          transition: transform 0.15s ease, opacity 0.15s ease;
        }

        .sigbio-calendar .fc-event:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }
      `}</style>

      <FullCalendar
        plugins={[classicThemePlugin, dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locales={[ptBrLocale]}
        locale="pt-br"
        events={calendarEvents}
        eventDidMount={(info) => {
          const bg = info.event.extendedProps?.customBg || info.event.backgroundColor
          const border = info.event.extendedProps?.customBorder || info.event.borderColor
          if (bg) {
            info.el.style.setProperty("background-color", bg, "important")
            info.el.style.setProperty("border-color", border || bg, "important")
            info.el.style.setProperty("color", "#ffffff", "important")
          }
        }}
        eventClick={(info) => {
          onSelectEvento(Number(info.event.id))
        }}
        dateClick={(info) => {
          if (onDateClick) onDateClick(info.dateStr)
        }}
        height="auto"
      />
    </div>
  )
}
