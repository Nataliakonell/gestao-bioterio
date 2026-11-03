import { useEffect, useState, useMemo, useCallback } from "react"
import { toast } from "sonner"
import { CalendarDays, Clock, CalendarCheck2 } from "lucide-react"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { HeaderContainer } from "@/components/header-container"
import { PageContainer } from "@/components/page-container"
import { StatsCard } from "@/components/stats-card"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { CalendarioEventos } from "./CalendarioEventos"
import { ModalAgendarEvento } from "./ModalAgendarEvento"
import { ModalDetalhesEvento } from "./ModalDetalhesEvento"
import { ModalConfirmarSaidaEvento } from "./ModalConfirmarSaidaEvento"
import { ModalConfirmarRetornoEvento } from "./ModalConfirmarRetornoEvento"
import {
  eventoService,
  type EventoListVm,
  type EventoDetailVm,
  isStatusAgendado,
  isStatusEmAndamento,
  isStatusConcluido,
  isStatusCancelado,
  isTipoInterno,
  isTipoExterno,
} from "@/services/EventoService"

export default function VisaoGeralEventos() {
  const [eventos, setEventos] = useState<EventoListVm[]>([])
  const [loading, setLoading] = useState(true)

  const [modalAgendarOpen, setModalAgendarOpen] = useState(false)
  const [modalDetalhesOpen, setModalDetalhesOpen] = useState(false)
  const [modalSaidaOpen, setModalSaidaOpen] = useState(false)
  const [modalRetornoOpen, setModalRetornoOpen] = useState(false)

  const [selectedEventoId, setSelectedEventoId] = useState<number | null>(null)
  const [eventoParaAcao, setEventoParaAcao] = useState<EventoDetailVm | null>(null)
  const [eventoParaEditar, setEventoParaEditar] = useState<EventoDetailVm | null>(null)

  const carregarEventos = useCallback(async () => {
    try {
      setLoading(true)
      const data = await eventoService.getAll()
      setEventos(data || [])
    } catch (error) {
      console.error("Erro ao carregar eventos:", error)
      toast.error("Erro ao carregar lista de eventos.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    carregarEventos()
  }, [carregarEventos])

  const stats = useMemo(() => {
    const agora = new Date()

    const emEventoInternoAgora = eventos.filter((e) => {
      if (!isStatusEmAndamento(e.status)) return false
      return isTipoInterno(e.tipoEvento)
    }).length

    const emEventoExternoAgora = eventos.filter((e) => {
      if (!isStatusEmAndamento(e.status)) return false
      return isTipoExterno(e.tipoEvento)
    }).length

    const retornosAtrasados = eventos.filter((e) => {
      if (isStatusConcluido(e.status) || isStatusCancelado(e.status)) return false
      if (e.dataHoraPrevisaoRetorno) {
        return new Date(e.dataHoraPrevisaoRetorno) < agora
      }
      return false
    }).length

    const eventosAgendados = eventos.filter((e) => isStatusAgendado(e.status)).length

    return {
      emEventoInternoAgora,
      emEventoExternoAgora,
      retornosAtrasados,
      eventosAgendados,
    }
  }, [eventos])

  const handleSelectEvento = (eventoId: number) => {
    setSelectedEventoId(eventoId)
    setModalDetalhesOpen(true)
  }

  const handleAbrirSaida = (evento: EventoDetailVm) => {
    setEventoParaAcao(evento)
    setModalSaidaOpen(true)
  }

  const handleAbrirRetorno = (evento: EventoDetailVm) => {
    setEventoParaAcao(evento)
    setModalRetornoOpen(true)
  }

  const handleEditar = (evento: EventoDetailVm) => {
    setEventoParaEditar(evento)
    setModalAgendarOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title="Eventos"
              breadcrumbTitle="Eventos"
              breadcrumbUrl="/eventos"
            />
            <div className="flex items-center gap-4">
              <AddButton
                text="Novo Evento"
                onClick={() => {
                  setEventoParaEditar(null)
                  setModalAgendarOpen(true)
                }}
              />
            </div>
          </HeaderContainer>

          <div className="flex flex-col gap-6">
            {/* 4 Cards de Indicadores (CardStats) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard
                label="Em Evento Interno Agora"
                value={stats.emEventoInternoAgora}
                description="Animais em eventos internos no biotério"
              />
              <StatsCard
                label="Em Evento Externo Agora"
                value={stats.emEventoExternoAgora}
                description="Animais fora da UCDB em andamento"
              />
              <StatsCard
                label="Retornos Atrasados"
                value={stats.retornosAtrasados}
                description="Animais com retorno pendente atrasado"
              />
              <StatsCard
                label="Eventos Agendados"
                value={stats.eventosAgendados}
                description="Aguardando confirmação de saída"
              />
            </div>

            {/* Componente Calendário com FullCalendar */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-slate-700" />
                  <h2 className="text-base font-bold text-slate-800">Calendário de Agendamentos</h2>
                </div>

                {/* Legendas visuais do calendário */}
                <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>Agendado</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>Em Andamento</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>Concluído</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    <span>Atrasado</span>
                  </div>
                </div>
              </div>

              <CalendarioEventos
                eventos={eventos}
                onSelectEvento={handleSelectEvento}
                onDateClick={() => {
                  setEventoParaEditar(null)
                  setModalAgendarOpen(true)
                }}
              />
            </div>
          </div>
        </PageContainer>
      </SidebarInset>

      {/* Modal de Cadastro / Agendamento / Edição */}
      <ModalAgendarEvento
        isOpen={modalAgendarOpen}
        onClose={() => {
          setModalAgendarOpen(false)
          setEventoParaEditar(null)
        }}
        onSuccess={carregarEventos}
        eventoParaEditar={eventoParaEditar}
      />

      {/* Modal de Detalhes do Evento */}
      <ModalDetalhesEvento
        isOpen={modalDetalhesOpen}
        onClose={() => {
          setModalDetalhesOpen(false)
          setSelectedEventoId(null)
        }}
        eventoId={selectedEventoId}
        onAbrirSaida={handleAbrirSaida}
        onAbrirRetorno={handleAbrirRetorno}
        onEditar={handleEditar}
      />

      {/* Modal de Confirmação de Saída */}
      <ModalConfirmarSaidaEvento
        isOpen={modalSaidaOpen}
        onClose={() => {
          setModalSaidaOpen(false)
          setEventoParaAcao(null)
        }}
        onSuccess={carregarEventos}
        evento={eventoParaAcao}
      />

      {/* Modal de Confirmação de Retorno */}
      <ModalConfirmarRetornoEvento
        isOpen={modalRetornoOpen}
        onClose={() => {
          setModalRetornoOpen(false)
          setEventoParaAcao(null)
        }}
        onSuccess={carregarEventos}
        evento={eventoParaAcao}
      />
    </SidebarProvider>
  )
}
