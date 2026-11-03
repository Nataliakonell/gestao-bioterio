import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import HeaderGeral from "@/components/header-geral"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import { especieService } from "@/services/EspecieService"
import grupoService, { type GrupoLookupVm } from "@/services/GrupoService"
import rotinaAnimalService, { type RotinaAnimalListVm } from "@/services/RotinaAnimalService"
import { toast } from "sonner"
import { Plus, AlertCircle } from "lucide-react"

export default function CadastroEspecie() {
  const navigate = useNavigate()
  const { id } = useParams<{ id?: string }>()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  const [nome, setNome] = useState("")
  const [nomePopular, setNomePopular] = useState("")
  const [selectedGrupo, setSelectedGrupo] = useState("")
  const [grupos, setGrupos] = useState<GrupoLookupVm[]>([])

  const [rotinas, setRotinas] = useState<RotinaAnimalListVm[]>([])

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        const gruposData = await grupoService.getLookup()
        setGrupos(gruposData)

        if (isEditing && id) {
          const [especie, rotinasRes] = await Promise.all([
            especieService.getById(Number(id)),
            rotinaAnimalService.getAll({ especieId: Number(id) }),
          ])
          setNome(especie.nome)
          setNomePopular(especie.nomePopular)
          setSelectedGrupo(especie.grupoId.toString())
          setRotinas(rotinasRes.items || [])
        }
      } catch {
        toast.error("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isEditing])

  const checkIsDirty = () => {
    if (isEditing) return true
    return nome !== "" || nomePopular !== "" || selectedGrupo !== ""
  }

  const handleSubmit = async (): Promise<boolean> => {
    setValidationErrors([])
    const nomeTrim = nome.trim()
    const nomePopularTrim = nomePopular.trim()

    if (!nomeTrim || !nomePopularTrim || !selectedGrupo) {
      toast.error("Preencha todos os campos obrigatórios.")
      return false
    }

    try {
      setSubmitting(true)
      const payload = { nome: nomeTrim, nomePopular: nomePopularTrim, grupoId: Number(selectedGrupo) }

      if (isEditing && id) {
        await especieService.update(Number(id), payload)
        toast.success("Espécie atualizada com sucesso!")
        navigate("/plantel/especies", { replace: true })
        return true
      } else {
        const novaEspecie = await especieService.create(payload)
        toast.success("Espécie cadastrada com sucesso!")
        navigate(`/plantel/especies/${novaEspecie.id}`, { replace: true })
        return true
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao salvar espécie"
      toast.error(msg)
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = async () => {
    if (!id) return
    try {
      setDeleting(true)
      await especieService.delete(Number(id))
      toast.success("Espécie excluída com sucesso!")
      navigate("/plantel/especies", { replace: true })
    } catch (error: any) {
      const msg =
        error.response?.data?.message ||
        "Esta espécie possui animais vinculados e não pode ser excluída."
      toast.error(msg, { duration: 5000 })
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="bg-white">
          <PageContainer>
            <div className="p-8 text-center text-gray-500">Carregando...</div>
          </PageContainer>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title={isEditing ? "Editar Espécie" : "Nova Espécie"}
              breadcrumbTitle="Espécies"
              breadcrumbUrl="/plantel/especies"
            />
          </HeaderContainer>

          <FormLayoutBase
            titleFirstSection="Informações da Espécie"
            submitLabel={submitting ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/plantel/especies")}
            checkIsDirty={checkIsDirty}
            columnsClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            extraSections={
              <>
                {validationErrors.length > 0 && (
                  <div className="flex items-start gap-3 rounded-md border border-red-200 bg-red-50 p-4">
                    <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-red-700 mb-1">Verifique os seguintes erros:</p>
                      <ul className="list-disc list-inside space-y-0.5">
                        {validationErrors.map((err, i) => (
                          <li key={i} className="text-sm text-red-600">{err}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {isEditing && (
                  <FormSection title="Rotinas da Espécie">
                    {rotinas.length === 0 ? (
                      <p className="text-sm text-gray-400 mb-4">
                        Nenhuma rotina cadastrada para esta espécie.
                      </p>
                    ) : (
                      <div className="space-y-2 mb-6">
                        {Object.values(rotinas.reduce((acc, r) => {
                          let group = acc[r.tipoRotina];
                          if (!group) {
                            group = {
                              id: r.id,
                              tipoRotina: r.tipoRotina,
                              frequenciaFilhote: "-",
                              frequenciaJovem: "-",
                              frequenciaAdulto: "-",
                              protocolos: [] as string[]
                            };
                            acc[r.tipoRotina] = group;
                          }

                          const freqText = r.tipoFrequencia === "Diaria" ? "Diário"
                            : r.tipoFrequencia === "DiasDaSemana" ? (r.diaSemanaProgramado?.join(", ") || "-")
                            : `${r.frequencia}d`;

                          if (r.faseDeVida === "Filhote") group.frequenciaFilhote = freqText;
                          else if (r.faseDeVida === "Jovem") group.frequenciaJovem = freqText;
                          else if (r.faseDeVida === "Adulto") group.frequenciaAdulto = freqText;
                          else if (r.faseDeVida === "Todos") {
                            group.frequenciaFilhote = freqText;
                            group.frequenciaJovem = freqText;
                            group.frequenciaAdulto = freqText;
                          }

                          if (r.protocoloDieta && !group.protocolos.includes(r.protocoloDieta)) {
                            group.protocolos.push(r.protocoloDieta);
                          }

                          return acc;
                        }, {} as Record<string, any>)).map((group) => (
                          <div
                            key={group.id}
                            className="rounded-lg border border-gray-200 bg-white px-4 py-3 space-y-2"
                          >
                            <div className="flex items-center gap-4">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                group.tipoRotina === "Alimentacao"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                              }`}>
                                {group.tipoRotina === "Alimentacao" ? "Alimentação" : "Biometria"}
                              </span>
                              <div className="flex flex-col gap-1 text-sm text-gray-600 w-full mt-1 sm:mt-0">
                                <div>
                                  <span className="font-medium">Filhote:</span> {group.frequenciaFilhote}
                                  <span className="mx-2 text-gray-300">|</span>
                                  <span className="font-medium">Jovem:</span> {group.frequenciaJovem}
                                  <span className="mx-2 text-gray-300">|</span>
                                  <span className="font-medium">Adulto:</span> {group.frequenciaAdulto}
                                </div>
                                {group.protocolos.length > 0 && (
                                  <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border border-gray-100">
                                    <span className="font-medium text-gray-600">Protocolo/Instrução:</span> {group.protocolos.join(" | ")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="button"
                        onClick={() =>
                          navigate("/rotina/cadastro", {
                            state: {
                              preSelectedEspecieId: id,
                              returnUrl: `/plantel/especies/${id}`,
                            },
                          })
                        }
                        className="gap-1.5"
                      >
                        <Plus size={14} />
                        Nova Rotina
                      </Button>
                    </div>
                  </FormSection>
                )}

                {isEditing && (
                  <div className="pt-4 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setShowDeleteModal(true)}
                    >
                      Excluir Espécie
                    </Button>
                  </div>
                )}
              </>
            }
          >
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Nome Científico <span className="text-red-500">*</span>
              </label>
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex: Bothrops jararaca"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Nome Popular <span className="text-red-500">*</span>
              </label>
              <Input
                value={nomePopular}
                onChange={(e) => setNomePopular(e.target.value)}
                placeholder="Ex: Jararaca"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">
                Grupo <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                options={grupos.map((g) => ({ value: g.id.toString(), label: g.nome }))}
                value={selectedGrupo}
                onChange={setSelectedGrupo}
                placeholder="Selecione o grupo"
              />
            </div>
          </FormLayoutBase>
        </PageContainer>
      </SidebarInset>

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Excluir Espécie"
        description="Deseja realmente excluir esta espécie? Esta ação não poderá ser desfeita. Se houver animais vinculados, a exclusão será bloqueada."
        loading={deleting}
      />
    </SidebarProvider>
  )
}
