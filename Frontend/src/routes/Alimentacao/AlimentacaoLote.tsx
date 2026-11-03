import { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, Check, ChevronRight, Layers, Loader2, Plus, Trash2 } from "lucide-react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { localizacaoService, type LocalizacaoListVm } from "@/services/LocalizacaoService"
import { animalService, type AnimalListItem } from "@/services/animalService"
import { animalLocalizacaoService, type AnimalLocalizacaoListVm } from "@/services/AnimalLocalizacaoService"
import { createAlimentacao, type AlimentacaoPayload, type RefeicaoPayloadItem } from "@/services/AlimentacaoService"
import { getUserInfo } from "@/services/api"
import { TipoRefeicao, SituacaoRefeicao } from "./RegistroAlimentacao"

const TIPO_REFEICAO_OPCOES = [
  { value: TipoRefeicao.Roedor, label: "Roedor" },
  { value: TipoRefeicao.Ave, label: "Ave" },
  { value: TipoRefeicao.Peixe, label: "Peixe" },
  { value: TipoRefeicao.Insetos, label: "Insetos" },
  { value: TipoRefeicao.Carne_Vermelha, label: "Carne Vermelha" },
  { value: TipoRefeicao.Frutas, label: "Frutas" },
  { value: TipoRefeicao.Legumes, label: "Legumes" },
  { value: TipoRefeicao.Vegetais, label: "Vegetais" },
  { value: TipoRefeicao.Racao, label: "Ração" },
  { value: TipoRefeicao.Ovo, label: "Ovo" },
  { value: TipoRefeicao.ViaSonda, label: "Via Sonda" },
]

interface RefeicaoGridItem {
  idTemp: string
  tipoRefeicao: TipoRefeicao
  pesoRefeicao: string
  situacaoRefeicao: SituacaoRefeicao
  observacao: string
}

interface AnimalGridItem {
  animalId: number
  numeroRegistro: string
  especieNome: string
  salaNome: string
  ultimoPeso: number
  ultimaPesagemData?: string
  pesoAtual: string
  percentual: string
  pesoSugerido: string
  observacoes: string
  refeicoes: RefeicaoGridItem[]
}

export default function AlimentacaoLote() {
  const navigate = useNavigate()
  const currentUser = getUserInfo()

  // Passo ativo: 1 = Escolha do grupo, 2 = Grade de lançamento
  const [passo, setPasso] = useState<1 | 2>(1)

  // Filtros Passo 1
  const [especies, setEspecies] = useState<EspecieLookupVm[]>([])
  const [salas, setSalas] = useState<LocalizacaoListVm[]>([])
  const [selectedEspecieId, setSelectedEspecieId] = useState<string>("")
  const [selectedSalaId, setSelectedSalaId] = useState<string>("all")
  const [dataAlimentacao, setDataAlimentacao] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [responsavel, setResponsavel] = useState<string>(currentUser?.name || "")

  // Animais carregados no Passo 1
  const [loadingAnimais, setLoadingAnimais] = useState(false)
  const [animaisCandidatos, setAnimaisCandidatos] = useState<AnimalListItem[]>([])
  const [localizacoesAnimais, setLocalizacoesAnimais] = useState<AnimalLocalizacaoListVm[]>([])
  const [buscaAnimal, setBuscaAnimal] = useState("")
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<number>>(new Set())

  // Grade Passo 2
  const [gradeItens, setGradeItens] = useState<AnimalGridItem[]>([])
  const [salvando, setSalvando] = useState(false)

  // Carregar listas iniciais
  useEffect(() => {
    especieService.getLookup().then(setEspecies).catch(console.error)
    localizacaoService.getAll().then(setSalas).catch(console.error)
    animalLocalizacaoService.getAll().then(setLocalizacoesAnimais).catch(console.error)
  }, [])

  // Mapa rápido de Localização por AnimalId
  const animalLocalizacaoMap = useMemo(() => {
    const map = new Map<number, string>()
    localizacoesAnimais.forEach((al) => {
      if (al.animalId && al.localizacaoNome) {
        map.set(al.animalId, al.localizacaoNome)
      }
    })
    return map
  }, [localizacoesAnimais])

  // Buscar animais quando especie muda
  const fetchAnimais = useCallback(async () => {
    if (!selectedEspecieId) {
      setAnimaisCandidatos([])
      setSelectedAnimalIds(new Set())
      return
    }

    try {
      setLoadingAnimais(true)
      const res = await animalService.getAllPaginated({
        especieId: Number(selectedEspecieId),
        situacaoAnimal: 1, // Apenas animais Vivos
        pageSize: 1000,
      })
      setAnimaisCandidatos(res.items || [])
      setSelectedAnimalIds(new Set())
    } catch (err) {
      console.error("Erro ao buscar animais:", err)
      toast.error("Erro ao carregar animais da espécie selecionada")
    } finally {
      setLoadingAnimais(false)
    }
  }, [selectedEspecieId])

  useEffect(() => {
    fetchAnimais()
  }, [fetchAnimais])

  // Animais filtrados pela sala e pela barra de busca
  const animaisFiltrados = useMemo(() => {
    return animaisCandidatos.filter((a) => {
      // Filtro de sala
      if (selectedSalaId !== "all") {
        const al = localizacoesAnimais.find((loc) => loc.animalId === a.id)
        if (!al || String(al.localizacaoId) !== selectedSalaId) {
          return false
        }
      }

      // Filtro de busca textual
      if (buscaAnimal.trim()) {
        const term = buscaAnimal.toLowerCase()
        const matchRegistro = a.numeroRegistro?.toLowerCase().includes(term)
        const matchNome = a.nomePopular?.toLowerCase().includes(term)
        const matchChip = a.numeroChip?.toLowerCase().includes(term)
        const matchId = String(a.id).includes(term)
        if (!matchRegistro && !matchNome && !matchChip && !matchId) return false
      }

      return true
    })
  }, [animaisCandidatos, selectedSalaId, localizacoesAnimais, buscaAnimal])

  // Marcar/Desmarcar todos os visíveis
  const handleToggleSelectAll = () => {
    const todosVisiveisIds = animaisFiltrados.map((a) => a.id)
    const todosMarcados = todosVisiveisIds.length > 0 && todosVisiveisIds.every((id) => selectedAnimalIds.has(id))

    const novoSet = new Set(selectedAnimalIds)
    if (todosMarcados) {
      todosVisiveisIds.forEach((id) => novoSet.delete(id))
    } else {
      todosVisiveisIds.forEach((id) => novoSet.add(id))
    }
    setSelectedAnimalIds(novoSet)
  }

  const handleToggleAnimal = (id: number) => {
    const novoSet = new Set(selectedAnimalIds)
    if (novoSet.has(id)) {
      novoSet.delete(id)
    } else {
      novoSet.add(id)
    }
    setSelectedAnimalIds(novoSet)
  }

  // Avançar para a Grade (Passo 2)
  const handleAvancarGrade = () => {
    if (selectedAnimalIds.size === 0) {
      toast.warning("Selecione pelo menos um animal para montar o lote.")
      return
    }

    const selecionados = animaisCandidatos.filter((a) => selectedAnimalIds.has(a.id))
    const itens: AnimalGridItem[] = selecionados.map((a) => {
      const peso = a.biometriaAnimal?.peso || 0
      const percentual = 20
      const sugerido = peso > 0 ? (peso * (percentual / 100)).toFixed(1) : "0"

      return {
        animalId: a.id,
        numeroRegistro: a.numeroRegistro || `ID ${a.id}`,
        especieNome: a.especieNome || especies.find((e) => String(e.id) === selectedEspecieId)?.nome || "",
        salaNome: animalLocalizacaoMap.get(a.id) || a.instalacaoBioterioNome || "Sem recinto",
        ultimoPeso: peso,
        ultimaPesagemData: a.biometriaAnimal?.dataBiometria,
        pesoAtual: peso > 0 ? String(peso) : "",
        percentual: String(percentual),
        pesoSugerido: sugerido,
        observacoes: "",
        refeicoes: [
          {
            idTemp: Math.random().toString(36).substring(2, 9),
            tipoRefeicao: TipoRefeicao.Roedor,
            pesoRefeicao: "",
            situacaoRefeicao: SituacaoRefeicao.Pendente,
            observacao: "",
          },
        ],
      }
    })

    setGradeItens(itens)
    setPasso(2)
  }

  // Ações da Grade (Passo 2)
  const handleAtualizarPeso = (index: number, novoPesoStr: string) => {
    setGradeItens((prev) => {
      const copy = [...prev]
      const item = { ...copy[index], pesoAtual: novoPesoStr }
      const pesoNum = parseFloat(novoPesoStr) || 0
      const pctNum = parseFloat(item.percentual) || 0
      item.pesoSugerido = (pesoNum * (pctNum / 100)).toFixed(1)
      copy[index] = item
      return copy
    })
  }

  const handleAtualizarPercentual = (index: number, novoPctStr: string) => {
    setGradeItens((prev) => {
      const copy = [...prev]
      const item = { ...copy[index], percentual: novoPctStr }
      const pesoNum = parseFloat(item.pesoAtual) || 0
      const pctNum = parseFloat(novoPctStr) || 0
      item.pesoSugerido = (pesoNum * (pctNum / 100)).toFixed(1)
      copy[index] = item
      return copy
    })
  }

  const handleRecalcular = (index: number) => {
    setGradeItens((prev) => {
      const copy = [...prev]
      const item = { ...copy[index] }
      const pesoNum = parseFloat(item.pesoAtual) || 0
      const pctNum = parseFloat(item.percentual) || 20
      item.pesoSugerido = (pesoNum * (pctNum / 100)).toFixed(1)
      copy[index] = item
      return copy
    })
  }

  const handleAtualizarPesoSugerido = (index: number, valor: string) => {
    setGradeItens((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], pesoSugerido: valor }
      return copy
    })
  }

  const handleAdicionarRefeicao = (animalIndex: number) => {
    setGradeItens((prev) => {
      const copy = [...prev]
      const item = { ...copy[animalIndex] }
      item.refeicoes = [
        ...item.refeicoes,
        {
          idTemp: Math.random().toString(36).substring(2, 9),
          tipoRefeicao: TipoRefeicao.Roedor,
          pesoRefeicao: "",
          situacaoRefeicao: SituacaoRefeicao.Pendente,
          observacao: "",
        },
      ]
      copy[animalIndex] = item
      return copy
    })
  }

  const handleRemoverRefeicao = (animalIndex: number, refIndex: number) => {
    setGradeItens((prev) => {
      const copy = [...prev]
      const item = { ...copy[animalIndex] }
      if (item.refeicoes.length <= 1) {
        toast.warning("Cada animal deve ter pelo menos uma refeição cadastrada.")
        return prev
      }
      item.refeicoes = item.refeicoes.filter((_, idx) => idx !== refIndex)
      copy[animalIndex] = item
      return copy
    })
  }

  const handleAtualizarRefeicao = (
    animalIndex: number,
    refIndex: number,
    campo: keyof RefeicaoGridItem,
    valor: any
  ) => {
    setGradeItens((prev) => {
      const copy = [...prev]
      const item = { ...copy[animalIndex] }
      const refeicoesCopy = [...item.refeicoes]
      refeicoesCopy[refIndex] = {
        ...refeicoesCopy[refIndex],
        [campo]: valor,
      }
      item.refeicoes = refeicoesCopy
      copy[animalIndex] = item
      return copy
    })
  }

  const handleRemoverAnimalDaGrade = (animalIndex: number) => {
    setGradeItens((prev) => prev.filter((_, idx) => idx !== animalIndex))
  }

  // Estatísticas no rodapé da Grade
  const estatisticas = useMemo(() => {
    let pendente = 0
    let aceitou = 0
    let negou = 0
    let regurgitou = 0
    let animaisComAceitacao = 0

    gradeItens.forEach((item) => {
      let animalTeveAceite = false
      item.refeicoes.forEach((r) => {
        if (r.situacaoRefeicao === SituacaoRefeicao.Pendente) pendente++
        if (r.situacaoRefeicao === SituacaoRefeicao.Aceitou) {
          aceitou++
          animalTeveAceite = true
        }
        if (r.situacaoRefeicao === SituacaoRefeicao.Negou) negou++
        if (r.situacaoRefeicao === SituacaoRefeicao.Regurgitou) regurgitou++
      })
      if (animalTeveAceite) animaisComAceitacao++
    })

    return { pendente, aceitou, negou, regurgitou, animaisComAceitacao }
  }, [gradeItens])

  // Salvar (Lote ou como Pendente)
  const handleSalvar = async (salvarComoPendente: boolean) => {
    if (gradeItens.length === 0) {
      toast.warning("Nenhum animal no lote.")
      return
    }

    // Validações linha a linha
    for (let i = 0; i < gradeItens.length; i++) {
      const item = gradeItens[i]
      const linhaNum = i + 1

      if (!item.pesoAtual || parseFloat(item.pesoAtual) <= 0) {
        toast.error(`Linha ${linhaNum} (#${item.numeroRegistro}): Informe um peso válido para o animal.`)
        return
      }

      if (!item.pesoSugerido || parseFloat(item.pesoSugerido) < 0) {
        toast.error(`Linha ${linhaNum} (#${item.numeroRegistro}): Peso sugerido inválido.`)
        return
      }

      if (item.refeicoes.length === 0) {
        toast.error(`Linha ${linhaNum} (#${item.numeroRegistro}): Adicione ao menos uma refeição.`)
        return
      }

      for (let r = 0; r < item.refeicoes.length; r++) {
        const ref = item.refeicoes[r]
        const pesoRefNum = parseFloat(ref.pesoRefeicao)
        if (isNaN(pesoRefNum) || pesoRefNum <= 0) {
          toast.error(`Linha ${linhaNum} (#${item.numeroRegistro}), Refeição ${r + 1}: Informe o peso ofertado maior que zero.`)
          return
        }
      }
    }

    try {
      setSalvando(true)
      const loteCodigo = Math.random().toString(36).substring(2, 10)
      const tagLote = `[Lote: ${loteCodigo} | Responsável: ${responsavel || "Técnico"}]`

      let sucessos = 0
      const erros: string[] = []

      for (let i = 0; i < gradeItens.length; i++) {
        const item = gradeItens[i]
        const refeicoesPayload: RefeicaoPayloadItem[] = item.refeicoes.map((r) => ({
          tipoRefeicao: r.tipoRefeicao,
          pesoRefeicao: parseFloat(r.pesoRefeicao),
          situacaoRefeicao: salvarComoPendente ? SituacaoRefeicao.Pendente : r.situacaoRefeicao,
        }))

        const payload: AlimentacaoPayload = {
          animalId: item.animalId,
          dataAlimentacao: dataAlimentacao,
          peso: parseFloat(item.pesoAtual),
          porcentagemPesoRecomendado: parseFloat(item.percentual) || 20,
          pesoRecomendado: parseFloat(item.pesoSugerido) || 0,
          refeicoes: refeicoesPayload,
          observacoes: item.observacoes ? `${item.observacoes} - ${tagLote}` : tagLote,
        }

        try {
          await createAlimentacao(payload)
          sucessos++
        } catch (err: any) {
          erros.push(`#${item.numeroRegistro}: ${err.message || "Erro ao salvar"}`)
        }
      }

      if (erros.length === 0) {
        toast.success(`Lote salvo com sucesso! ${sucessos} alimentações registradas.`)
        navigate("/alimentacao")
      } else if (sucessos > 0) {
        toast.warning(`${sucessos} animais salvos, mas ${erros.length} falharam: ${erros.join("; ")}`)
        navigate("/alimentacao")
      } else {
        toast.error(`Falha ao salvar lote: ${erros.join("; ")}`)
      }
    } catch (err: any) {
      console.error("Erro ao salvar lote:", err)
      toast.error(err.message || "Erro inesperado ao salvar lote.")
    } finally {
      setSalvando(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              breadcrumbTitle={passo === 1 ? "Alimentação por Lote" : "Alimentação por Lote - Grade de Lançamento"}
              breadcrumbUrl="/alimentacao"
            />
            <div className="flex items-center gap-3">
              {passo === 2 && (
                <Button
                  variant="outline"
                  onClick={() => setPasso(1)}
                  disabled={salvando}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Voltar aos animais
                </Button>
              )}
            </div>
          </HeaderContainer>

          {/* PASSO 1: ESCOLHER GRUPO E ANIMAIS */}
          {passo === 1 && (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border bg-card p-6 shadow-xs">
                <div className="mb-4">
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Layers className="h-5 w-5 text-brand" /> Alimentação por Lote
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Selecione a espécie e o recinto para carregar o grupo de animais que receberão alimentação.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Espécie <span className="text-red-500">*</span>
                    </label>
                    <Select value={selectedEspecieId} onValueChange={setSelectedEspecieId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione a espécie..." />
                      </SelectTrigger>
                      <SelectContent>
                        {especies.map((e) => (
                          <SelectItem key={e.id} value={String(e.id)}>
                            {e.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Sala / Recinto
                    </label>
                    <Select value={selectedSalaId} onValueChange={setSelectedSalaId}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Todas as salas" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as salas</SelectItem>
                        {salas.map((s) => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Data da Alimentação <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      value={dataAlimentacao}
                      onChange={(e) => setDataAlimentacao(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                      Responsável <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Nome do tratador / responsável"
                      value={responsavel}
                      onChange={(e) => setResponsavel(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Tabela de seleção de animais */}
              <div className="rounded-xl border bg-card p-6 shadow-xs flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="w-full sm:w-80">
                    <Input
                      placeholder="Identificação do animal..."
                      value={buscaAnimal}
                      onChange={(e) => setBuscaAnimal(e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-foreground">
                      {selectedAnimalIds.size} selecionados
                    </span>
                    <Button
                      onClick={handleAvancarGrade}
                      disabled={selectedAnimalIds.size === 0}
                      className="bg-brand hover:bg-brand/90 text-white flex items-center gap-2"
                    >
                      Avançar para grade <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {loadingAnimais ? (
                  <div className="flex justify-center items-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-brand" />
                  </div>
                ) : !selectedEspecieId ? (
                  <div className="text-center py-16 text-muted-foreground">
                    Selecione uma espécie para carregar os animais.
                  </div>
                ) : animaisFiltrados.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground">
                    Nenhum animal ativo encontrado para os filtros selecionados.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-muted/50 text-muted-foreground font-medium border-b">
                        <tr>
                          <th className="p-3 w-12 text-center">
                            <Checkbox
                              checked={
                                animaisFiltrados.length > 0 &&
                                animaisFiltrados.every((a) => selectedAnimalIds.has(a.id))
                              }
                              onCheckedChange={handleToggleSelectAll}
                            />
                          </th>
                          <th className="p-3 font-semibold">Animal</th>
                          <th className="p-3 font-semibold">Espécie</th>
                          <th className="p-3 font-semibold">Sala / recinto</th>
                          <th className="p-3 font-semibold text-right">Último peso (g)</th>
                          <th className="p-3 font-semibold text-right">Última pesagem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {animaisFiltrados.map((a) => {
                          const isSelected = selectedAnimalIds.has(a.id)
                          const salaNome = animalLocalizacaoMap.get(a.id) || a.instalacaoBioterioNome || "—"
                          const peso = a.biometriaAnimal?.peso
                          const dataPesagem = a.biometriaAnimal?.dataBiometria
                            ? new Date(a.biometriaAnimal.dataBiometria).toLocaleDateString()
                            : "—"

                          return (
                            <tr
                              key={a.id}
                              className={`hover:bg-muted/30 cursor-pointer transition-colors ${
                                isSelected ? "bg-brand/5" : ""
                              }`}
                              onClick={() => handleToggleAnimal(a.id)}
                            >
                              <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => handleToggleAnimal(a.id)}
                                />
                              </td>
                              <td className="p-3 font-semibold text-foreground">
                                {a.numeroRegistro || `#${a.id}`}
                              </td>
                              <td className="p-3 italic text-muted-foreground">{a.especieNome || "—"}</td>
                              <td className="p-3">{salaNome}</td>
                              <td className="p-3 text-right font-medium">
                                {peso ? `${peso} g` : "—"}
                              </td>
                              <td className="p-3 text-right text-muted-foreground">{dataPesagem}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PASSO 2: GRADE DE LANÇAMENTO */}
          {passo === 2 && (
            <div className="flex flex-col gap-6">
              <div className="rounded-xl border bg-card p-4 shadow-xs flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Data: </span>
                    <strong className="text-foreground">{new Date(dataAlimentacao).toLocaleDateString()}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Responsável: </span>
                    <strong className="text-foreground">{responsavel || "—"}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Animais no lote: </span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold">
                      {gradeItens.length}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => handleSalvar(true)}
                    disabled={salvando}
                    className="border-dashed"
                  >
                    Salvar como pendente
                  </Button>
                  <Button
                    onClick={() => handleSalvar(false)}
                    disabled={salvando}
                    className="bg-brand hover:bg-brand/90 text-white font-semibold"
                  >
                    {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                    Salvar lote
                  </Button>
                </div>
              </div>

              {/* Tabela de Grade Dinâmica */}
              <div className="rounded-xl border bg-card shadow-xs overflow-hidden">
                <div className="overflow-x-auto max-h-[650px]">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-muted/70 text-muted-foreground font-semibold sticky top-0 z-10 border-b">
                      <tr>
                        <th className="p-3 text-left w-48 min-w-[190px]">Animal / peso (g)</th>
                        <th className="p-3 text-center w-28 min-w-[100px]">Referência (%)</th>
                        <th className="p-3 text-left w-36 min-w-[140px]">Peso sugerido (g)</th>
                        <th className="p-3 text-left min-w-[280px]">Refeições Ofertadas</th>
                        <th className="p-3 text-left w-52 min-w-[200px]">Balanço individual</th>
                        <th className="p-3 text-center w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {gradeItens.map((item, animalIdx) => {
                        const pesoNum = parseFloat(item.pesoAtual) || 0

                        // Balanço do animal
                        let totalOfertado = 0
                        let totalConsumido = 0
                        item.refeicoes.forEach((r) => {
                          const p = parseFloat(r.pesoRefeicao) || 0
                          totalOfertado += p
                          if (r.situacaoRefeicao === SituacaoRefeicao.Aceitou) {
                            totalConsumido += p
                          }
                        })
                        const naoConsumido = totalOfertado - totalConsumido
                        const ofertaSobrePeso = pesoNum > 0 ? ((totalOfertado / pesoNum) * 100).toFixed(1) : "0.0"

                        return (
                          <tr key={item.animalId} className="hover:bg-muted/20 transition-colors">
                            {/* Identificação e Peso do Animal */}
                            <td className="p-3 align-top">
                              <div className="font-bold text-foreground text-base">#{item.numeroRegistro}</div>
                              <div className="text-xs text-muted-foreground mb-2">{item.salaNome}</div>
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  placeholder="Peso (g)"
                                  className="h-9 w-28"
                                  value={item.pesoAtual}
                                  onChange={(e) => handleAtualizarPeso(animalIdx, e.target.value)}
                                />
                                <span className="text-xs text-muted-foreground">g</span>
                              </div>
                            </td>

                            {/* Referência (%) */}
                            <td className="p-3 align-top text-center">
                              <Input
                                type="number"
                                step="1"
                                min="1"
                                max="100"
                                className="h-9 w-20 text-center mx-auto"
                                value={item.percentual}
                                onChange={(e) => handleAtualizarPercentual(animalIdx, e.target.value)}
                              />
                            </td>

                            {/* Peso Sugerido */}
                            <td className="p-3 align-top">
                              <div className="flex flex-col gap-1.5">
                                <Input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  className="h-9 w-28 font-bold text-brand"
                                  value={item.pesoSugerido}
                                  onChange={(e) => handleAtualizarPesoSugerido(animalIdx, e.target.value)}
                                />
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 text-xs text-muted-foreground p-0 justify-start hover:text-foreground"
                                  onClick={() => handleRecalcular(animalIdx)}
                                >
                                  Recalcular ({item.percentual}%)
                                </Button>
                              </div>
                            </td>

                            {/* Refeições Dinâmicas */}
                            <td className="p-3 align-top">
                              <div className="flex flex-wrap items-start gap-3">
                                {item.refeicoes.map((ref, refIdx) => (
                                  <div
                                    key={ref.idTemp}
                                    className="p-3 rounded-lg border bg-background/50 flex flex-col gap-2 w-64 shadow-2xs relative"
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-semibold text-muted-foreground">
                                        Refeição {refIdx + 1}
                                      </span>
                                      {item.refeicoes.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoverRefeicao(animalIdx, refIdx)}
                                          className="text-muted-foreground hover:text-red-500 transition-colors"
                                          title="Remover esta refeição"
                                        >
                                          <Trash2 className="h-3.5 w-3.5" />
                                        </button>
                                      )}
                                    </div>

                                    {/* Tipo Refeição */}
                                    <Select
                                      value={String(ref.tipoRefeicao)}
                                      onValueChange={(val) =>
                                        handleAtualizarRefeicao(animalIdx, refIdx, "tipoRefeicao", Number(val))
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {TIPO_REFEICAO_OPCOES.map((opt) => (
                                          <SelectItem key={opt.value} value={String(opt.value)}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>

                                    {/* Peso Refeição */}
                                    <div className="flex items-center gap-1">
                                      <Input
                                        type="number"
                                        step="0.1"
                                        min="0"
                                        placeholder="Peso oferecido (g)"
                                        className="h-8 text-xs"
                                        value={ref.pesoRefeicao}
                                        onChange={(e) =>
                                          handleAtualizarRefeicao(animalIdx, refIdx, "pesoRefeicao", e.target.value)
                                        }
                                      />
                                      <span className="text-xs text-muted-foreground">g</span>
                                    </div>

                                    {/* Situação */}
                                    <Select
                                      value={String(ref.situacaoRefeicao)}
                                      onValueChange={(val) =>
                                        handleAtualizarRefeicao(animalIdx, refIdx, "situacaoRefeicao", Number(val))
                                      }
                                    >
                                      <SelectTrigger className="h-8 text-xs">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value={String(SituacaoRefeicao.Pendente)}>Pendente</SelectItem>
                                        <SelectItem value={String(SituacaoRefeicao.Aceitou)}>Aceitou</SelectItem>
                                        <SelectItem value={String(SituacaoRefeicao.Negou)}>Negou</SelectItem>
                                        <SelectItem value={String(SituacaoRefeicao.Regurgitou)}>Regurgitou</SelectItem>
                                      </SelectContent>
                                    </Select>

                                    {/* Observação opcional */}
                                    <Input
                                      placeholder="Obs. (opcional)"
                                      className="h-7 text-xs"
                                      value={ref.observacao}
                                      onChange={(e) =>
                                        handleAtualizarRefeicao(animalIdx, refIdx, "observacao", e.target.value)
                                      }
                                    />
                                  </div>
                                ))}

                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-10 border-dashed text-xs flex items-center gap-1 self-center"
                                  onClick={() => handleAdicionarRefeicao(animalIdx)}
                                >
                                  <Plus className="h-3.5 w-3.5" /> Adicionar refeição
                                </Button>
                              </div>
                            </td>

                            {/* Balanço Individual */}
                            <td className="p-3 align-top">
                              <div className="text-xs space-y-1 bg-muted/40 p-2.5 rounded-lg border">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Ofertado:</span>
                                  <strong>{totalOfertado.toFixed(1)} g</strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Consumido:</span>
                                  <strong className={totalConsumido > 0 ? "text-green-600" : ""}>
                                    {totalConsumido.toFixed(1)} g
                                  </strong>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Não consumido:</span>
                                  <span className={naoConsumido > 0 ? "text-amber-600 font-medium" : ""}>
                                    {naoConsumido.toFixed(1)} g
                                  </span>
                                </div>
                                <div className="flex justify-between pt-1 border-t text-[11px] text-muted-foreground">
                                  <span>Oferta / peso:</span>
                                  <span>{ofertaSobrePeso}%</span>
                                </div>
                              </div>
                            </td>

                            {/* Remover Animal da Grade */}
                            <td className="p-3 align-top text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoverAnimalDaGrade(animalIdx)}
                                className="text-muted-foreground hover:text-red-500 transition-colors p-1"
                                title="Remover animal do lote"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Rodapé de Estatísticas e Contadores */}
                <div className="p-4 bg-muted/40 border-t flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-background">
                      Pendente: {estatisticas.pendente}
                    </span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border-green-200">
                      Aceitou: {estatisticas.aceitou}
                    </span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-red-50 text-red-700 border-red-200">
                      Negou: {estatisticas.negou}
                    </span>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-200">
                      Regurgitou: {estatisticas.regurgitou}
                    </span>
                    <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-amber-600 text-white">
                      Animais com aceitação: {estatisticas.animaisComAceitacao}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      onClick={() => handleSalvar(true)}
                      disabled={salvando}
                    >
                      Salvar como pendente
                    </Button>
                    <Button
                      onClick={() => handleSalvar(false)}
                      disabled={salvando}
                      className="bg-brand hover:bg-brand/90 text-white font-semibold"
                    >
                      {salvando ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Check className="h-4 w-4 mr-2" />}
                      Salvar lote
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
