import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { ArrowLeft, ChevronRight, Layers, Loader2 } from "lucide-react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { FormField } from "@/components/ui/form-field"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { localizacaoService, type LocalizacaoListVm } from "@/services/LocalizacaoService"
import { animalService, type AnimalListItem } from "@/services/animalService"
import { animalLocalizacaoService, type AnimalLocalizacaoListVm } from "@/services/AnimalLocalizacaoService"
import { createAlimentacao, type AlimentacaoPayload, type RefeicaoPayloadItem } from "@/services/AlimentacaoService"
import { getUserInfo } from "@/services/api"
import { TipoRefeicao, SituacaoRefeicao } from "./RegistroAlimentacao"
import { GradeLancamentoAlimentacaoPorLote, type AnimalGridItem, type RefeicaoGridItem } from "./GrandeLancamentoAlimentacaoPorLote"

export default function AlimentacaoPorLote() {
  const navigate = useNavigate()
  const currentUser = getUserInfo()

  const [passo, setPasso] = useState<1 | 2>(1)
  const [especies, setEspecies] = useState<EspecieLookupVm[]>([])
  const [salas, setSalas] = useState<LocalizacaoListVm[]>([])
  const [selectedEspecieId, setSelectedEspecieId] = useState<string>("")
  const [selectedSalaId, setSelectedSalaId] = useState<string>("all")
  const [dataAlimentacao, setDataAlimentacao] = useState<string>(
    new Date().toISOString().split("T")[0]
  )
  const [responsavel, setResponsavel] = useState<string>(currentUser?.name || "")

  const [loadingAnimais, setLoadingAnimais] = useState(false)
  const [animaisCandidatos, setAnimaisCandidatos] = useState<AnimalListItem[]>([])
  const [localizacoesAnimais, setLocalizacoesAnimais] = useState<AnimalLocalizacaoListVm[]>([])
  const [buscaAnimal, setBuscaAnimal] = useState("")
  const [selectedAnimalIds, setSelectedAnimalIds] = useState<Set<number>>(new Set())

  // Grade
  const [gradeItens, setGradeItens] = useState<AnimalGridItem[]>([])
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    especieService.getLookup().then(setEspecies).catch(console.error)
    localizacaoService.getAll().then(setSalas).catch(console.error)
    animalLocalizacaoService.getAll().then(setLocalizacoesAnimais).catch(console.error)
  }, [])

  const animalLocalizacaoMap = useMemo(() => {
    const map = new Map<number, string>()
    localizacoesAnimais.forEach((al) => {
      if (al.animalId && al.localizacaoNome) {
        map.set(al.animalId, al.localizacaoNome)
      }
    })
    return map
  }, [localizacoesAnimais])

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
        situacaoAnimal: 1,
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

  const animaisFiltrados = useMemo(() => {
    return animaisCandidatos.filter((a) => {
      if (selectedSalaId !== "all") {
        const al = localizacoesAnimais.find((loc) => loc.animalId === a.id)
        if (!al || String(al.localizacaoId) !== selectedSalaId) {
          return false
        }
      }

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

  // Colunas do DataTable para a seleção de animais no Passo 1
  const animalColumns: ColumnDef<AnimalListItem>[] = [
    {
      header: (
        <div className="flex justify-center">
          <Checkbox
            checked={
              animaisFiltrados.length > 0 &&
              animaisFiltrados.every((a) => selectedAnimalIds.has(a.id))
            }
            onCheckedChange={handleToggleSelectAll}
            aria-label="Selecionar todos os animais"
          />
        </div>
      ),
      width: "48px",
      headerClassName: "text-center w-12",
      cellClassName: "text-center w-12",
      cell: (a) => (
        <div onClick={(e) => e.stopPropagation()} className="flex justify-center">
          <Checkbox
            checked={selectedAnimalIds.has(a.id)}
            onCheckedChange={() => handleToggleAnimal(a.id)}
            aria-label={`Selecionar animal ${a.numeroRegistro || a.id}`}
          />
        </div>
      ),
    },
    {
      header: "Animal",
      accessorKey: "numeroRegistro",
      sortable: true,
      cell: (a) => (
        <span className="font-semibold text-foreground">
          {a.numeroRegistro || `#${a.id}`}
        </span>
      ),
    },
    {
      header: "Espécie",
      accessorKey: "especieNome",
      sortable: true,
      cell: (a) => <span className="italic text-muted-foreground">{a.especieNome || "—"}</span>,
    },
    {
      header: "Sala / Recinto",
      cell: (a) => animalLocalizacaoMap.get(a.id) || a.instalacaoBioterioNome || "—",
    },
    {
      header: "Último peso (g)",
      headerClassName: "text-right",
      cellClassName: "text-right font-medium",
      cell: (a) => (a.biometriaAnimal?.peso ? `${a.biometriaAnimal.peso} g` : "—"),
    },
    {
      header: "Última pesagem",
      headerClassName: "text-right",
      cellClassName: "text-right text-muted-foreground",
      cell: (a) =>
        a.biometriaAnimal?.dataBiometria
          ? new Date(a.biometriaAnimal.dataBiometria).toLocaleDateString()
          : "—",
    },
  ]

  const renderSelecaoAnimaisSection = () => (
    <FormSection title="Animais Disponíveis para o Lote">
      <div className="flex flex-col gap-4 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="w-full sm:w-96">
            <BarraDeBuscaEFiltro
              search={buscaAnimal}
              onSearchChange={setBuscaAnimal}
              placeholder="Buscar por registro, chip ou nome popular..."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
              {selectedAnimalIds.size} selecionados
            </span>
          </div>
        </div>

        {loadingAnimais ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          </div>
        ) : !selectedEspecieId ? (
          <div className="text-center py-16 text-muted-foreground border rounded-xl bg-card">
            Selecione uma espécie para carregar os animais.
          </div>
        ) : (
          <DataTable
            data={animaisFiltrados}
            columns={animalColumns}
            loading={loadingAnimais}
            emptyMessage="Nenhum animal ativo encontrado para os filtros selecionados."
            onRowClick={(a) => handleToggleAnimal(a.id)}
            rowClassName={(a) => (selectedAnimalIds.has(a.id) ? "bg-brand/5" : "")}
          />
        )}
      </div>
    </FormSection>
  )

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              breadcrumbTitle={
                passo === 1
                  ? "Alimentação por Lote"
                  : "Alimentação por Lote - Grade de Lançamento"
              }
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

          {/* PASSO 1: ESCOLHA DO GRUPO USANDO FORMLAYOUTBASE */}
          {passo === 1 && (
            <FormLayoutBase
              titleFirstSection="Parâmetros do Lote"
              columnsClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
              submitLabel="Avançar para grade"
              onSubmit={async () => {
                handleAvancarGrade()
              }}
              onCancel={() => navigate("/alimentacao")}
              checkIsDirty={() => selectedAnimalIds.size > 0}
              extraSections={renderSelecaoAnimaisSection()}
            >
              <FormField label="Espécie" required>
                <Select value={selectedEspecieId} onValueChange={setSelectedEspecieId}>
                  <SelectTrigger className="w-full bg-white dark:bg-card">
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
              </FormField>

              <FormField label="Localizações">
                <Select value={selectedSalaId} onValueChange={setSelectedSalaId}>
                  <SelectTrigger className="w-full bg-white dark:bg-card">
                    <SelectValue placeholder="Todas as salas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    {salas.map((s) => (
                      <SelectItem key={s.id} value={String(s.id)}>
                        {s.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField label="Data da Alimentação" required>
                <Input
                  type="date"
                  value={dataAlimentacao}
                  onChange={(e) => setDataAlimentacao(e.target.value)}
                  className="bg-white dark:bg-card"
                />
              </FormField>

              <FormField label="Responsável" required>
                <Input
                  placeholder="Nome do tratador / responsável"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  className="bg-white dark:bg-card"
                />
              </FormField>
            </FormLayoutBase>
          )}

          {/* PASSO 2: GRADE DE LANÇAMENTO ISOLADA NO COMPONENTE DEDICADO */}
          {passo === 2 && (
            <GradeLancamentoAlimentacaoPorLote
              gradeItens={gradeItens}
              salvando={salvando}
              dataAlimentacao={dataAlimentacao}
              responsavel={responsavel}
              onAtualizarPeso={handleAtualizarPeso}
              onAtualizarPercentual={handleAtualizarPercentual}
              onAtualizarPesoSugerido={handleAtualizarPesoSugerido}
              onRecalcular={handleRecalcular}
              onAdicionarRefeicao={handleAdicionarRefeicao}
              onRemoverRefeicao={handleRemoverRefeicao}
              onAtualizarRefeicao={handleAtualizarRefeicao}
              onRemoverAnimal={handleRemoverAnimalDaGrade}
              onSalvar={handleSalvar}
              onVoltar={() => setPasso(1)}
            />
          )}
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
