import { useState, useMemo, useEffect } from "react"
import { toast } from "sonner"
import { Calendar as CalendarIcon, MapPin, User, FileText, Check, AlertTriangle, Eye } from "lucide-react"
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
import { eventoService, TipoEvento, StatusEvento, type EventoDetailVm } from "@/services/EventoService"
import { eventoAnimalService } from "@/services/EventoAnimalService"
import { localizacaoService, type LocalizacaoListVm, Ambiente } from "@/services/LocalizacaoService"
import { animalService, type AnimalListItem } from "@/services/animalService"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { documentoEventoService } from "@/services/DocumentoEventoService"
import { modeloDocumentoService, TipoDocumento, type ModeloDocumentoVm } from "@/services/ModeloDocumentoService"
import {
  FormularioTransporteFauna,
  type DadosTransporteFauna,
  TEXTO_PADRAO_CONDUTOR_VEICULOS
} from "./FormularioTransporteFauna"
import { ModalDocumentoEvento } from "./ModalDocumentoEvento"

interface ModalAgendarEventoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  eventoParaEditar?: EventoDetailVm | null
}

export function ModalAgendarEvento({ isOpen, onClose, onSuccess, eventoParaEditar }: ModalAgendarEventoProps) {
  const [submitting, setSubmitting] = useState(false)

  // Campos do Evento
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [dataHoraInicio, setDataHoraInicio] = useState<Date | undefined>(undefined)
  const [dataHoraPrevisaoRetorno, setDataHoraPrevisaoRetorno] = useState<Date | undefined>(undefined)
  const [tipoEvento, setTipoEvento] = useState<TipoEvento>(TipoEvento.Interno)
  const [responsavel, setResponsavel] = useState("")

  // Animais
  const [todosAnimais, setTodosAnimais] = useState<AnimalListItem[]>([])
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<number>>(new Set())
  const [loadingAnimais, setLoadingAnimais] = useState(false)

  // Localizações e espécies
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoListVm[]>([])
  const [especiesLookup, setEspeciesLookup] = useState<EspecieLookupVm[]>([])

  // Modelos de Documento
  const [modelosDocumento, setModelosDocumento] = useState<ModeloDocumentoVm[]>([])
  const [modeloDocId, setModeloDocId] = useState<string>("")

  // Modal de Prévia / Visualização do Documento
  const [modalPreviewDocOpen, setModalPreviewDocOpen] = useState(false)

  // Dados Estruturados do Formulário de Transporte de Fauna (IMASUL)
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

  // Filtros de busca de animais
  const [searchAnimal, setSearchAnimal] = useState("")
  const [selectedEspecie, setSelectedEspecie] = useState("")

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
        const now = new Date()
        const inOneHour = new Date(now.getTime() + 60 * 60 * 1000)
        const inTwoDays = new Date(now.getTime() + 48 * 60 * 60 * 1000)

        setDataHoraInicio(inOneHour)
        setDataHoraPrevisaoRetorno(inTwoDays)
        setTipoEvento(TipoEvento.Interno)
        setSelectedAnimalIds(new Set())
        setResponsavel("")

        const dataStr = `${now.toLocaleDateString("pt-BR")} – ${inTwoDays.toLocaleDateString("pt-BR")}`
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

      // Carga de animais
      setLoadingAnimais(true)
      animalService
        .getAllPaginated({ page: 1, pageSize: 250 })
        .then((res) => {
          setTodosAnimais(res.items || [])
        })
        .catch(() => {
          toast.error("Erro ao carregar plantel de animais.")
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
        especieNome: item?.especieNome || item?.nomePopular || "Espécie não informada",
        genero: item?.genero || "Não informado"
      }
    })
  }, [selectedAnimalIds, todosAnimais])

  // Toggle de seleção de animal
  const toggleAnimal = (id: number) => {
    const next = new Set(selectedAnimalIds)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    setSelectedAnimalIds(next)
  }

  // Toggle de selecionar todos os animais filtrados
  const toggleSelectAll = () => {
    const next = new Set(selectedAnimalIds)
    const allFilteredSelected = animaisFiltrados.length > 0 && animaisFiltrados.every((a) => next.has(a.id))

    if (allFilteredSelected) {
      animaisFiltrados.forEach((a) => next.delete(a.id))
    } else {
      animaisFiltrados.forEach((a) => next.add(a.id))
    }
    setSelectedAnimalIds(next)
  }

  // Colunas da tabela de animais
  const columns: ColumnDef<AnimalListItem>[] = [
    {
      header: () => (
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
      header: "Nº Registro / Chip",
      accessorKey: "numeroRegistro",
      cell: (animal) => (
        <span className="font-semibold text-slate-900 font-mono">
          #{animal.numeroRegistro || animal.id}
        </span>
      ),
    },
    {
      header: "Espécie (Nome Científico)",
      accessorKey: "especieNome",
      cell: (animal) => (
        <span className="text-slate-800 italic font-medium">
          {animal.especieNome || animal.nomePopular || "Não informada"}
        </span>
      ),
    },
    {
      header: "Gênero / Sexo",
      accessorKey: "genero",
      cell: (animal) => (
        <span className="text-slate-700">
          {animal.genero || "Não informado"}
        </span>
      ),
    },
    {
      header: "Localização Atual",
      accessorKey: "localizacaoHierarquia",
      cell: (animal) => (
        <span className="text-xs text-slate-500">
          {animal.localizacaoHierarquia || "Sem localização"}
        </span>
      ),
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

    // Se for evento externo, valida campos obrigatórios do formulário IMASUL
    if (tipoEvento === TipoEvento.Externo) {
      if (!dadosTransporte.destNome.trim()) {
        toast.error("Informe o Nome / Razão Social do destinatário.")
        return
      }
      if (!dadosTransporte.destCpfCnpj.trim()) {
        toast.error("Informe o CNPJ / CPF do destinatário.")
        return
      }
      if (!dadosTransporte.transporteRota.trim()) {
        toast.error("Informe as rodovias utilizadas (rota) no transporte.")
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

        // Se for externo, atualiza ou cria o DocumentoEvento
        if (tipoEvento === TipoEvento.Externo) {
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
        // Se for evento externo, gera também o DocumentoEvento oficial
        if (tipoEvento === TipoEvento.Externo && res.id) {
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
        size="xl"
      >
        <div className="p-6">
          <FormLayoutBase
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitLabel={submitting ? "Salvando..." : eventoParaEditar ? "Salvar Alterações" : "Salvar Agendamento"}
            checkIsDirty={() => !!nome || selectedAnimalIds.size > 0}
            titleFirstSection="Informações Gerais do Evento"
            extraSections={
              <>
                {/* Se for Evento Externo: Seção Completa de Transporte de Fauna (IMASUL) */}
                {tipoEvento === TipoEvento.Externo && (
                  <FormSection
                    title="Formulário de Transporte de Fauna (Oficial IMASUL)"
                    className="mt-6"
                  >
                    <div className="bg-amber-50/70 border border-amber-200 p-3 rounded-lg text-xs text-amber-900 mb-4 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <strong>Atenção:</strong> Para eventos externos (Fora da UCDB), o preenchimento deste formulário
                        é obrigatório para emissão do Termo de Autorização e Transporte Oficial de Fauna.
                      </div>
                    </div>

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

                    {selectedAnimalIds.size > 0 && (
                      <span className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
                        {selectedAnimalIds.size} animal(is) selecionado(s)
                      </span>
                    )}
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="Nome do Evento" required className="col-span-full">
                <Input
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Exposição de Répteis na Feira de Ciências"
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Tipo de Evento" required className="col-span-full">
                <RadioGroup
                  value={String(tipoEvento)}
                  onValueChange={(val) => setTipoEvento(Number(val) as TipoEvento)}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                  disabled={submitting}
                >
                  <div className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all ${
                    tipoEvento === TipoEvento.Interno
                      ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <RadioGroupItem value={String(TipoEvento.Interno)} id="tipo-interno" className="mt-1" />
                    <div>
                      <Label htmlFor="tipo-interno" className="font-semibold text-slate-800 cursor-pointer text-sm">
                        Evento Interno (Na UCDB)
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Realizado dentro das dependências do campus ou solário.
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-start space-x-3 p-3.5 rounded-xl border transition-all ${
                    tipoEvento === TipoEvento.Externo
                      ? "border-blue-500 bg-blue-50/40 ring-1 ring-blue-500"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}>
                    <RadioGroupItem value={String(TipoEvento.Externo)} id="tipo-externo" className="mt-1" />
                    <div>
                      <Label htmlFor="tipo-externo" className="font-semibold text-slate-800 cursor-pointer text-sm">
                        Evento Externo (Fora da UCDB)
                      </Label>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Exige emissão de Guia/Formulário de Transporte de Fauna do IMASUL.
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </FormField>

              <FormField label="Data e Horário de Início" required>
                <DateTimePicker
                  date={dataHoraInicio}
                  setDate={setDataHoraInicio}
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Previsão de Retorno" required>
                <DateTimePicker
                  date={dataHoraPrevisaoRetorno}
                  setDate={setDataHoraPrevisaoRetorno}
                  disabled={submitting}
                />
              </FormField>

              <FormField label="Responsável pelo Evento" required className="col-span-full">
                <ResponsavelSelect
                  value={responsavel}
                  onChange={setResponsavel}
                  placeholder="Selecione o pesquisador ou técnico responsável..."
                  disabled={submitting}
                />
              </FormField>
            </div>
          </FormLayoutBase>
        </div>
      </ModalShell>

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
