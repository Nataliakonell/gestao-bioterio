import { formatarLocalizacao } from "@/lib/utils";
import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  LogOut,
  LogIn,
  FileText,
  AlertCircle,
  ExternalLink,
  Edit,
  Printer,
  Eye,
  CalendarPlus,
  Download,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  downloadIcsFile,
} from "@/lib/calendarExport"
import { ModalShell } from "@/components/ui/modal-shell"
import { Button } from "@/components/ui/button"
import { DataTable, type ColumnDef } from "@/components/data-table"
import {
  eventoService,
  type EventoDetailVm,
  StatusEvento,
  TipoEvento,
  isStatusAgendado,
  isStatusEmAndamento,
  isStatusConcluido,
  isStatusCancelado,
} from "@/services/EventoService"
import { documentoEventoService, type DocumentoEventoListVm } from "@/services/DocumentoEventoService"
import { ModalDocumentoEvento } from "./ModalDocumentoEvento"

interface ModalDetalhesEventoProps {
  isOpen: boolean
  onClose: () => void
  eventoId: number | null
  onAbrirSaida: (evento: EventoDetailVm) => void
  onAbrirRetorno: (evento: EventoDetailVm) => void
  onEditar?: (evento: EventoDetailVm) => void
  onVisualizarDocumento?: (evento: EventoDetailVm) => void
}

export function ModalDetalhesEvento({
  isOpen,
  onClose,
  eventoId,
  onAbrirSaida,
  onAbrirRetorno,
  onEditar,
  onVisualizarDocumento,
}: ModalDetalhesEventoProps) {
  const [evento, setEvento] = useState<EventoDetailVm | null>(null)
  const [loading, setLoading] = useState(false)
  const [documentos, setDocumentos] = useState<DocumentoEventoListVm[]>([])
  const [modalDocOpen, setModalDocOpen] = useState(false)

  const handleAbrirVisualizacaoDocumento = () => {
    if (onVisualizarDocumento && evento) {
      onClose()
      onVisualizarDocumento(evento)
    } else {
      setModalDocOpen(true)
    }
  }

  useEffect(() => {
    if (isOpen && eventoId) {
      setLoading(true)
      Promise.all([
        eventoService.getById(eventoId),
        documentoEventoService.getAll(eventoId).catch(() => []),
      ])
        .then(([evtData, docsData]) => {
          setEvento(evtData)
          setDocumentos(docsData || [])
        })
        .catch(() => {
          toast.error("Erro ao carregar detalhes do evento.")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setEvento(null)
      setDocumentos([])
    }
  }, [isOpen, eventoId])

  if (!isOpen) return null

  const isAgendado = isStatusAgendado(evento?.status)
  const isEmAndamento = isStatusEmAndamento(evento?.status)
  const isConcluido = isStatusConcluido(evento?.status)

  const agora = new Date()
  const previsaoPassou = evento ? agora > new Date(evento.dataHoraPrevisaoRetorno) : false
  const isAtrasado = previsaoPassou && !isConcluido && !isStatusCancelado(evento?.status)

  const columnsAnimais: ColumnDef<{
    id: number
    animalId: number
    animalNumeroRegistro?: string
    animalNomePopular?: string
    animalEspecieNome?: string
  }>[] = [
    {
      header: "Nº Registro / Chip",
      accessorKey: "animalNumeroRegistro",
      cell: (item) => <span className="font-semibold text-slate-900 font-mono">#{item.animalNumeroRegistro}</span>,
    },
    {
      header: "Espécie (Nome Científico)",
      accessorKey: "animalEspecieNome",
      cell: (item) => <span className="text-slate-800 italic">{item.animalEspecieNome || item.animalNomePopular || "Sem espécie"}</span>,
    },
    {
      header: "Nome Popular",
      accessorKey: "animalNomePopular",
      cell: (item) => <span className="text-slate-600">{item.animalNomePopular || "-"}</span>,
    },
  ]

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title={evento?.nome || "Detalhes do Evento"}
        icon={<CalendarDays className="h-5 w-5" />}
        iconBg="blue"
        size="lg"
      >
        <div className="p-6 space-y-6">
          {loading || !evento ? (
            <div className="py-12 text-center text-slate-500">
              Carregando detalhes do evento...
            </div>
          ) : (
            <>
              {/* Badge de Status e Alerta de Atraso */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                      isAgendado
                        ? "bg-blue-100 text-blue-800 border border-blue-200"
                        : isEmAndamento
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : isConcluido
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : "bg-slate-100 text-slate-800 border border-slate-200"
                    }`}
                  >
                    {isAgendado && "Agendado"}
                    {isEmAndamento && "Em Andamento (Saída Confirmada)"}
                    {isConcluido && "Concluído (Retorno Confirmado)"}
                    {isStatusCancelado(evento.status) && "Cancelado"}
                  </span>

                  <span className="text-xs px-2.5 py-1 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200">
                    {evento.tipoEvento === TipoEvento.Interno
                      ? "Evento Interno (Na UCDB)"
                      : "Evento Externo (Fora da UCDB)"}
                  </span>
                </div>

                {isAtrasado && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                    <AlertCircle className="h-4 w-4" />
                    <span>Prazo de Retorno Expirado</span>
                  </div>
                )}
              </div>

              {/* Informações de Agendamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Responsável</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mt-0.5">
                    <User className="h-4 w-4 text-slate-400" />
                    <span>{evento.responsavel || "Não informado"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Localização / Destino</span>
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-800 mt-0.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    <span>
                      {formatarLocalizacao(evento.localizacaoNome) || (evento.tipoEvento === TipoEvento.Externo ? "Destino Externo" : "Instalação Interna")}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Data e Horário de Início</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mt-0.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{new Date(evento.dataHoraInicio).toLocaleString("pt-BR")}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Previsão de Retorno</span>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-800 mt-0.5">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <span>{new Date(evento.dataHoraPrevisaoRetorno).toLocaleString("pt-BR")}</span>
                  </div>
                </div>
              </div>

              {/* Sincronização com Agenda Externa (Google, Outlook, iCal) */}
              <div className="p-4 bg-slate-50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 rounded-xl space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <CalendarPlus className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Salvar na Agenda Pessoal
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Sincronize este evento com seu calendário de preferência
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = getGoogleCalendarUrl({
                        title: `[SIGBio] ${evento.nome}`,
                        description: `Evento do Biotério UCDB.\nResponsável: ${evento.responsavel || "Não informado"}\nTipo: ${evento.tipoEvento === TipoEvento.Interno ? "Interno" : "Externo"}\nQuantidade de animais: ${evento.animais?.length || 0}`,
                        location: evento.localizacaoNome || (evento.tipoEvento === TipoEvento.Externo ? "Destino Externo" : "Instalação Interna UCDB"),
                        startDate: evento.dataHoraInicio,
                        endDate: evento.dataHoraPrevisaoRetorno,
                      })
                      window.open(url, "_blank", "noopener,noreferrer")
                    }}
                    className="border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-700 hover:text-blue-700 text-xs font-semibold h-9 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-blue-500" />
                    <span>Google Agenda</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const url = getOutlookCalendarUrl({
                        title: `[SIGBio] ${evento.nome}`,
                        description: `Evento do Biotério UCDB.\nResponsável: ${evento.responsavel || "Não informado"}\nTipo: ${evento.tipoEvento === TipoEvento.Interno ? "Interno" : "Externo"}\nQuantidade de animais: ${evento.animais?.length || 0}`,
                        location: evento.localizacaoNome || (evento.tipoEvento === TipoEvento.Externo ? "Destino Externo" : "Instalação Interna UCDB"),
                        startDate: evento.dataHoraInicio,
                        endDate: evento.dataHoraPrevisaoRetorno,
                      })
                      window.open(url, "_blank", "noopener,noreferrer")
                    }}
                    className="border-slate-200 hover:border-sky-400 hover:bg-sky-50/50 text-slate-700 hover:text-sky-700 text-xs font-semibold h-9 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-sky-600" />
                    <span>Outlook (Web)</span>
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      downloadIcsFile({
                        title: `[SIGBio] ${evento.nome}`,
                        description: `Evento do Biotério UCDB.\nResponsável: ${evento.responsavel || "Não informado"}\nTipo: ${evento.tipoEvento === TipoEvento.Interno ? "Interno" : "Externo"}\nQuantidade de animais: ${evento.animais?.length || 0}`,
                        location: evento.localizacaoNome || (evento.tipoEvento === TipoEvento.Externo ? "Destino Externo" : "Instalação Interna UCDB"),
                        startDate: evento.dataHoraInicio,
                        endDate: evento.dataHoraPrevisaoRetorno,
                      }, `evento-${evento.id}-${evento.nome.toLowerCase().replace(/[^a-z0-9]/g, "-")}`)
                      toast.success("Arquivo .ICS baixado com sucesso!")
                    }}
                    className="border-slate-200 hover:border-emerald-400 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-700 text-xs font-semibold h-9 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Download className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Baixar .ICS</span>
                  </Button>
                </div>
              </div>

              {/* Ações Explícitas de Saída e Retorno */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-blue-900">Gerenciamento da Movimentação</h4>
                  <p className="text-xs text-blue-700">
                    {isAgendado && "O evento está aguardando confirmação de saída física dos animais."}
                    {isEmAndamento && "Animais estão no local do evento. Confirme o retorno ao regressarem ao biotério."}
                    {isConcluido && "Todas as saídas e retornos foram concluídos."}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {isAgendado && (
                    <>
                      {onEditar && (
                        <Button
                          variant="outline"
                          onClick={() => {
                            onClose()
                            onEditar(evento)
                          }}
                          className="border-slate-300 text-slate-700 hover:bg-slate-100 font-medium flex items-center gap-2"
                        >
                          <Edit className="h-4 w-4 text-slate-600" />
                          <span>Editar</span>
                        </Button>
                      )}
                      <Button
                        onClick={() => {
                          onClose()
                          onAbrirSaida(evento)
                        }}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-medium flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Confirmar Saída</span>
                      </Button>
                    </>
                  )}

                  {isEmAndamento && (
                    <Button
                      onClick={() => {
                        onClose()
                        onAbrirRetorno(evento)
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium flex items-center gap-2"
                    >
                      <LogIn className="h-4 w-4" />
                      <span>Confirmar Retorno</span>
                    </Button>
                  )}
                </div>
              </div>

              {/* Documentos Gerados (IMASUL / Evento Externo) */}
              {evento.tipoEvento === TipoEvento.Externo && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-slate-500" />
                      <span>Documento Oficial de Transporte (IMASUL)</span>
                    </h4>
                    <Button
                      size="sm"
                      onClick={handleAbrirVisualizacaoDocumento}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs gap-1.5 h-8 font-semibold shadow-sm"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Visualizar / Imprimir Documento
                    </Button>
                  </div>

                  <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 bg-white shadow-xs">
                    {documentos.length > 0 ? (
                      documentos.map((doc) => (
                        <div key={doc.id} className="p-3 text-xs flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-slate-800">
                              {doc.modeloDocumentoNome || "Formulário de Transporte de Fauna (IMASUL)"}
                            </span>
                            <div className="text-slate-500 mt-0.5">
                              Registrado em: {new Date(doc.dataCriacao).toLocaleString("pt-BR")} por {doc.rf}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded text-[11px] border border-emerald-200">
                              Emitido
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleAbrirVisualizacaoDocumento}
                              className="h-7 text-xs text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              Ver
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-xs text-slate-500 flex items-center justify-between">
                        <span>Formulário de transporte ainda não emitido para este evento externo.</span>
                        {onEditar && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              onClose()
                              onEditar(evento)
                            }}
                            className="text-xs h-7"
                          >
                            Preencher Agora
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Animais Participantes */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-800">
                  Animais Participantes ({evento.animais.length})
                </h4>
                <DataTable
                  columns={columnsAnimais}
                  data={evento.animais}
                  emptyMessage="Nenhum animal vinculado ao evento."
                />
              </div>
            </>
          )}
        </div>
      </ModalShell>

      {/* Modal de Impressão e Visualização do Documento do Evento */}
      <ModalDocumentoEvento
        isOpen={modalDocOpen}
        onClose={() => setModalDocOpen(false)}
        eventoId={evento?.id ?? null}
        eventoNome={evento?.nome}
        onEditarFormulario={
          onEditar && evento
            ? () => {
                setModalDocOpen(false)
                onClose()
                onEditar(evento)
              }
            : undefined
        }
      />
    </>
  )
}
