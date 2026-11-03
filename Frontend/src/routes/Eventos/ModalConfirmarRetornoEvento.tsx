import { useState, useEffect, useMemo } from "react"
import { toast } from "sonner"
import { LogIn, Check, RotateCcw, Building2 } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { eventoService, type EventoDetailVm, StatusEvento, TipoEvento } from "@/services/EventoService"
import { movimentacaoAnimalService, TipoMovimentacao } from "@/services/MovimentacaoAnimalService"
import { localizacaoService, type LocalizacaoListVm, Ambiente } from "@/services/LocalizacaoService"

interface ModalConfirmarRetornoEventoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  evento: EventoDetailVm | null
}

interface AnimalRetornoItem {
  id: number 
  animalId: number
  animalNumeroRegistro?: string
  animalNomePopular?: string
  animalEspecieNome?: string
  retornando: boolean
  destinoLocalizacaoId: string
}

export function ModalConfirmarRetornoEvento({
  isOpen,
  onClose,
  onSuccess,
  evento,
}: ModalConfirmarRetornoEventoProps) {
  const [submitting, setSubmitting] = useState(false)
  const [responsavel, setResponsavel] = useState("")
  const [dataHoraRetorno, setDataHoraRetorno] = useState<Date | undefined>(undefined)
  const [animais, setAnimais] = useState<AnimalRetornoItem[]>([])
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoListVm[]>([])

  // Salas internas de destino elegíveis (salas filhas do Biotério)
  const salasDestinoInternas = useMemo(() => {
    const idsPais = new Set(
      localizacoes
        .map((loc) => loc.localizacaoPaiId)
        .filter((id): id is number => id !== null && id !== undefined)
    )

    return localizacoes.filter((loc) => {
      // Devem ser internas e preferencialmente salas finais (sem filhos)
      return loc.ambiente === Ambiente.Interno && !idsPais.has(loc.id)
    })
  }, [localizacoes])

  useEffect(() => {
    if (isOpen && evento) {
      setDataHoraRetorno(new Date())
      setResponsavel(evento.responsavel || "")

      localizacaoService.getAll().then((data) => {
        setLocalizacoes(data || [])
        // Se houver salas, sugere a primeira sala interna filha como padrão
        const idsPais = new Set(
          (data || [])
            .map((loc) => loc.localizacaoPaiId)
            .filter((id): id is number => id !== null && id !== undefined)
        )
        const filhas = (data || []).filter((loc) => loc.ambiente === Ambiente.Interno && !idsPais.has(loc.id))
        const padraoId = filhas.length > 0 ? String(filhas[0].id) : ""

        setAnimais(
          evento.animais.map((a) => ({
            id: a.id,
            animalId: a.animalId,
            animalNumeroRegistro: a.animalNumeroRegistro,
            animalNomePopular: a.animalNomePopular,
            animalEspecieNome: a.animalEspecieNome,
            retornando: true,
            destinoLocalizacaoId: padraoId,
          }))
        )
      })
    }
  }, [isOpen, evento])

  const toggleRetornando = (animalId: number) => {
    setAnimais((prev) =>
      prev.map((a) => (a.animalId === animalId ? { ...a, retornando: !a.retornando } : a))
    )
  }

  const setDestinoIndividual = (animalId: number, locId: string) => {
    setAnimais((prev) =>
      prev.map((a) => (a.animalId === animalId ? { ...a, destinoLocalizacaoId: locId } : a))
    )
  }

  const toggleRetornoAll = (checked: boolean) => {
    setAnimais((prev) => prev.map((a) => ({ ...a, retornando: checked })))
  }

  const retornandoCount = animais.filter((a) => a.retornando).length

  const columns: ColumnDef<AnimalRetornoItem>[] = [
    {
      header: (
        <Checkbox
          checked={animais.length > 0 && animais.every((a) => a.retornando)}
          onCheckedChange={(checked) => toggleRetornoAll(!!checked)}
          aria-label="Confirmar retorno de todos"
        />
      ),
      accessorKey: "retornando",
      cell: (item) => (
        <Checkbox
          checked={item.retornando}
          onCheckedChange={() => toggleRetornando(item.animalId)}
          aria-label={`Confirmar retorno de ${item.animalNumeroRegistro}`}
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
      header: "Sala Filha de Destino (Biotério)",
      accessorKey: "destinoLocalizacaoId",
      cell: (item) => (
        <div className="min-w-[200px]">
          <Select
            value={item.destinoLocalizacaoId}
            onValueChange={(val) => setDestinoIndividual(item.animalId, val)}
            disabled={!item.retornando}
          >
            <SelectTrigger className="h-8 text-xs bg-white">
              <SelectValue placeholder="Selecione a sala de destino" />
            </SelectTrigger>
            <SelectContent>
              {salasDestinoInternas.map((s) => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ),
    },
  ]

  const handleSubmit = async () => {
    if (!evento) return false
    if (!dataHoraRetorno) {
      toast.error("Informe a data e hora do retorno.")
      return false
    }
    if (!responsavel.trim()) {
      toast.error("Informe o responsável pela confirmação do retorno.")
      return false
    }
    if (retornandoCount === 0) {
      toast.error("Selecione ao menos um animal retornando ao biotério.")
      return false
    }

    const confirmadosRetorno = animais.filter((a) => a.retornando)
    for (const a of confirmadosRetorno) {
      if (!a.destinoLocalizacaoId) {
        toast.error(`Selecione a sala de destino para o animal #${a.animalNumeroRegistro}.`)
        return false
      }
    }

    try {
      setSubmitting(true)

      // Para cada animal que está retornando:
      // 1. Registra movimentação do tipo RetornoEvento
      // 2. Atualiza a localização atual para a sala filha confirmada
      for (const item of confirmadosRetorno) {
        await movimentacaoAnimalService.create({
          animalId: item.animalId,
          localizacaoId: Number(item.destinoLocalizacaoId),
          tipoMovimentacao: TipoMovimentacao.RetornoEvento,
          eventoId: evento.id,
          responsavel: responsavel.trim(),
          observacao: `Retorno do evento ${evento.nome}`,
        })
      }

      // Se TODOS os animais do evento retornaram, marca o evento como Concluído
      // Caso contrário, continua Em Andamento (controle individual)
      const todosRetornaram = confirmadosRetorno.length === animais.length
      if (todosRetornaram) {
        await eventoService.update({
          id: evento.id,
          nome: evento.nome,
          tipoEvento: evento.tipoEvento,
          dataHoraInicio: evento.dataHoraInicio,
          dataHoraPrevisaoRetorno: evento.dataHoraPrevisaoRetorno,
          responsavel: responsavel.trim(),
          status: StatusEvento.Concluido,
        })
        toast.success("Todos os animais retornaram! Evento marcado como Concluído com sucesso.")
      } else {
        toast.success(
          `Retorno de ${confirmadosRetorno.length} animal(is) confirmado com sucesso! O evento continua Em Andamento para os demais.`
        )
      }

      onSuccess()
      onClose()
    } catch (err: any) {
      console.error("Erro ao confirmar retorno:", err)
      toast.error(err?.response?.data?.message || err.message || "Erro ao registrar retorno dos animais.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Confirmar Retorno do Evento"
      icon={<LogIn className="h-5 w-5" />}
      iconBg="emerald"
      size="lg"
    >
      <div className="p-6">
        <FormLayoutBase
          onSubmit={handleSubmit}
          onCancel={onClose}
          submitLabel={submitting ? "Processando..." : "Confirmar Retorno dos Animais"}
          checkIsDirty={() => true}
          titleFirstSection="Dados do Retorno ao Biotério"
          extraSections={
            <FormSection
              title={`Confirmação Individual por Animal (${retornandoCount}/${animais.length})`}
              className="mt-6"
            >
              <p className="text-xs text-slate-500 mb-3">
                O retorno é controlado individualmente. Selecione para qual sala cada animal será alocado 
                ao regressar fisicamente ao biotério.
              </p>
              <DataTable
                columns={columns}
                data={animais}
                emptyMessage="Nenhum animal para confirmar retorno."
              />
            </FormSection>
          }
        >
          <div className="space-y-4 col-span-full">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm">
              <span className="font-semibold text-slate-800">{evento?.nome}</span>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-4">
                <span>Tipo: <strong>{evento?.tipoEvento === TipoEvento.Interno ? "Interno" : "Externo"}</strong></span>
                <span>Previsão inicial de retorno: <strong>{evento ? new Date(evento.dataHoraPrevisaoRetorno).toLocaleString("pt-BR") : ""}</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Data e Hora Efetiva do Retorno" required>
                <DateTimePicker
                  date={dataHoraRetorno}
                  setDate={setDataHoraRetorno}
                  placeholder="Selecione data e hora de retorno"
                />
              </FormField>

              <ResponsavelSelect
                label="Responsável pela Recepção / Retorno"
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
