import { useSearchParams, useNavigate, useParams } from "react-router-dom"
import {SidebarInset, SidebarProvider} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { animalService, type AnimalResponse, type CreateAnimalPayload } from "@/services/animalService"
import { useEffect, useState } from "react"
import HeaderGeral from "@/components/header-geral"
import { HeaderContainer } from "@/components/header-container"
import { PageContainer } from "@/components/page-container"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import localOrigemService, { type LocalOrigem, type LocalOrigemLookupVm } from "@/services/LocalOrigemService"
import { toast } from "sonner"
import ReactSelect from "react-select"
import CreatableSelect from "react-select/creatable"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { localizacaoService, type LocalizacaoListVm } from "@/services/LocalizacaoService"
import { is } from "date-fns/locale"
import { CurrencyInput } from "@/components/ui/currency-input";
import { ConfirmarProtocoloDesverminacaoModal } from "@/components/desverminacao/ConfirmarProtocoloDesverminacaoModal"

const RequiredMark = () => <span className="text-red-500"> *</span>

const reactSelectStyles = {
  control: (base: any) => ({
    ...base,
    borderColor: "hsl(var(--input))",
    "&:hover": { borderColor: "hsl(var(--border))" },
    boxShadow: "none",
    minHeight: "36px",
    height: "36px",
    borderRadius: "var(--radius)",
    fontSize: "0.875rem",
    backgroundColor: "hsl(var(--card))",
  }),
  valueContainer: (base: any) => ({ ...base, padding: "0 12px" }),
  placeholder: (base: any) => ({ ...base, color: "hsl(var(--muted-foreground))" }),
  singleValue: (base: any) => ({ ...base, color: "hsl(var(--foreground))" }),
  input: (base: any) => ({ ...base, color: "hsl(var(--foreground))" }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)",
  }),
  menuList: (base: any) => ({
    ...base,
    backgroundColor: "hsl(var(--popover))",
    padding: "4px",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--brand-blue, #2563eb)"
      : state.isFocused
      ? "hsl(var(--accent))"
      : "transparent",
    color: state.isSelected
      ? "#ffffff"
      : state.isFocused
      ? "hsl(var(--accent-foreground))"
      : "hsl(var(--popover-foreground))",
    cursor: "pointer",
    borderRadius: "0.25rem",
    fontSize: "0.875rem",
  }),
}


const generoMap: Record<string, number> = { "": 3, M: 1, F: 2, NI: 3 }
const faseDeVidaMap: Record<string, number> = { filhote: 1, jovem: 2, adulto: 3 }
const situacaoMap: Record<string, number> = { Vivo: 1, Óbito: 2, Reintroduzido: 3 }

const initialFormData = {
  fotoAnimal: null as File | null,
  registro: "",
  nroChipe: "",
  especieId: "",
  nomePopular: "",
  entrada: "",
  genero: "",
  massa: "",
  faseDeVida: "",
  comprimentoCauda: "",
  comprimentoTotal: "",
  localizacaoId: "",
  instalacaoBioterioId: "",
  municipio: "",
  localOrigemId: "",
  situacaoAnimal: "Vivo",
  sisfauna: "Sim",
  termoDoacao: "Sim",
}

export default function CadastroAnimal() {
  const navigate = useNavigate()
  const { id: routeId } = useParams()
  const [searchParams] = useSearchParams()
  const queryId = searchParams.get("id")
  const id = routeId || queryId

  const [animalToEdit, setAnimalToEdit] = useState<AnimalResponse | null>(null)
  const [pageLoading, setPageLoading] = useState(false)
  const [formData, setFormData] = useState(initialFormData)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const [especies, setEspecies] = useState<EspecieLookupVm[]>([])
  const [localizacoes, setLocalizacoes] = useState<LocalizacaoListVm[]>([])
  const [locaisOrigem, setLocaisOrigem] = useState<LocalOrigemLookupVm[]>([])
  const [municipios, setMunicipios] = useState<{ id: number; nome: string }[]>([])
  const [loadingOptions, setLoadingOptions] = useState(true)
  const [loadingMunicipios, setLoadingMunicipios] = useState(true)

  const [createdAnimal, setCreatedAnimal] = useState<{ id: number; numeroRegistro: string } | null>(null)
  const [showConfirmDesverm, setShowConfirmDesverm] = useState(false)

  const isEditing = !!animalToEdit;

  useEffect(() => {
    const load = async () => {
      try {
        const [esp, locs, ori] = await Promise.all([
          especieService.getLookup(),
          localizacaoService.getAll(),
          localOrigemService.getLookup(),
        ])
        setEspecies(esp)
        setLocalizacoes(locs)
        setLocaisOrigem(ori)
      } catch {
        toast.error("Erro ao carregar dados do sistema.")
      } finally {
        setLoadingOptions(false)
      }
    }
    load()

    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados/MS/municipios?orderBy=nome")
      .then((r) => r.json())
      .then(setMunicipios)
      .catch(console.error)
      .finally(() => setLoadingMunicipios(false))
  }, [])

  // Carrega animal para edição
  useEffect(() => {
    if (!id) return
    setPageLoading(true)
    animalService
      .getById(parseInt(id))
      .then((animal) => {
        setAnimalToEdit(animal)
        if (animal.fotoAnimal) setPreviewUrl(`data:image/jpeg;base64,${animal.fotoAnimal}`)
        setFormData({
          fotoAnimal: null,
          registro: animal.numeroRegistro,
          nroChipe: animal.numeroChip || "",
          especieId: animal.especieId.toString(),
          nomePopular: animal.nomePopular,
          entrada: animal.dataDeEntrada.split("T")[0],
          genero: animal.genero === 1 ? "M" : animal.genero === 2 ? "F" : "NI",
          massa: animal.peso?.toString() || "",
          faseDeVida: animal.faseDeVida === 1 ? "Filhote" : animal.faseDeVida === 2 ? "Jovem" : "Adulto",
          comprimentoCauda: animal.comprimentoCauda?.toString() || "",
          comprimentoTotal: animal.comprimentoTotal?.toString() || "",
          localizacaoId: animal.localizacaoId?.toString() || "",
          instalacaoBioterioId: animal.instalacaoBioterioId ? animal.instalacaoBioterioId.toString() : "",
          municipio: animal.municipio,
          localOrigemId: animal.localOrigemId.toString(),
          situacaoAnimal: animal.situacaoAnimal === 1 ? "Vivo" : animal.situacaoAnimal === 2 ? "Óbito" : "Reintroduzido",
          sisfauna: animal.sisfauna ? "Sim" : "Não",
          termoDoacao: animal.termoDeDoacao ? "Sim" : "Não",
        })
      })
      .catch((err) => console.error("Erro ao carregar animal para edição", err))
      .finally(() => setPageLoading(false))
  }, [id])

  useEffect(() => {
    if (!formData.especieId) return
    const esp = especies.find((e) => e.id === parseInt(formData.especieId))
    if (esp) setFormData((prev) => ({ ...prev, nomePopular: esp.nomePopular }))
  }, [formData.especieId, especies])

  const set = (field: string, value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const checkIsDirty = () => {
    if (!animalToEdit) {
      return Object.entries(formData).some(([k, v]) => {
        const defaults = initialFormData as Record<string, any>
        return v !== defaults[k]
      })
    }
    return true
  }

  const buildPayload = (): CreateAnimalPayload => ({
    numeroRegistro: formData.registro,
    nomePopular: formData.nomePopular,
    especieId: parseInt(formData.especieId) || 0,
    localizacaoId: parseInt(formData.localizacaoId) || undefined,
    instalacaoBioterioId: parseInt(formData.instalacaoBioterioId) || 0,
    genero: generoMap[formData.genero] ?? 3,
    faseDeVida: faseDeVidaMap[formData.faseDeVida.toLowerCase()] ?? 1,
    dataDeEntrada: formData.entrada,
    municipio: formData.municipio,
    localOrigemId: parseInt(formData.localOrigemId) || 0,
    numeroChip: formData.nroChipe,
    sisfauna: formData.sisfauna === "Sim",
    termoDeDoacao: formData.termoDoacao === "Sim",
    situacaoAnimal: situacaoMap[formData.situacaoAnimal] ?? 1,
    fotoAnimal: formData.fotoAnimal instanceof File ? formData.fotoAnimal : undefined,
    biometriaAnimal: {
      animalId: animalToEdit?.id || 0,
      peso: parseFloat(formData.massa) || 0,
      comprimento: parseFloat(formData.comprimentoTotal) || undefined,
      comprimentoCauda: parseFloat(formData.comprimentoCauda) || undefined,
    }
  })

  const handleSubmit = async () => {
    const payload = buildPayload()
    if (animalToEdit) {
      await animalService.update({ ...payload, id: animalToEdit.id })
      toast.success("Animal atualizado com sucesso!")
      setTimeout(() => navigate(`/plantel/animal/${id}`), 2000)
      return
    }
    const created = await animalService.create(payload)
    const newId = created?.id ?? (created as any)?.Id
    if (newId) {
      setCreatedAnimal({
        id: newId,
        numeroRegistro: created?.numeroRegistro || formData.registro,
      })
      setShowConfirmDesverm(true)
      setFormData(initialFormData)
      return false
    }
    setFormData(initialFormData)
    navigate("/plantel/visao-geral")
  }

  const handleConfirmProtocolo = () => {
    setShowConfirmDesverm(false)
    if (createdAnimal?.id) {
      navigate(`/desverminacao/registrar-dose?animalId=${createdAnimal.id}`)
    } else {
      navigate("/plantel/visao-geral")
    }
  }

  const handleDeclineProtocolo = () => {
    setShowConfirmDesverm(false)
    navigate("/plantel/visao-geral")
  }

  const handleCancel = () => {
    if (id) navigate(`/plantel/animal/${id}`)
    else navigate("/plantel/visao-geral")
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white">
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title={
                animalToEdit
                  ? `Registro: ${animalToEdit.numeroRegistro}`
                  : "Cadastro de Animal"
              }
              breadcrumbTitle="Plantel"
              breadcrumbUrl="/plantel/visao-geral"
            />
          </HeaderContainer>

          {pageLoading ? (
            <div className="p-8 text-center">Carregando dados do animal...</div>
          ) : (
            <FormLayoutBase
              key={id || "new"}
              titleFirstSection="Informações Básicas"
              submitLabel={id ? "Salvar Alterações" : "Salvar Animal"}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              checkIsDirty={checkIsDirty}
              hasProfilePhoto
              initialPhotoUrl={previewUrl}
              onPhotoChange={(file) => setFormData((prev) => ({ ...prev, fotoAnimal: file }))}
              extraSections={
                <>
                  {/* Dados Biométricos */}
                  <FormSection title="Dados Biométricos">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gênero<RequiredMark /></label>
                        <Select value={formData.genero} onValueChange={(v) => set("genero", v)}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="M">Macho</SelectItem>
                            <SelectItem value="F">Fêmea</SelectItem>
                            <SelectItem value="NI">Não Identificado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fase de Vida<RequiredMark /></label>
                        <Select value={formData.faseDeVida} onValueChange={(v) => set("faseDeVida", v)}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Filhote">Filhote</SelectItem>
                            <SelectItem value="Jovem">Jovem</SelectItem>
                            <SelectItem value="Adulto">Adulto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {!isEditing && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento da Cauda (cm)</label>
                          <CurrencyInput
                            placeholder="Centímetros"
                            value={formData.comprimentoCauda}
                            onValueChange={(value) =>
                              setFormData((p) => ({ ...p, comprimentoCauda: value }))
                            }
                          />
                        </div>
                      )}
                      {!isEditing && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento Total (cm)</label>
                          <CurrencyInput
                            placeholder="Centímetros"
                            value={formData.comprimentoTotal}
                            onValueChange={(value) =>
                              setFormData((p) => ({ ...p, comprimentoTotal: value }))
                            }
                          />
                        </div>
                      )}
                      {!isEditing && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Peso (g)<RequiredMark /></label>
                          <CurrencyInput
                            placeholder="Gramas"
                            value={formData.massa}
                            onValueChange={(value) =>
                              setFormData((p) => ({ ...p, massa: value }))
                            }
                            required
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nº Chip (microchip)<RequiredMark /></label>
                        <Input type="text" name="nroChipe" placeholder="Ex: 096300801487565" value={formData.nroChipe} onChange={handleChange} required />
                      </div>
                    </div>
                  </FormSection>

                  {/* Informações Adicionais */}
                  <FormSection title="Informações Adicionais">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SISFAUNA<RequiredMark /></label>
                        <Select value={formData.sisfauna} onValueChange={(v) => set("sisfauna", v)}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sim">Sim</SelectItem>
                            <SelectItem value="Não">Não</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="mt-1 text-xs text-gray-500">Registrado no SISFAUNA (Sistema de Fauna)</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Termo de Doação<RequiredMark /></label>
                        <Select value={formData.termoDoacao} onValueChange={(v) => set("termoDoacao", v)}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sim">Sim</SelectItem>
                            <SelectItem value="Não">Não</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="mt-1 text-xs text-gray-500">Possui termo de doação assinado</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Local Atual no Biotério<RequiredMark /></label>
                        {loadingOptions ? (
                          <div className="text-sm text-gray-500">Carregando locais...</div>
                        ) : (
                          <Select value={formData.localizacaoId} onValueChange={(v) => set("localizacaoId", v)}>
                            <SelectTrigger><SelectValue placeholder="Selecione o Local" /></SelectTrigger>
                            <SelectContent>
                              {localizacoes.map((loc) => (
                                <SelectItem key={loc.id} value={loc.id.toString()}>{loc.nome}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  </FormSection>
                </>
              }
            >
              {/* Campos da primeira seção (Informações Básicas) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Espécie (nome Científico)<RequiredMark /></label>
                {loadingOptions ? (
                  <div className="text-sm text-gray-500">Carregando espécies...</div>
                ) : (
                  <SearchableSelect
                    options={especies.map((e) => ({
                      value: e.id.toString(),
                      label: e.nome,
                    }))}
                    value={formData.especieId}
                    onChange={(v) => set("especieId", v)}
                    placeholder="Selecione a espécie"
                    isClearable
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Popular<RequiredMark /></label>
                <Input type="text" name="nomePopular" placeholder="Ex: Jararaca" value={formData.nomePopular} readOnly className="bg-gray-100 cursor-not-allowed text-gray-600 focus-visible:ring-0" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nº Registro<RequiredMark /></label>
                <Input type="text" name="registro" placeholder="Ex: 001" value={formData.registro} onChange={handleChange} required className="bg-white" />
                <p className="mt-1 text-xs text-gray-500">Identificador único do animal</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data de Entrada<RequiredMark /></label>
                <Input type="date" name="entrada" value={formData.entrada} onChange={handleChange} required className="bg-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Situação do Animal<RequiredMark /></label>
                <Select
                  value={formData.situacaoAnimal}
                  onValueChange={(v) => set("situacaoAnimal", v)}
                  disabled={animalToEdit ? (animalToEdit.situacaoAnimal === 2 || animalToEdit.situacaoAnimal === 3) : false}
                >
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Vivo">Vivo</SelectItem>
                    {(!animalToEdit || animalToEdit.situacaoAnimal === 2) && (
                      <SelectItem value="Óbito">Óbito</SelectItem>
                    )}
                    <SelectItem value="Reintroduzido">Reintroduzido</SelectItem>
                  </SelectContent>
                </Select>
                {animalToEdit && (animalToEdit.situacaoAnimal === 1 || String(animalToEdit.situacaoAnimal) === "Vivo") && (
                  <p className="mt-1 text-xs text-slate-500">
                    Para registrar óbito, utilize a opção "Registro de Óbito" no Atendimento Clínico.
                  </p>
                )}
                {animalToEdit && (animalToEdit.situacaoAnimal === 2 || String(animalToEdit.situacaoAnimal) === "Óbito" || String(animalToEdit.situacaoAnimal) === "Obito") && (
                  <p className="mt-1 text-xs text-amber-600">
                    Animal com óbito registrado na rotina clínica.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local de Origem<RequiredMark /></label>
                <CreatableSelect
                  isDisabled={loadingOptions}
                  isLoading={loadingOptions}
                  placeholder="Selecione ou digite"
                  formatCreateLabel={(v) => `Adicionar "${v}" +`}
                  options={locaisOrigem.map((o) => ({ value: o.id.toString(), label: o.nome }))}
                  value={locaisOrigem.map((o) => ({ value: o.id.toString(), label: o.nome })).find((opt) => opt.value === formData.localOrigemId) || null}
                  onChange={(v: any) => set("localOrigemId", v ? v.value : "")}
                  onCreateOption={async (inputValue) => {
                    const trimmed = inputValue.trim()
                    if (!trimmed) return
                    if (locaisOrigem.some((o) => o.nome.trim().toLowerCase() === trimmed.toLowerCase())) {
                      toast.error("Este local já está cadastrado.")
                      return
                    }
                    try {
                      const newOrigem = await localOrigemService.create({ nome: trimmed })
                      const newItem: LocalOrigemLookupVm = { id: newOrigem.id, nome: newOrigem.nome }
                      setLocaisOrigem((prev) => [...prev, newItem])
                      set("localOrigemId", newOrigem.id.toString())
                      toast.success("Local de Origem adicionado!")
                    } catch {
                      toast.error("Erro ao adicionar local de origem")
                    }
                  }}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={reactSelectStyles}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="block text-sm font-medium text-gray-700">Município<RequiredMark /></label>
                <ReactSelect
                  isLoading={loadingMunicipios}
                  isDisabled={loadingMunicipios}
                  menuPlacement="auto"
                  placeholder={loadingMunicipios ? "Carregando..." : "Pesquise o município"}
                  noOptionsMessage={() => "Nenhum município encontrado"}
                  options={municipios.map((m) => ({ value: `${m.nome}/MS`, label: `${m.nome}/MS` }))}
                  value={formData.municipio ? { value: formData.municipio, label: formData.municipio } : null}
                  onChange={(opt: any) => set("municipio", opt ? opt.value : "")}
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={reactSelectStyles}
                />
              </div>
            </FormLayoutBase>
          )}
        </PageContainer>
      </SidebarInset>

      <ConfirmarProtocoloDesverminacaoModal
        isOpen={showConfirmDesverm}
        onClose={handleDeclineProtocolo}
        onConfirm={handleConfirmProtocolo}
        animalLabel={createdAnimal?.numeroRegistro}
      />
    </SidebarProvider>
  );
}
