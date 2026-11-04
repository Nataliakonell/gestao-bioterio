import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { Calendar as CalendarIcon, MapPin, User, FileText, Check, AlertTriangle, Eye, AlertCircle } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { Checkbox } from "@/components/ui/checkbox"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { Button } from "@/components/ui/button"
import { formatToLocalIso } from "@/lib/date"
import { formatarLocalizacao } from "@/lib/utils"
import { eventoService, TipoEvento, StatusEvento, type EventoDetailVm } from "@/services/EventoService"
import { eventoAnimalService } from "@/services/EventoAnimalService"
import { localizacaoService, type LocalizacaoListVm, Ambiente } from "@/services/LocalizacaoService"
import { animalService, type AnimalListItem } from "@/services/animalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { documentoEventoService } from "@/services/DocumentoEventoService"
import { modeloDocumentoService, TipoDocumento, type ModeloDocumentoVm } from "@/services/ModeloDocumentoService"
import { FormularioTransporteFauna, type DadosTransporteFauna, TEXTO_PADRAO_CONDUTOR_VEICULOS } from "./FormularioTransporteFauna"
import { ModalDocumentoEvento } from "./ModalDocumentoEvento"

const generoMap: Record<number | string, string> = {
  1: "Macho",
  2: "Fêmea",
  3: "Não Identificado",
  "1": "Macho",
  "2": "Fêmea",
  "3": "Não Identificado",
  Macho: "Macho",
  Fêmea: "Fêmea",
  Femea: "Fêmea",
  "Não Identificado": "Não Identificado",
}

export function formatarGenero(genero: any): string {
  if (genero === undefined || genero === null || genero === "") return "Não informado"
  return generoMap[genero] || String(genero)
}

interface ModalAgendarEventoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  eventoParaEditar?: EventoDetailVm | null
  dataInicialPredefinida?: string | null
}

export function ModalAgendarEvento({
  isOpen,
  onClose,
  onSuccess,
  eventoParaEditar,
  dataInicialPredefinida,
}: ModalAgendarEventoProps) {
  const [submitting, setSubmitting] = useState(false)

  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [dataHoraInicio, setDataHoraInicio] = useState<Date | undefined>(undefined)
  const [dataHoraPrevisaoRetorno, setDataHoraPrevisaoRetorno] = useState<Date | undefined>(undefined)
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>(TipoEvento.Interno)
  const [responsavel, setResponsavel] = useState("")
  const [todosAnimais, setTodosAnimais] = useState<AnimalListItem[]>([])
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<number>>(new Set())
  const [loadingAnimais, setLoadingAnimais] = useState(false)
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoListVm[]>([])
  const [especiesLookup, setEspeciesLookup] = useState<EspecieLookupVm[]>([])
  const [modelosDocumento, setModelosDocumento] = useState<ModeloDocumentoVm[]>([])
  const [modeloDocId, setModeloDocId] = useState<string>("")
  const [modalPreviewDocOpen, setModalPreviewDocOpen] = useState(false)
  const [gerarDocumento, setGerarDocumento] = useState(false)
  const [dadosTransporte, setDadosTransporte] = useState<DadosTransporteFauna>({
    destTipo: "Expositor",
    destOutrosEspecificar: "",
    destNome: "",
    destCpfCnpj: "",
    destEndereco: "",
    destBairro: "",
    destMunicipio: "Campo Grande / MS",
    destCep: "",
    destTelefone: "",
    destCtf: "",
    objetoTipo: "Exposição de animais silvestres",
    objetoOutrosEspecificar: "",
    transporteMeio: "Terrestre - Rodoviário",
    transporteCondutoresVeiculos: TEXTO_PADRAO_CONDUTOR_VEICULOS,
    transporteRota: "Av. Tamandaré / Av. Duque de Caxias",
    transporteData: ""
  })

  const [searchAnimal, setSearchAnimal] = useState("")
  const [selectedEspecie, setSelectedEspecie] = useState("")

  // Histórico de eventos dos animais para a regra dos 30 dias
  // Chave: animalId -> { eventoId, eventoNome, dataHoraInicio: Date, diasDiferenca: number }
  const [historicoEventosAnimais, setHistoricoEventosAnimais] = useState<
    Map<number, { eventoId: number; eventoNome: string; dataEvento: string; diasAtras: number }>
  >(new Map())

  // Estado do aviso/confirmação de intervalo de 30 dias
  const [alertaAnimal30Dias, setAlertaAnimal30Dias] = useState<{
    animalId: number
    numeroRegistro: string
    especieNome: string
    diasAtras: number
    dataEvento: string
    eventoNome: string
    acaoPendente: () => void
  } | null>(null)

  const handleUpdateTransporte = (novosDados: Partial<DadosTransporteFauna>) => {
    setDadosTransporte(prev => ({ ...prev, ...novosDados }))
  }

  useEffect(() => {
    if (isOpen) {
      if (eventoParaEditar) {
        setNome(eventoParaEditar.nome || "")
        setDescricao("")
        setDataHoraInicio(eventoParaEditar.dataHoraInicio ? new Date(eventoParaEditar.dataHoraInicio) : undefined)
        setDataHoraPrevisaoRetorno(eventoParaEditar.dataHoraPrevisaoRetorno ? new Date(eventoParaEditar.dataHoraPrevisaoRetorno) : undefined)
        setTipoEvento(eventoParaEditar.tipoEvento)
        setResponsavel(eventoParaEditar.responsavel || "")

        const animalIds = new Set<number>()
        if (eventoParaEditar.animais && eventoParaEditar.animais.length > 0) {
          eventoParaEditar.animais.forEach((a) => animalIds.add(a.animalId))
        }
        setSelectedAnimalIds(animalIds)

        // Se for externo, tenta buscar documento vinculado existente
        if (eventoParaEditar.tipoEvento === TipoEvento.Externo) {
          documentoEventoService.getAll(eventoParaEditar.id).then((docs) => {
            if (docs && docs.length > 0) {
              setGerarDocumento(true)
              try {
                const parsed = JSON.parse(docs[0].conteudoDadosJson || "{}")
                if (parsed.destinatario || parsed.transporte) {
                  setDadosTransporte({
                    destTipo: parsed.destinatario?.tipo || "Expositor",
                    destOutrosEspecificar: parsed.destinatario?.outrosEspecificar || "",
                    destNome: parsed.destinatario?.nomeRazaoSocial || "",
                    destCpfCnpj: parsed.destinatario?.cpfCnpj || "",
                    destEndereco: parsed.destinatario?.endereco || "",
                    destBairro: parsed.destinatario?.bairro || "",
                    destMunicipio: parsed.destinatario?.municipio || "Campo Grande / MS",
                    destCep: parsed.destinatario?.cep || "",
                    destTelefone: parsed.destinatario?.telefone || "",
                    destCtf: parsed.destinatario?.ctf || "",
                    objetoTipo: parsed.objeto?.tipo || "Exposição de animais silvestres",
                    objetoOutrosEspecificar: parsed.objeto?.especificar || "",
                    transporteMeio: parsed.transporte?.meio || "Terrestre - Rodoviário",
                    transporteCondutoresVeiculos: parsed.transporte?.condutorDados || TEXTO_PADRAO_CONDUTOR_VEICULOS,
                    transporteRota: parsed.transporte?.rota || "",
                    transporteData: parsed.transporte?.data || ""
                  })
                }
              } catch (e) {
                console.error("Erro ao carregar dados do documento do evento:", e)
              }
            }
          }).catch(() => {})
        }
      } else {
        // Reset form para criação
        setNome("")
        setDescricao("")
        let startDt: Date
        let endDt: Date

        if (dataInicialPredefinida) {
          const partes = dataInicialPredefinida.split("-")
          if (partes.length === 3) {
            const ano = parseInt(partes[0], 10)
            const mes = parseInt(partes[1], 10) - 1
            const dia = parseInt(partes[2], 10)
            startDt = new Date(ano, mes, dia, 9, 0, 0)
            endDt = new Date(ano, mes, dia, 18, 0, 0)
          } else {
            const now = new Date()
            startDt = new Date(now.getTime() + 60 * 60 * 1000)
            endDt = new Date(now.getTime() + 48 * 60 * 60 * 1000)
          }
        } else {
          const now = new Date()
          startDt = new Date(now.getTime() + 60 * 60 * 1000)
          endDt = new Date(now.getTime() + 48 * 60 * 60 * 1000)
        }

        setDataHoraInicio(startDt)
        setDataHoraPrevisaoRetorno(endDt)
        setTipoEvento(TipoEvento.Interno)
        setSelectedAnimalIds(new Set())
        setResponsavel("")
        setGerarDocumento(false)

        const dataStr = `${startDt.toLocaleDateString("pt-BR")} – ${endDt.toLocaleDateString("pt-BR")}`
        setDadosTransporte({
          destTipo: "Expositor",
          destOutrosEspecificar: "",
          destNome: "",
          destCpfCnpj: "",
          destEndereco: "",
          destBairro: "",
          destMunicipio: "Campo Grande / MS",
          destCep: "",
          destTelefone: "",
          destCtf: "",
          objetoTipo: "Exposição de animais silvestres",
          objetoOutrosEspecificar: "",
          transporteMeio: "Terrestre - Rodoviário",
          transporteCondutoresVeiculos: TEXTO_PADRAO_CONDUTOR_VEICULOS,
          transporteRota: "Av. Tamandaré / Av. Duque de Caxias",
          transporteData: dataStr
        })
      }

      setSearchAnimal("")
      setSelectedEspecie("")

      // Carga de dados auxiliares
      Promise.all([
        localizacaoService.getAll().catch(() => []),
        especieService.getLookup().catch(() => []),
        modeloDocumentoService.getAll().catch(() => []),
      ]).then(([locs, specs, docs]) => {
        setLocalizacoes(locs || [])
        setEspeciesLookup(specs || [])
        setModelosDocumento(docs || [])
        if (docs && docs.length > 0) {
          const modeloExterno = docs.find(
            (d) => d.tipoDocumento === TipoDocumento.DocumentoDeEventoExterno
          )
          setModeloDocId(String(modeloExterno ? modeloExterno.id : docs[0].id))
        }
      })

      // Carga de animais e histórico de eventos para a regra dos 30 dias
      setLoadingAnimais(true)
      Promise.all([
        animalService.getAllPaginated({ page: 1, pageSize: 250, situacaoAnimal: 1 }).catch(() => ({ items: [] })),
        eventoService.getAll().catch(() => []),
        eventoAnimalService.getAll().catch(() => []),
      ])
        .then(([resAnimais, todosEventos, todosEventosAnimais]) => {
          setTodosAnimais(resAnimais.items || [])

          // Processar histórico de eventos por animal
          const mapaHistorico = new Map<
            number,
            { eventoId: number; eventoNome: string; dataEvento: string; diasAtras: number }
          >()

          const eventoMap = new Map<number, (typeof todosEventos)[0]>()
          todosEventos.forEach((ev) => eventoMap.set(ev.id, ev))

          const hoje = new Date()

          todosEventosAnimais.forEach((ea) => {
            // Ignorar o próprio evento se estiver editando
            if (eventoParaEditar && ea.eventoId === eventoParaEditar.id) return

            const ev = eventoMap.get(ea.eventoId)
            if (!ev) return

            // Não considerar eventos cancelados
            if (isStatusCancelado(ev.status)) return

            const dataEv = new Date(ev.dataHoraInicio)
            // Considerar eventos que já ocorreram ou estão ocorrendo
            const diffMs = hoje.getTime() - dataEv.getTime()
            const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

            // Se for dentro dos últimos 30 dias (ou se o evento for recente/futuro próximo com menos de 30 dias de intervalo)
            if (diffDias >= 0 && diffDias <= 30) {
              const existente = mapaHistorico.get(ea.animalId)
              if (!existente || diffDias < existente.diasAtras) {
                mapaHistorico.set(ea.animalId, {
                  eventoId: ev.id,
                  eventoNome: ev.nome || "Evento",
                  dataEvento: dataEv.toLocaleDateString("pt-BR"),
                  diasAtras: diffDias,
                })
              }
            }
          })

          setHistoricoEventosAnimais(mapaHistorico)
        })
        .catch(() => {
          toast.error("Erro ao carregar plantel de animais ou histórico de eventos.")
        })
        .finally(() => {
          setLoadingAnimais(false)
        })
    }
  }, [isOpen, eventoParaEditar])

  // Atualiza data do transporte se usuário alterar dataInicio/retorno
  useEffect(() => {
    if (dataHoraInicio && dataHoraPrevisaoRetorno) {
      const d1 = dataHoraInicio.toLocaleDateString("pt-BR")
      const d2 = dataHoraPrevisaoRetorno.toLocaleDateString("pt-BR")
      setDadosTransporte((prev) => ({
        ...prev,
        transporteData: prev.transporteData ? prev.transporteData : `${d1} – ${d2}`
      }))
    }
  }, [dataHoraInicio, dataHoraPrevisaoRetorno])

  // Filtragem dos animais disponíveis
  const animaisFiltrados = useMemo(() => {
    return todosAnimais.filter((animal) => {
      const matchesSearch =
        !searchAnimal ||
        animal.numeroRegistro?.toLowerCase().includes(searchAnimal.toLowerCase()) ||
        animal.especieNome?.toLowerCase().includes(searchAnimal.toLowerCase()) ||
        animal.nomePopular?.toLowerCase().includes(searchAnimal.toLowerCase())

      const isVivo = animal.situacao === 1 || String(animal.situacao) === "1" || String((animal as any).situacaoAnimal) === "1";
      if (!isVivo && animal.situacao !== undefined) return false;

      const matchesEspecie =
        !selectedEspecie || String(animal.especieId) === selectedEspecie

      return matchesSearch && matchesEspecie
    })
  }, [todosAnimais, searchAnimal, selectedEspecie])

  // Mapeamento dos animais selecionados para a Seção 3 e para o IMASUL
  const animaisSelecionadosInfo = useMemo(() => {
    return Array.from(selectedAnimalIds).map((id) => {
      const item = todosAnimais.find((a) => a.id === id)
      return {
        id,
        numeroRegistro: item?.numeroRegistro || `#${id}`,
        numeroChip: item?.numeroChip || item?.numeroRegistro || `#${id}`,
        especieNome: item?.especieNome || item?.nomePopular || "Espécie não informada",
        genero: formatarGenero(item?.genero)
      }
    })
  }, [selectedAnimalIds, todosAnimais])

  // Toggle de seleção de animal com checagem da regra dos 30 dias
  const toggleAnimal = (id: number) => {
    const next = new Set(selectedAnimalIds)
    if (next.has(id)) {
      next.delete(id)
      setSelectedAnimalIds(next)
      return
    }

    // Se está sendo marcado, verificar se participou de evento em menos de 30 dias
    const historico = historicoEventosAnimais.get(id)
    if (historico) {
      const animal = todosAnimais.find((a) => a.id === id)
      setAlertaAnimal30Dias({
        animalId: id,
        numeroRegistro: animal?.numeroRegistro ? `#${animal.numeroRegistro}` : `#${id}`,
        especieNome: animal?.especieNome || animal?.nomePopular || "Espécie não informada",
        diasAtras: historico.diasAtras,
        dataEvento: historico.dataEvento,
        eventoNome: historico.eventoNome,
        acaoPendente: () => {
          const updated = new Set(selectedAnimalIds)
          updated.add(id)
          setSelectedAnimalIds(updated)
          setAlertaAnimal30Dias(null)
        },
      })
      return
    }

    next.add(id)
    setSelectedAnimalIds(next)
  }

  // Toggle de selecionar todos os animais filtrados com aviso se houver animais com eventos < 30 dias
  const toggleSelectAll = () => {
    const next = new Set(selectedAnimalIds)
    const allFilteredSelected = animaisFiltrados.length > 0 && animaisFiltrados.every((a) => next.has(a.id))

    if (allFilteredSelected) {
      animaisFiltrados.forEach((a) => next.delete(a.id))
      setSelectedAnimalIds(next)
      return
    }

    // Verificar se algum animal a ser incluído violaria o intervalo recomendado de 30 dias
    const animaisComAlerta = animaisFiltrados.filter(
      (a) => !next.has(a.id) && historicoEventosAnimais.has(a.id)
    )

    if (animaisComAlerta.length > 0) {
      const primeiro = animaisComAlerta[0]
      const hist = historicoEventosAnimais.get(primeiro.id)!
      const plural = animaisComAlerta.length > 1
      setAlertaAnimal30Dias({
        animalId: primeiro.id,
        numeroRegistro: plural
          ? `${animaisComAlerta.map((a) => (a.numeroRegistro ? `#${a.numeroRegistro}` : `#${a.id}`)).join(", ")}`
          : primeiro.numeroRegistro ? `#${primeiro.numeroRegistro}` : `#${primeiro.id}`,
        especieNome: plural ? `${animaisComAlerta.length} animais` : primeiro.especieNome || primeiro.nomePopular || "Espécie",
        diasAtras: hist.diasAtras,
        dataEvento: hist.dataEvento,
        eventoNome: hist.eventoNome,
        acaoPendente: () => {
          const updated = new Set(selectedAnimalIds)
          animaisFiltrados.forEach((a) => updated.add(a.id))
          setSelectedAnimalIds(updated)
          setAlertaAnimal30Dias(null)
        },
      })
      return
    }

    animaisFiltrados.forEach((a) => next.add(a.id))
    setSelectedAnimalIds(next)
  }

  // Colunas da tabela de animais
  const columns: ColumnDef<AnimalListItem>[] = [
    {
      header: (
        <Checkbox
          checked={animaisFiltrados.length > 0 && animaisFiltrados.every((a) => selectedAnimalIds.has(a.id))}
          onCheckedChange={toggleSelectAll}
          aria-label="Selecionar todos os animais filtrados"
        />
      ),
      accessorKey: "select",
      cell: (animal) => (
        <Checkbox
          checked={selectedAnimalIds.has(animal.id)}
          onCheckedChange={() => toggleAnimal(animal.id)}
          aria-label={`Selecionar animal ${animal.numeroRegistro}`}
        />
      ),
    },
    {
      header: "Nº de Registro",
      accessorKey: "numeroRegistro",
      cell: (animal) => {
        const hist = historicoEventosAnimais.get(animal.id)
        return (
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-900 dark:text-zinc-100 font-mono">
              {animal.numeroRegistro ? `#${animal.numeroRegistro}` : `#${animal.id}`}
            </span>
            {hist && (
              <span
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                title={`Esteve no evento '${hist.eventoNome}' há ${hist.diasAtras} dia(s) (${hist.dataEvento})`}
              >
                <AlertTriangle className="h-3 w-3" />
                {hist.diasAtras}d
              </span>
            )}
          </div>
        )
      },
    },
    {
      header: "Chip",
      accessorKey: "numeroChip",
      cell: (animal) => (
        <span className="font-mono text-slate-700 dark:text-zinc-300">
          {animal.numeroChip || "-"}
        </span>
      ),
    },
    {
      header: "Espécie",
      accessorKey: "especieNome",
      cell: (animal) => (
        <span className="text-slate-800 dark:text-zinc-200 italic font-medium">
          {animal.especieNome || animal.nomePopular || "Não informada"}
        </span>
      ),
    },
    {
      header: "Gênero",
      accessorKey: "genero",
      cell: (animal) => (
        <span className="text-slate-700 dark:text-zinc-300">
          {formatarGenero(animal.genero)}
        </span>
      ),
    },
    {
      header: "Localização Atual",
      accessorKey: "localizacaoHierarquia",
      cell: (animal) => {
        const localRaw = animal.localizacaoNome || animal.localizacaoHierarquia || animal.instalacaoBioterioNome || "Sem localização";
        const local = formatarLocalizacao(localRaw, "Sem localização")
        return (
          <span className="text-xs text-slate-700 dark:text-zinc-200 bg-slate-100 dark:bg-zinc-800/80 border border-slate-200 dark:border-zinc-700 px-2 py-0.5 rounded-md font-medium">
            {local}
          </span>
        )
      },
    },
  ]

  const buildDocumentoPayloadJson = () => {
    return JSON.stringify({
      requerente: {
        nomeRazaoSocial: "Universidade Católica Dom Bosco",
        cnpjCpf: "03.226.149/0015-87",
        endereco: "Avenida Tamandaré nº 6000",
        bairro: "Jardim Seminário",
        municipio: "Campo Grande/MS",
        cep: "79002-220",
        telefone: "(67) 3312-3688",
        ctf: ""
      },
      destinatario: {
        tipo: dadosTransporte.destTipo,
        outrosEspecificar: dadosTransporte.destOutrosEspecificar,
        nomeRazaoSocial: dadosTransporte.destNome,
        cpfCnpj: dadosTransporte.destCpfCnpj,
        endereco: dadosTransporte.destEndereco,
        bairro: dadosTransporte.destBairro,
        municipio: dadosTransporte.destMunicipio,
        cep: dadosTransporte.destCep,
        telefone: dadosTransporte.destTelefone,
        ctf: dadosTransporte.destCtf
      },
      objeto: {
        tipo: dadosTransporte.objetoTipo,
        especificar: dadosTransporte.objetoOutrosEspecificar
      },
      transporte: {
        meio: dadosTransporte.transporteMeio,
        condutorDados: dadosTransporte.transporteCondutoresVeiculos,
        rota: dadosTransporte.transporteRota,
        data: dadosTransporte.transporteData
      },
      animais: animaisSelecionadosInfo.map((a) => ({
        animalId: a.id,
        numeroRegistro: a.numeroRegistro,
        especieNome: a.especieNome,
        sexo: a.genero,
        chip: a.numeroRegistro
      })),
      dataDeclaracao: new Date().toLocaleDateString("pt-BR")
    })
  }

  // Validação e Envio
  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error("Informe o nome/título do evento.")
      return
    }

    if (!dataHoraInicio) {
      toast.error("Informe a data e horário de início do evento.")
      return
    }

    if (!dataHoraPrevisaoRetorno) {
      toast.error("Informe a data e horário de previsão de retorno.")
      return
    }

    if (dataHoraPrevisaoRetorno <= dataHoraInicio) {
      toast.error("A data/hora de previsão de retorno deve ser posterior ao início.")
      return
    }

    if (selectedAnimalIds.size === 0) {
      toast.error("Selecione ao menos um animal participante para o evento.")
      return
    }

    // Se for evento externo com geração de documento ativada, valida dados essenciais
    if (tipoEvento === TipoEvento.Externo && gerarDocumento) {
      if (!dadosTransporte.destNome.trim()) {
        toast.error("Informe o Nome / Razão Social do destinatário para o documento.")
        return
      }
      if (!dadosTransporte.destCpfCnpj.trim()) {
        toast.error("Informe o CNPJ / CPF do destinatário para o documento.")
        return
      }
      if (!dadosTransporte.transporteRota.trim()) {
        toast.error("Informe as rodovias utilizadas (rota) no transporte para o documento.")
        return
      }
    }

    setSubmitting(true)
    try {
      if (eventoParaEditar) {
        // Modo Edição
        await eventoService.update({
          id: eventoParaEditar.id,
          nome: nome.trim(),
          tipoEvento,
          dataHoraInicio: formatToLocalIso(dataHoraInicio),
          dataHoraPrevisaoRetorno: formatToLocalIso(dataHoraPrevisaoRetorno),
          responsavel: responsavel.trim(),
          status: eventoParaEditar.status,
          animalIds: Array.from(selectedAnimalIds),
        })

        // Sincronização dos animais
        const animaisAtuais = eventoParaEditar.animais || []
        const currentAnimalIds = new Set(animaisAtuais.map((a) => a.animalId))

        const toAdd = Array.from(selectedAnimalIds).filter((id) => !currentAnimalIds.has(id))
        for (const animalId of toAdd) {
          try {
            await eventoAnimalService.create({
              eventoId: eventoParaEditar.id,
              animalId,
            })
          } catch (e) {
            console.error("Erro ao adicionar animal ao evento:", e)
          }
        }

        const toRemove = animaisAtuais.filter((a) => !selectedAnimalIds.has(a.animalId))
        for (const item of toRemove) {
          try {
            await eventoAnimalService.delete(item.id)
          } catch (e) {
            console.error("Erro ao remover animal do evento:", e)
          }
        }

        // Se for externo, atualiza ou cria o DocumentoEvento apenas se a emissão estiver habilitada
        if (tipoEvento === TipoEvento.Externo && gerarDocumento) {
          const docs = await documentoEventoService.getAll(eventoParaEditar.id).catch(() => [])
          const modeloId = Number(modeloDocId) || (modelosDocumento[0]?.id ?? 1)
          const payloadJson = buildDocumentoPayloadJson()

          if (docs && docs.length > 0) {
            await documentoEventoService.update({
              id: docs[0].id,
              eventoId: eventoParaEditar.id,
              modeloDocumentoId: modeloId,
              conteudoDadosJson: payloadJson
            })
          } else {
            await documentoEventoService.create({
              eventoId: eventoParaEditar.id,
              modeloDocumentoId: modeloId,
              conteudoDadosJson: payloadJson
            })
          }
        }

        toast.success("Agendamento de evento atualizado com sucesso!")
        onSuccess()
        onClose()
        return
      }

      // Modo Criação
      const res = await eventoService.create({
        nome: nome.trim(),
        tipoEvento,
        dataHoraInicio: formatToLocalIso(dataHoraInicio),
        dataHoraPrevisaoRetorno: formatToLocalIso(dataHoraPrevisaoRetorno),
        responsavel: responsavel.trim(),
        status: StatusEvento.Agendado,
        animalIds: Array.from(selectedAnimalIds),
      })

      if (res && res.success) {
        // Se for evento externo com geração de documento habilitada, gera também o DocumentoEvento oficial
        if (tipoEvento === TipoEvento.Externo && gerarDocumento && res.id) {
          const modeloId = Number(modeloDocId) || (modelosDocumento[0]?.id ?? 1)
          const dadosDocJson = buildDocumentoPayloadJson()

          try {
            await documentoEventoService.create({
              eventoId: res.id,
              modeloDocumentoId: modeloId,
              conteudoDadosJson: dadosDocJson,
            })
          } catch (e) {
            console.error("Erro ao gerar DocumentoEvento associado:", e)
          }
        }

        toast.success("Evento agendado com sucesso! Os animais permanecem em suas salas até a confirmação de saída.")
        onSuccess()
        onClose()
      } else {
        toast.error(res?.message || "Erro ao agendar o evento.")
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err.message || "Erro ao agendar evento.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={onClose}
        title={eventoParaEditar ? "Editar Agendamento de Evento" : "Agendar Novo Evento"}
        icon={<CalendarIcon className="h-5 w-5" />}
        iconBg="blue"
        size="lg"
      >
        <div className="p-6">
          <FormLayoutBase
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel={submitting ? "Salvando..." : eventoParaEditar ? "Salvar Alterações" : "Salvar Agendamento"}
            checkIsDirty={() => !!nome || selectedAnimalIds.size > 0}
            titleFirstSection="Informações Gerais do Evento"
            columnsClassName="grid-cols-1"
            extraSections={
              <>
                {/* Se for Evento Externo: Seção Opcional de Transporte de Fauna (IMASUL) */}
                {tipoEvento === TipoEvento.Externo && (
                  <FormSection
                    title="Formulário de Transporte de Fauna (Oficial IMASUL)"
                    className="mt-6"
                  >
                    <div className="bg-slate-50 border border-slate-200 dark:bg-zinc-900/50 dark:border-zinc-800 p-4 rounded-xl mb-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id="check-gerar-doc"
                          checked={gerarDocumento}
                          onCheckedChange={(checked) => setGerarDocumento(Boolean(checked))}
                        />
                        <div className="grid gap-1 leading-none">
                          <Label
                            htmlFor="check-gerar-doc"
                            className="text-sm font-bold text-slate-800 dark:text-zinc-100 cursor-pointer"
                          >
                            Emitir Formulário Oficial de Transporte de Fauna para este evento
                          </Label>
                          <p className="text-xs text-slate-500 dark:text-zinc-400">
                            Habilite para preencher os dados de destinatário, veículo e rota e gerar o documento oficial para download/impressão.
                          </p>
                        </div>
                      </div>
                    </div>

                    {gerarDocumento && (
                      <FormularioTransporteFauna
                        dados={dadosTransporte}
                        onChange={handleUpdateTransporte}
                        animaisSelecionados={animaisSelecionadosInfo}
                        onRemoverAnimal={(animalId) => {
                          const next = new Set(selectedAnimalIds)
                          next.delete(animalId)
                          setSelectedAnimalIds(next)
                        }}
                      />
                    )}
                  </FormSection>
                )}

                {/* Seção 2: Seleção dos Animais Participantes */}
                <FormSection
                  title={`Seleção de Animais Participantes (${selectedAnimalIds.size} selecionado${selectedAnimalIds.size !== 1 ? "s" : ""})`}
                  className="mt-6"
                >
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4">
                    <BarraDeBuscaEFiltro
                      search={searchAnimal}
                      onSearchChange={setSearchAnimal}
                      placeholder="Buscar animal por registro ou espécie..."
                      filterSections={[
                        {
                          key: "especie",
                          label: "Espécie",
                          options: especiesLookup.map((esp) => ({
                            id: String(esp.id),
                            label: esp.nomeCientifico || esp.nomeVulgar,
                          })),
                          selectedValue: selectedEspecie,
                          onSelect: setSelectedEspecie,
                        },
                      ]}
                      onClearFilters={() => {
                        setSearchAnimal("")
                        setSelectedEspecie("")
                      }}
                    />


                  </div>

                  <DataTable
                    columns={columns}
                    data={animaisFiltrados}
                    loading={loadingAnimais}
                    emptyMessage="Nenhum animal encontrado para os filtros informados."
                  />
                </FormSection>
              </>
            }
          >
            <div className="w-full space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <FormField label="Nome do Evento" required className="w-full">
                  <Input
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Ex: Exposição de Serpentes na UCDB"
                    maxLength={200}
                    disabled={submitting}
                    className="w-full"
                  />
                </FormField>

                <FormField label="Tipo de Evento" required className="w-full">
                  <RadioGroup
                    value={String(tipoEvento)}
                    onValueChange={(val) => setTipoEvento(Number(val) as TipoEvento)}
                    className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2 w-full"
                    disabled={submitting}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={String(TipoEvento.Interno)} id="tipo-interno" />
                      <Label htmlFor="tipo-interno" className="font-medium cursor-pointer text-sm whitespace-nowrap">
                        Interno (Na UCDB)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={String(TipoEvento.Externo)} id="tipo-externo" />
                      <Label htmlFor="tipo-externo" className="font-medium cursor-pointer text-sm whitespace-nowrap">
                        Externo (Fora da UCDB)
                      </Label>
                    </div>
                  </RadioGroup>
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                <FormField label="Data e Horário de Início" required className="w-full">
                  <DateTimePicker
                    date={dataHoraInicio}
                    setDate={setDataHoraInicio}
                    disabled={submitting}
                    className="w-full"
                  />
                </FormField>

                <FormField label="Previsão de Retorno dos Animais" required className="w-full">
                  <DateTimePicker
                    date={dataHoraPrevisaoRetorno}
                    setDate={setDataHoraPrevisaoRetorno}
                    disabled={submitting}
                    className="w-full"
                  />
                </FormField>
              </div>

              <div className="w-full">
                <ResponsavelSelect
                  label="Responsável pelo Evento"
                  value={responsavel}
                  onChange={setResponsavel}
                  placeholder="Selecione o pesquisador ou técnico responsável..."
                  disabled={submitting}
                  required
                  className="w-full"
                />
              </div>
            </div>
          </FormLayoutBase>
        </div>
      </ModalShell>

      {/* Modal de Confirmação da Regra de 30 dias de Intervalo */}
      {alertaAnimal30Dias && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setAlertaAnimal30Dias(null)}
          />
          <div className="relative w-full max-w-lg scale-100 rounded-2xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-zinc-900 p-6 shadow-2xl transition-all animate-in fade-in zoom-in-95">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100">
                  Aviso: Intervalo entre Eventos
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300 leading-relaxed">
                  O ideal é que cada animal saia para eventos a cada <strong className="text-slate-800 dark:text-zinc-100 font-semibold">30 dias</strong>.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
                  <div>
                    Animal: <strong className="font-mono font-bold">{alertaAnimal30Dias.numeroRegistro}</strong> ({alertaAnimal30Dias.especieNome})
                  </div>
                  <div>
                    Último evento: <strong>{alertaAnimal30Dias.eventoNome}</strong>
                  </div>
                  <div>
                    Data do evento: <strong>{alertaAnimal30Dias.dataEvento}</strong> (há <strong>{alertaAnimal30Dias.diasAtras}</strong> dia{alertaAnimal30Dias.diasAtras !== 1 ? "s" : ""})
                  </div>
                </div>
                <p className="mt-3 text-sm font-medium text-slate-800 dark:text-zinc-200">
                  Tem certeza que deseja enviar o animal <span className="font-mono font-bold text-amber-700 dark:text-amber-400">{alertaAnimal30Dias.numeroRegistro}</span> para o evento mesmo ele tendo participado de um evento em menos de 30 dias?
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setAlertaAnimal30Dias(null)}
                className="rounded-xl border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 h-10 px-4"
              >
                Cancelar
              </Button>
              <Button
                onClick={() => {
                  alertaAnimal30Dias.acaoPendente()
                }}
                className="rounded-xl bg-amber-600 hover:bg-amber-700 text-white h-10 px-4 shadow-sm font-semibold"
              >
                Sim, incluir animal
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Prévia do Documento se necessário */}
      {eventoParaEditar && (
        <ModalDocumentoEvento
          isOpen={modalPreviewDocOpen}
          onClose={() => setModalPreviewDocOpen(false)}
          eventoId={eventoParaEditar.id}
          eventoNome={eventoParaEditar.nome}
        />
      )}
    </>
  )
}
