import {
  CalendarDays,
  Plus,
  Clock,
  MapPin,
  ExternalLink,
  ChevronRight,
  AlertCircle,
} from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { Button } from "@/components/ui/button"
import {
  type EventoListVm,
  isStatusAgendado,
  isStatusEmAndamento,
  isStatusConcluido,
  isStatusCancelado,
  isTipoExterno,
} from "@/services/EventoService"

interface ModalDiaEventosProps {
  isOpen: boolean
  onClose: () => void
  dataStr: string | null
  eventos: EventoListVm[]
  onSelectEvento: (eventoId: number) => void
  onCriarEventoNoDia: (dataStr: string) => void
}

export function ModalDiaEventos({
  isOpen,
  onClose,
  dataStr,
  eventos,
  onSelectEvento,
  onCriarEventoNoDia,
}: ModalDiaEventosProps) {
  if (!isOpen || !dataStr) return null

  // Normaliza a data (YYYY-MM-DD)
  const partes = dataStr.split("-")
  let dataFormatada = dataStr
  if (partes.length === 3) {
    const ano = parseInt(partes[0], 10)
    const mes = parseInt(partes[1], 10) - 1
    const dia = parseInt(partes[2], 10)
    const d = new Date(ano, mes, dia)
    dataFormatada = d.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
    // Primeira letra maiúscula
    dataFormatada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)
  }

  // Filtra eventos que ocorrem ou cruzam este dia
  const eventosDoDia = eventos.filter((evt) => {
    if (!evt.dataHoraInicio) return false
    const inicioStr = evt.dataHoraInicio.substring(0, 10)
    const fimStr = evt.dataHoraPrevisaoRetorno
      ? evt.dataHoraPrevisaoRetorno.substring(0, 10)
      : inicioStr

    return dataStr >= inicioStr && dataStr <= fimStr
  })

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title={dataFormatada}
      icon={<CalendarDays className="h-5 w-5" />}
      iconBg="blue"
      size="md"
    >
      <div className="p-6 space-y-6">
        {/* Barra superior de ação rápida */}
        <div className="flex items-center justify-between bg-slate-50 border border-slate-200 dark:bg-slate-900/60 dark:border-slate-800 p-3.5 rounded-xl">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            {eventosDoDia.length === 0 ? (
              <span>Nenhum evento agendado para esta data.</span>
            ) : (
              <span>
                <strong>{eventosDoDia.length}</strong> {eventosDoDia.length === 1 ? "evento programado" : "eventos programados"}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={() => {
              onClose()
              onCriarEventoNoDia(dataStr)
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-1.5 shadow-sm text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Criar Evento</span>
          </Button>
        </div>

        {/* Lista de Eventos do Dia */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Eventos do Dia
          </h4>

          {eventosDoDia.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
              <CalendarDays className="h-9 w-9 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Dia livre
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                Não há saídas ou retornos de animais programados para esta data.
              </p>
              
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {eventosDoDia.map((evt) => {
                let statusBadge = "bg-blue-100 text-blue-800 border-blue-200"
                let statusNome = "Agendado"

                if (isStatusEmAndamento(evt.status)) {
                  statusBadge = "bg-amber-100 text-amber-800 border-amber-200"
                  statusNome = "Em Andamento"
                } else if (isStatusConcluido(evt.status)) {
                  statusBadge = "bg-emerald-100 text-emerald-800 border-emerald-200"
                  statusNome = "Concluído"
                } else if (isStatusCancelado(evt.status)) {
                  statusBadge = "bg-slate-100 text-slate-700 border-slate-200"
                  statusNome = "Cancelado"
                }

                const agora = new Date()
                const previsao = new Date(evt.dataHoraPrevisaoRetorno)
                const isAtrasado = agora > previsao && !isStatusConcluido(evt.status) && !isStatusCancelado(evt.status)

                return (
                  <div
                    key={evt.id}
                    onClick={() => {
                      onClose()
                      onSelectEvento(evt.id)
                    }}
                    className="group p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-slate-900 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {evt.nome}
                        </span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusBadge}`}>
                          {statusNome}
                        </span>
                        {isAtrasado && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Atrasado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {new Date(evt.dataHoraInicio).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          {" às "}
                          {new Date(evt.dataHoraPrevisaoRetorno).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {isTipoExterno(evt.tipoEvento) ? "Externo" : "Interno"}
                        </span>
                        <span>• {evt.quantidadeAnimais} {evt.quantidadeAnimais === 1 ? "animal" : "animais"}</span>
                      </div>
                    </div>

                    <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  )
}
