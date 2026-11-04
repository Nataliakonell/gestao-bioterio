import { useState, useEffect, useMemo } from "react"
import { Building2, ChevronRight, Trash2, Search, Plus, X, Loader2, Check, PawPrint } from "lucide-react"
import { toast } from "sonner"
import { ModalShell } from "@/components/ui/modal-shell"
import { FormField } from "@/components/ui/form-field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import { useModalControls } from "@/hooks/useModalControls"
import { localizacaoService, type LocalizacaoListVm } from "@/services/LocalizacaoService"
import { animalService, type AnimalListItem } from "@/services/animalService"
import { animalLocalizacaoService } from "@/services/AnimalLocalizacaoService"

interface ModalInstalacaoProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  instalacaoParaEditar?: LocalizacaoListVm | null
  localizacoes: LocalizacaoListVm[]
}

interface AnimalSelecionado {
  id: number
  numeroRegistro: string
  especieNome?: string
  nomePopular?: string
}

interface FormState {
  nome: string
  ambiente: number
  animalIds: number[]
}

const initialFormState: FormState = {
  nome: "",
  ambiente: 1,
  animalIds: [],
}

export function ModalInstalacao({
  isOpen,
  onClose,
  onSuccess,
  instalacaoParaEditar,
  localizacoes,
}: ModalInstalacaoProps) {
  const isEditing = Boolean(instalacaoParaEditar?.id)
  const [form, setForm] = useState<FormState>(initialFormState)
  const [animaisSelecionados, setAnimaisSelecionados] = useState<AnimalSelecionado[]>([])
  const [termoPesquisa, setTermoPesquisa] = useState("")
  const [animaisEncontrados, setAnimaisEncontrados] = useState<AnimalListItem[]>([])
  const [buscandoAnimais, setBuscandoAnimais] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const bioterio = useMemo(() => {
    return (
      localizacoes.find(
        (loc) =>
          loc.nome.toLowerCase().includes("biotério") ||
          loc.nome.toLowerCase().includes("bioterio")
      ) ||
      localizacoes.find(
        (loc) => loc.localizacaoPaiId !== null && loc.localizacaoPaiId !== undefined
      ) ||
      null
    )
  }, [localizacoes])

  useEffect(() => {
    if (!isOpen) return

    if (instalacaoParaEditar) {
      setForm({
        nome: instalacaoParaEditar.nome || "",
        ambiente: instalacaoParaEditar.ambiente || 1,
        animalIds: [],
      })
      setAnimaisSelecionados([])
    } else {
      setForm(initialFormState)
      setAnimaisSelecionados([])
    }
    setTermoPesquisa("")
  }, [isOpen, instalacaoParaEditar])

  useEffect(() => {
    if (!isOpen || isEditing) return

    const timer = setTimeout(async () => {
      try {
        setBuscandoAnimais(true)
        const res = await animalService.getAllPaginated({
          search: termoPesquisa.trim() || undefined,
          pageSize: 25,
        })
        setAnimaisEncontrados(res.items || [])
      } catch (error) {
        console.error("Erro ao buscar animais:", error)
      } finally {
        setBuscandoAnimais(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [termoPesquisa, isOpen])

  const handleAdicionarAnimal = (animal: AnimalListItem) => {
    if (animaisSelecionados.some((a) => a.id === animal.id)) return
    const novoItem: AnimalSelecionado = {
      id: animal.id,
      numeroRegistro: animal.numeroRegistro,
      especieNome: animal.especieNome,
      nomePopular: animal.nomePopular,
    }
    const atualizados = [...animaisSelecionados, novoItem]
    setAnimaisSelecionados(atualizados)
    setForm((f) => ({ ...f, animalIds: atualizados.map((a) => a.id) }))
  }

  const handleRemoverAnimal = (animalId: number) => {
    const atualizados = animaisSelecionados.filter((a) => a.id !== animalId)
    setAnimaisSelecionados(atualizados)
    setForm((f) => ({ ...f, animalIds: atualizados.map((a) => a.id) }))
  }

  const isDirty = Boolean(
    form.nome.trim() !== (instalacaoParaEditar?.nome || "") ||
    form.ambiente !== (instalacaoParaEditar?.ambiente || 1) ||
    (!isEditing && form.animalIds.length > 0)
  )

  const {
    saving,
    setSaving,
    showCancelModal,
    handleAttemptClose,
    handleConfirmCancel,
    closeCancelModal,
  } = useModalControls(isDirty, onClose)

  const handleConfirmCancelWithReset = () => {
    setForm(
      instalacaoParaEditar
        ? {
            nome: instalacaoParaEditar.nome || "",
            ambiente: instalacaoParaEditar.ambiente || 1,
            animalIds: [],
          }
        : initialFormState
    )
    setAnimaisSelecionados([])
    handleConfirmCancel()
  }

  const handleDelete = async () => {
    if (!instalacaoParaEditar?.id) return
    try {
      setDeleting(true)
      await localizacaoService.delete(instalacaoParaEditar.id)
      toast.success("Sala excluída com sucesso!")
      setShowDeleteConfirm(false)
      onSuccess?.()
      onClose()
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e.message ||
        "Erro ao excluir sala."
      )
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!form.nome.trim()) {
      toast.error("Informe o nome da sala.")
      return
    }

    const localizacaoPaiId =
      instalacaoParaEditar?.localizacaoPaiId ?? bioterio?.id ?? 2

    const payload = {
      nome: form.nome.trim(),
      localizacaoPaiId,
      ambiente: form.ambiente,
      animalIds: form.animalIds,
    }

    try {
      setSaving(true)
      if (instalacaoParaEditar?.id) {
        await localizacaoService.update({
          id: instalacaoParaEditar.id,
          nome: form.nome.trim(),
          localizacaoPaiId,
          ambiente: form.ambiente,
        })

        toast.success("Instalação atualizada com sucesso!")
      } else {
        const response = await localizacaoService.create(payload)
        const novaSalaId =
          response?.id || (response as any)?.localizacao?.id

        if (novaSalaId && form.animalIds.length > 0) {
          await Promise.allSettled(
            form.animalIds.map((animalId) =>
              animalLocalizacaoService.create({
                animalId,
                localizacaoId: novaSalaId,
              })
            )
          )
        }

        toast.success("Sala cadastrada e animais associados com sucesso!")
      }
      onSuccess()
      onClose()
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
        e?.response?.data?.title ||
        e.message ||
        "Erro ao salvar sala."
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={handleAttemptClose}
        title={instalacaoParaEditar ? "Editar Sala do Biotério" : "Cadastrar Nova Sala"}
        icon={<Building2 className="h-5 w-5" />}
        iconBg="blue"
        size="lg"
        showCancelModal={showCancelModal}
        onCancelModalClose={closeCancelModal}
        onCancelModalConfirm={handleConfirmCancelWithReset}
        footerProps={{
          align: instalacaoParaEditar?.id ? "between" : "end",
          onCancel: handleAttemptClose,
          onSave: handleSave,
          saveLabel: instalacaoParaEditar ? "Salvar alterações" : "Cadastrar sala",
          saving,
          leftActions: instalacaoParaEditar?.id ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => setShowDeleteConfirm(true)}
              disabled={saving || deleting}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
            >
              <Trash2 className="h-4 w-4" /> Excluir sala
            </Button>
          ) : undefined,
        }}
      >
        <div className="space-y-6">
          {/* Card informativo de vinculação automática */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <Building2 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                    Vínculo Automático
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-blue-900 shadow-sm border border-blue-200">
                    UCDB <ChevronRight className="h-3.5 w-3.5 text-blue-400" /> Biotério
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-blue-950/80 leading-relaxed">
                  Esta sala é vinculada automaticamente à estrutura do Biotério da Universidade Católica Dom Bosco (UCDB). Os animais alocados responderão a esta hierarquia.
                </p>
              </div>
            </div>
          </div>

          {/* Dados Básicos da Sala */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <FormField label="Nome da Sala / Instalação" required>
                <Input
                  value={form.nome}
                  onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
                  placeholder="Ex: Sala de Exóticas, Sala de Roedores, Quarentena 02..."
                  className="bg-white h-10"
                  disabled={saving || deleting}
                />
              </FormField>
            </div>

            <div>
              <FormField label="Ambiente" required>
                <Select
                  value={form.ambiente.toString()}
                  onValueChange={(val) =>
                    setForm((f) => ({ ...f, ambiente: Number(val) }))
                  }
                  disabled={saving || deleting}
                >
                  <SelectTrigger className="bg-white h-10">
                    <SelectValue placeholder="Selecione o ambiente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Interno</SelectItem>
                    <SelectItem value="2">Externo</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </div>

          {/* Seletor Múltiplo de Animais (apenas no cadastro) */}
          {!isEditing && (
            <div className="border-t border-gray-200 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                    Alocação de Animais na Sala
                  </h3>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800">
                  {animaisSelecionados.length} selecionado{animaisSelecionados.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Coluna 1: Pesquisa e Lista de Resultados */}
                <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      value={termoPesquisa}
                      onChange={(e) => setTermoPesquisa(e.target.value)}
                      placeholder="Buscar por número de registro ou espécie..."
                      className="pl-9 h-9 text-xs bg-gray-50 border-gray-200 focus:bg-white"
                      disabled={saving || deleting}
                    />
                    {buscandoAnimais && (
                      <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-blue-600" />
                    )}
                  </div>

                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1 pt-1">
                    Resultados da busca
                  </div>

                  <ScrollArea className="h-60 rounded-lg border border-gray-100 bg-gray-50/50 p-1.5">
                    {buscandoAnimais && animaisEncontrados.length === 0 ? (
                      <div className="flex h-44 items-center justify-center text-xs text-gray-400">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Consultando animais...
                      </div>
                    ) : animaisEncontrados.length === 0 ? (
                      <div className="flex h-44 flex-col items-center justify-center text-center p-4 text-xs text-gray-400">
                        <PawPrint className="h-7 w-7 text-gray-300 mb-1.5" />
                        {termoPesquisa
                          ? "Nenhum animal encontrado para a busca."
                          : "Nenhum animal disponível no momento."}
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {animaisEncontrados.map((animal) => {
                          const jaSelecionado = animaisSelecionados.some(
                            (a) => a.id === animal.id
                          )
                          return (
                            <div
                              key={animal.id}
                              className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white p-2.5 transition hover:border-blue-200 hover:shadow-xs"
                            >
                              <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-gray-900 truncate">
                                  {animal.numeroRegistro}
                                </p>
                                <p className="text-[11px] text-gray-500 truncate">
                                  {animal.especieNome || animal.nomePopular || "Espécie não informada"}
                                </p>
                              </div>

                              {jaSelecionado ? (
                                <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 border border-emerald-200">
                                  <Check className="h-3 w-3" /> Adicionado
                                </span>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleAdicionarAnimal(animal)}
                                  disabled={saving || deleting}
                                  className="h-7 w-7 p-0 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                                  title="Adicionar à sala"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </ScrollArea>
                </div>

                {/* Coluna 2: Animais Selecionados nesta Instalação */}
                <div className="flex flex-col gap-2 rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm">
                  <div className="flex items-center justify-between px-1 h-9">
                    <span className="text-xs font-bold text-gray-800">
                      Animais selecionados nesta instalação ({animaisSelecionados.length})
                    </span>
                    {animaisSelecionados.length > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnimaisSelecionados([])
                          setForm((f) => ({ ...f, animalIds: [] }))
                        }}
                        disabled={saving || deleting}
                        className="text-[11px] text-red-600 hover:underline font-medium"
                      >
                        Limpar todos
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-1 pt-1">
                    Lista de alocação confirmada
                  </div>

                  <ScrollArea className="h-60 rounded-lg border border-gray-100 bg-slate-50/60 p-1.5">
                    {animaisSelecionados.length === 0 ? (
                      <div className="flex h-44 flex-col items-center justify-center text-center p-4 text-xs text-gray-400">
                        <Building2 className="h-7 w-7 text-gray-300 mb-1.5" />
                        Nenhum animal selecionado para esta sala.
                        <span className="text-[11px] text-gray-400 mt-1">
                          Utilize a lista ao lado para adicionar.
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {animaisSelecionados.map((sel) => (
                          <div
                            key={sel.id}
                            className="flex items-center justify-between gap-2 rounded-md border border-gray-200 bg-white p-2.5 shadow-xs"
                          >
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-gray-900 truncate">
                                {sel.numeroRegistro}
                              </p>
                              <p className="text-[11px] text-gray-500 truncate">
                                {sel.especieNome || sel.nomePopular || "Espécie não informada"}
                              </p>
                            </div>

                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              onClick={() => handleRemoverAnimal(sel.id)}
                              disabled={saving || deleting}
                              className="h-7 w-7 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                              title="Remover animal"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalShell>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir Sala"
        description="Deseja realmente excluir esta sala do biotério? Esta ação é definitiva e removerá a alocação associada."
        loading={deleting}
      />
    </>
  )
}
