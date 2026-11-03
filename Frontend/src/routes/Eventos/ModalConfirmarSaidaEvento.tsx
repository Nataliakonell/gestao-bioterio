import { useState, useEffect } from "react"
import { toast } from "sonner"
import { LogOut, ArrowRight, Check, AlertCircle } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { eventoService, type EventoDetailVm, StatusEvento, TipoEvento } from "@/services/EventoService"
import { movimentacaoAnimalService, TipoMovimentacao } from "@/services/MovimentacaoAnimalService"
import { animalLocalizacaoService } from "@/services/AnimalLocalizacaoService"

interface ModalConfirmarSaidaEventoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  evento: EventoDetailVm | null
}

interface AnimalParticipanteItem {
  id: number 
  animalId: number
  animalNumeroRegistro?: string
  animalNomePopular?: string
  animalEspecieNome?: string
  confirmado: boolean
}

export function ModalConfirmarSaidaEvento({
  isOpen,
  onClose,
  onSuccess,
  evento,
}: ModalConfirmarSaidaEventoProps) {
  const [submitting, setSubmitting] = useState(false)
  const [responsavel, setResponsavel] = useState("")
  const [dataHoraSaida, setDataHoraSaida] = useState<Date | undefined>(undefined)
  const [animais, setAnimais] = useState<AnimalParticipanteItem[]>([])

  useEffect(() => {
    if (isOpen && evento) {
      setDataHoraSaida(new Date())
      setResponsavel(evento.responsavel || "")

      // Inicializa todos os animais como confirmados por padrão
      setAnimais(
        evento.animais.map((a) => ({
          id: a.id,
          animalId: a.animalId,
          animalNumeroRegistro: a.animalNumeroRegistro,
          animalNomePopular: a.animalNomePopular,
          animalEspecieNome: a.animalEspecieNome,
          confirmado: true,
        }))
      )
    }
  }, [isOpen, evento])

  const toggleConfirmado = (animalId: number) => {
    setAnimais((prev) =>
      prev.map((a) => (a.animalId === animalId ? { ...a, confirmado: !a.confirmado } : a))
    )
  }

  const toggleConfirmAll = (checked: boolean) => {
    setAnimais((prev) => prev.map((a) => ({ ...a, confirmado: checked })))
  }

  const selecionadosCount = animais.filter((a) => a.confirmado).length

  const columns: ColumnDef<AnimalParticipanteItem>[] = [
    {
      header: (
        <Checkbox
          checked={animais.length > 0 && animais.every((a) => a.confirmado)}
          onCheckedChange={(checked) => toggleConfirmAll(!!checked)}
          aria-label="Confirmar todos os animais"
        />
      ),
      accessorKey: "confirmado",
      cell: (item) => (
        <Checkbox
          checked={item.confirmado}
          onCheckedChange={() => toggleConfirmado(item.animalId)}
          aria-label={`Confirmar saída do animal ${item.animalNumeroRegistro}`}
        />
      ),
    },
    {
      header: "Nº Registro",
      accessorKey: "animalNumeroRegistro",
      cell: (item) => <span className="font-semibold text-slate-900">#{item.animalNumeroRegistro}</span>,
    },
    {
      header: "Espécie",
      accessorKey: "animalEspecieNome",
      cell: (item) => <span className="text-slate-800">{item.animalEspecieNome || item.animalNomePopular || "Sem espécie"}</span>,
    },
    {
      header: "Status da Saída",
      accessorKey: "status",
      cell: (item) => (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            item.confirmado ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-500 line-through"
          }`}
        >
          {item.confirmado ? "Confirmado para Saída" : "Não participará"}
        </span>
      ),
    },
  ]

  const handleSubmit = async () => {
    if (!evento) return false
    if (!dataHoraSaida) {
      toast.error("Informe a data e hora efetiva da saída.")
      return false
    }
    if (!responsavel.trim()) {
      toast.error("Informe o responsável pela confirmação da saída.")
      return false
    }
    if (selecionadosCount === 0) {
      toast.error("Selecione ao menos um animal confirmado para a saída do evento.")
      return false
    }

    try {
      setSubmitting(true)
      const confirmados = animais.filter((a) => a.confirmado)

      // Para cada animal confirmado:
      // 1. Obtém a localização atual do animal para registrar como origem na movimentação de saída
      // 2. Registra movimentação do tipo SaidaEvento associada ao evento
      const todasLocalizacoes = await animalLocalizacaoService.getAll().catch(() => [])
      const locMap = new Map(todasLocalizacoes.map((loc) => [loc.animalId, loc.localizacaoId]))

      for (const item of confirmados) {
        const localizacaoOrigemId = locMap.get(item.animalId) || 1 // Fallback para 1 (UCDB) se não tiver sala

        const resMov = await movimentacaoAnimalService.create({
          animalId: item.animalId,
          localizacaoId: localizacaoOrigemId,
          tipoMovimentacao: TipoMovimentacao.SaidaEvento,
          eventoId: evento.id,
          responsavel: responsavel.trim(),
          observacao: `Saída para o evento: ${evento.nome}`,
        })

        if (resMov && resMov.success === false) {
          throw new Error(resMov.message || resMov.validationErrors?.join(", ") || "Falha ao registrar movimentação de saída.")
        }
      }

      // 3. Atualiza o status do evento para EmAndamento
      await eventoService.update({
        id: evento.id,
        nome: evento.nome,
        tipoEvento: evento.tipoEvento,
                dataHoraInicio: evento.dataHoraInicio,
        dataHoraPrevisaoRetorno: evento.dataHoraPrevisaoRetorno,
        responsavel: responsavel.trim(),
        status: StatusEvento.EmAndamento,
      })

      toast.success(
        `Saída de ${confirmados.length} animal(is) confirmada com sucesso! O evento está Em Andamento.`
      )
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Erro ao confirmar saída do evento:", err)
      toast.error(err?.response?.data?.message || err.message || "Erro ao confirmar saída dos animais.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Saída para o Evento"
      icon={<LogOut className="h-5 w-5" />}
      iconBg="amber"
      size="md"
    >
      <div className="p-6">
        <FormLayoutBase
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel={submitting ? "Processando..." : "Confirmar Saída Efetiva"}
          checkIsDirty={() => true}
          titleFirstSection="Dados da Saída Efetiva"
          extraSections={
            <FormSection
              title={`Confirmação dos Animais Participantes (${selecionadosCount}/${animais.length})`}
              className="mt-6"
            >
              <p className="text-xs text-slate-500 mb-3">
                Desmarque os animais que eventualmente não irão participar. Somente os animais marcados terão 
                saída registrada e localização alterada.
              </p>
              <DataTable
                columns={columns}
                data={animais}
                emptyMessage="Nenhum animal vinculado a este evento."
              />
            </FormSection>
          }
        >
          <div className="space-y-4 col-span-full">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <span className="font-semibold text-slate-800">{evento?.nome}</span>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-4">
                <span>Tipo: <strong>{evento?.tipoEventoDescricao}</strong></span>
                
                <span>Previsão de Retorno: <strong>{evento ? new Date(evento.dataHoraPrevisaoRetorno).toLocaleString("pt-BR") : ""}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Data e Hora Efetiva da Saída" required>
                <DateTimePicker
                  date={dataHoraSaida}
                  setDate={setDataHoraSaida}
                  placeholder="Selecione data e hora de saída"
                />
              </FormField>

              <ResponsavelSelect
                label="Responsável pela Saída"
                value={responsavel}
                onChange={setResponsavel}
                required
              />
            </div>
          </div>
        </FormLayoutBase>
      </div>
    </ModalShell>
  )
}
