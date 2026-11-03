import { useState, useEffect } from "react"
import { useNavigate, useSearchParams, useLocation, useParams } from "react-router-dom"
import { toast } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { animalService, type AnimalListItem, type AnimalLookupVm } from "@/services/animalService"
import { getBiometriaAnimal, createBiometriaAnimal, updateBiometriaAnimal } from "@/services/BiometriaAnimalService"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { CurrencyInput } from "@/components/ui/currency-input"

const RequiredMark = () => <span className="text-red-500"> *</span>
const STORAGE_KEY = "@bioterio:ultimaBiometria"

function loadLastBiometria() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { }
  return {}
}

function saveLastBiometria(data: { peso: string; comprimento: string; comprimentoCauda: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch { }
}

const initialFormData = {
  animalId: "",
  peso: "",
  comprimento: "",
  comprimentoCauda: "",
  dataBiometria: new Date().toISOString().split("T")[0],
}

export default function CadastroBiometria() {
  const navigate = useNavigate()
  const location = useLocation()
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()

  const animalIdFromQuery = searchParams.get("animalId") ?? ""
  const returnUrl = location.state?.returnUrl as string | undefined
  const returnTab = location.state?.tab as string | undefined
  const isEditing = Boolean(id)

  const [formData, setFormData] = useState(() => {
    const last = isEditing ? {} : loadLastBiometria()
    return {
      ...initialFormData,
      ...last,
      animalId: animalIdFromQuery,
    }
  })
  const [animals, setAnimals] = useState<AnimalLookupVm[]>([])
  const [selectedAnimal, setSelectedAnimal] = useState<AnimalLookupVm | null>(null)
  const [animalInativo, setAnimalInativo] = useState<string | null>(null)

  useEffect(() => {
    if (isEditing && id) {
      getBiometriaAnimal(Number(id)).then(async (data) => {
        setFormData({
          animalId: String(data.animalId),
          peso: String(data.peso),
          comprimento: data.comprimento ? String(data.comprimento) : "",
          comprimentoCauda: data.comprimentoCauda ? String(data.comprimentoCauda) : "",
          dataBiometria: data.dataBiometria && !data.dataBiometria.startsWith("0001")
            ? new Date(data.dataBiometria).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
        })
        try {
          const animalData = await animalService.getById(data.animalId)
          const animalItem = {
            id: animalData.id,
            numeroRegistro: animalData.numeroRegistro,
            especieNome: animalData.especieNome || (animalData as any).especie?.nome || "",
            situacao: 1,
          } as AnimalListItem;
          setAnimals([animalItem])
        } catch (e) { }
      }).catch(err => {
        console.error("Erro ao carregar biometria:", err)
        toast.error("Erro ao carregar os dados da biometria.")
      })
    } else if (animalIdFromQuery) {
      animalService.getById(Number(animalIdFromQuery)).then((animalData) => {
        const animalItem = {
          id: animalData.id,
          numeroRegistro: animalData.numeroRegistro,
          especieNome: animalData.especieNome || (animalData as any).especie?.nome || "",
        } as AnimalLookupVm;
        setAnimals([animalItem])
        setSelectedAnimal(animalItem)
      })
    } else {
      animalService.getLookup().then((data) => setAnimals(data))
    }
  }, [animalIdFromQuery, id, isEditing])

  useEffect(() => {
    if (formData.animalId && animals.length > 0) {
      const found = animals.find((a) => String(a.id) === formData.animalId)
      setSelectedAnimal(found ?? null)
    }
  }, [formData.animalId, animals])

  const checkIsDirty = () =>
    formData.peso !== "" ||
    formData.comprimento !== "" ||
    formData.comprimentoCauda !== ""

  const handleCancel = () => {
    if (returnUrl) {
      navigate(returnUrl, { state: { tab: returnTab } })
    } else {
      navigate(-1)
    }
  }

  const handleSubmit = async () => {
    if (!formData.animalId) {
      toast.error("Selecione um animal.")
      return false
    }
    if (!formData.peso || Number(formData.peso) <= 0) {
      toast.error("Informe o peso do animal (deve ser maior que zero).")
      return false
    }

    const payload = {
      animalId: Number(formData.animalId),
      peso: Number(formData.peso),
      comprimento: formData.comprimento ? Number(formData.comprimento) : undefined,
      comprimentoCauda: formData.comprimentoCauda ? Number(formData.comprimentoCauda) : undefined,
      dataBiometria: formData.dataBiometria ? new Date(formData.dataBiometria + "T12:00:00").toISOString() : new Date().toISOString(),
    }

    if (isEditing && id) {
      await updateBiometriaAnimal(Number(id), payload)
      toast.success("Biometria atualizada com sucesso!")
    } else {
      await createBiometriaAnimal(payload)
      saveLastBiometria({ peso: formData.peso, comprimento: formData.comprimento, comprimentoCauda: formData.comprimentoCauda })
      toast.success("Biometria registrada com sucesso!")
    }

    if (returnUrl) {
      navigate(returnUrl, { state: { tab: returnTab } })
    } else {
      navigate(`/plantel/animal/${formData.animalId}`, { state: { tab: "Biometria" } })
    }
  }

  const animalOptions = animals.map((a) => ({
    value: String(a.id),
    label: a.especieNome ? `${a.numeroRegistro} — ${a.especieNome}` : `${a.numeroRegistro}`,
  }))

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title={isEditing ? "Editar Biometria" : "Nova Biometria"}
              breadcrumbTitle="Plantel"
              breadcrumbUrl="/plantel/visao-geral"
            />
          </HeaderContainer>

          <FormLayoutBase
            titleFirstSection="Informações do Animal"
            submitLabel={isEditing ? "Salvar Alterações" : "Registrar Biometria"}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            checkIsDirty={checkIsDirty}
            columnsClassName="grid-cols-1"
            extraSections={
              <FormSection title="Biometria Animal">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Peso */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Peso (g)<RequiredMark />
                    </label>
                    <CurrencyInput
                      id="peso"
                      placeholder="Ex: 250,50"
                      value={formData.peso}
                      onValueChange={(value) => setFormData((p) => ({ ...p, peso: value }))}
                    />
                  </div>

                  {/* Comprimento */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Comprimento Total (cm)
                    </label>
                    <CurrencyInput
                      id="comprimento"
                      placeholder="Ex: 45,00"
                      value={formData.comprimento}
                      onValueChange={(value) => setFormData((p) => ({ ...p, comprimento: value }))}
                    />
                  </div>

                  {/* Comprimento Cauda */}
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                      Comprimento Cauda (cm)
                    </label>
                    <CurrencyInput
                      id="comprimentoCauda"
                      placeholder="Ex: 20,00"
                      value={formData.comprimentoCauda}
                      onValueChange={(value) =>
                        setFormData((p) => ({ ...p, comprimentoCauda: value }))
                      }
                    />
                  </div>
                </div>
              </FormSection>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Seletor de Animal */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Animal<RequiredMark />
                </label>
                <SearchableSelect
                  options={animalOptions}
                  value={formData.animalId}
                  isDisabled={isEditing || !!animalIdFromQuery}
                  onChange={(value) => {
                    const found = animals.find((a) => String(a.id) === value)
                    setSelectedAnimal(found ?? null)
                    setFormData((p) => ({ ...p, animalId: value }))
                  }}
                  placeholder="Selecione o animal..."
                />
              </div>

              {/* Data da Biometria */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">
                  Data da Biometria
                </label>
                <input
                  type="date"
                  value={formData.dataBiometria}
                  onChange={(e) => setFormData((p) => ({ ...p, dataBiometria: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                />
              </div>
            </div>
          </FormLayoutBase>
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
