import React, { useEffect, useState, useMemo } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { Clock, Pill, Plus, AlertTriangle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { prescricaoMedicacaoService, type CreatePrescricaoMedicacaoCommand, type UpdatePrescricaoMedicacaoCommand, type PrescricaoMedicacaoListVm } from "@/services/PrescricaoMedicacaoService"
import { medicacaoAdministradaService, type MedicacaoAdministradaListVm } from "@/services/MedicacaoAdministradaService"
import { medicacaoService, type MedicacaoLookupVm } from "@/services/MedicacaoService"
import { animalService, type AnimalLookupVm } from "@/services/animalService"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { CardFichaAnimalForm } from "@/components/CardFichaAnimalForm"
import { CurrencyInput } from "@/components/ui/currency-input"
import { createBiometriaAnimal } from "@/services/BiometriaAnimalService"
import CreatableSelect from "react-select/creatable"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import CardResumoProjecaoMedicacao from "@/components/clinico/CardResumoProjecaoMedicacao"
import SeletorMedicacao from "@/components/clinico/SeletorMedicacao"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { getUserInfo } from "@/services/api"
import { usePermissions } from "@/contexts/PermissionsContext"

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

export const VIA_ADMINISTRACAO_OPTIONS = [
    { value: "3", label: "Endovenosa", enumName: "Endovenosa" },
    { value: "5", label: "Intracelomática", enumName: "Intracelomatica" },
    { value: "4", label: "Intradérmica", enumName: "Intradermica" },
    { value: "2", label: "Intramuscular", enumName: "Intramuscular" },
    { value: "1", label: "Subcutânea", enumName: "Subcutanea" },
    { value: "6", label: "Tópica", enumName: "Topica" },
    { value: "7", label: "Oral", enumName: "Oral" },
    { value: "8", label: "Ocular", enumName: "Ocular" }
]

export interface FormPrescricao {
    id: string
    medicacaoId: string
    principioAtivo: string
    nomeComercial: string
    volumeDose: string
    viaAdministracao: string
    quantidadeDoses: string
    intervaloHoras: string
    dataHoraInicio: string
    observacao: string
}

const emptyForm = (): FormPrescricao => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, "0")
    const localIso = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
    return {
        id: `new_${Date.now()}_${Math.random()}`,
        medicacaoId: "",
        principioAtivo: "",
        nomeComercial: "",
        volumeDose: "",
        viaAdministracao: "",
        quantidadeDoses: "1",
        intervaloHoras: "8",
        dataHoraInicio: localIso,
        observacao: "",
    }
}

export default function NovaPrescricao() {
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Atendimento veterinário", "Editar")
    const navigate = useNavigate()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)
    const urlAnimalId = searchParams.get("animalId")
    const prescricaoEdit: PrescricaoMedicacaoListVm | undefined = location.state?.prescricaoParaEditar

    const returnUrl = urlAnimalId
        ? `/plantel/animal/${urlAnimalId}?tab=clinico`
        : "/clinico/mapa-execucao"

    const [animalId, setAnimalId] = useState(() => {
        if (prescricaoEdit) return String(prescricaoEdit.animalId)
        if (urlAnimalId) return urlAnimalId
        return ""
    })
    const [animais, setAnimais] = useState<AnimalLookupVm[]>([])
    const [medicacoes, setMedicacoes] = useState<MedicacaoLookupVm[]>([])
    const [loadingAnimais, setLoadingAnimais] = useState(true)
    const [loadingMedicacoes, setLoadingMedicacoes] = useState(true)

    // Doses administradas carregadas para a prescrição
    const [doses, setDoses] = useState<MedicacaoAdministradaListVm[]>([])
    const [loadingDoses, setLoadingDoses] = useState(false)

    useEffect(() => {
        if (prescricaoEdit?.id) {
            setLoadingDoses(true)
            medicacaoAdministradaService.getAll({ prescricaoMedicacaoId: prescricaoEdit.id })
                .then(res => {
                    const sorted = [...res].sort((a, b) => new Date(a.dataHoraPrevista).getTime() - new Date(b.dataHoraPrevista).getTime())
                    setDoses(sorted)
                })
                .catch(err => console.error("Erro ao carregar doses da prescrição:", err))
                .finally(() => setLoadingDoses(false))
        }
    }, [prescricaoEdit?.id])

    const isSuspended = prescricaoEdit?.status === "Suspensa"

    // Se todas as doses de administração estiverem registradas, não pode suspender e nem editar/atualizar, apenas visualizar
    const todasDosesConcluidas = useMemo(() => {
        if (doses.length > 0) {
            return doses.every(d => d.statusDose === "Concluido")
        }
        return (prescricaoEdit?.totalAdministracoes ?? 0) > 0 &&
               (prescricaoEdit?.administracoesConcluidas ?? 0) >= (prescricaoEdit?.totalAdministracoes ?? 0)
    }, [doses, prescricaoEdit])

    const isReadOnly = isSuspended || todasDosesConcluidas || !canEdit

    const podeSuspender =
        !!prescricaoEdit &&
        !isSuspended &&
        prescricaoEdit.status !== "Concluida" &&
        !todasDosesConcluidas &&
        canEdit

    const [showSuspendModal, setShowSuspendModal] = useState(false)
    const [motivoSuspensao, setMotivoSuspensao] = useState("")
    const [isSuspending, setIsSuspending] = useState(false)

    const [biometria, setBiometria] = useState<{ peso: string, comprimento: string, comprimentoCauda: string }>({ peso: "", comprimento: "", comprimentoCauda: "" })
    const [originalBiometria, setOriginalBiometria] = useState<{ peso: string, comprimento: string, comprimentoCauda: string }>({ peso: "", comprimento: "", comprimentoCauda: "" })
    const [loadingBiometria, setLoadingBiometria] = useState(false)
    const [responsavel, setResponsavel] = useState(() => {
        if (prescricaoEdit) return prescricaoEdit.responsavel || prescricaoEdit.rf || getUserInfo()?.name || ""
        return getUserInfo()?.name || ""
    })

    const [prescricoes, setPrescricoes] = useState<FormPrescricao[]>(() => {
        if (prescricaoEdit) {
            const opt = VIA_ADMINISTRACAO_OPTIONS.find(o => o.enumName === prescricaoEdit.viaAdministracao || o.label === prescricaoEdit.viaAdministracao)
            return [{
                id: String(prescricaoEdit.id),
                medicacaoId: String(prescricaoEdit.medicacaoId),
                principioAtivo: "",
                nomeComercial: "",
                volumeDose: prescricaoEdit.volumeDose,
                viaAdministracao: opt ? opt.value : "",
                quantidadeDoses: String(prescricaoEdit.quantidadeDoses),
                intervaloHoras: String(prescricaoEdit.intervaloEntreDosesHoras),
                dataHoraInicio: prescricaoEdit.dataHoraInicio.slice(0, 16),
                observacao: prescricaoEdit.observacao || "",
            }]
        }
        return [emptyForm()]
    })

    useEffect(() => {
        animalService.getLookup()
            .then(setAnimais)
            .catch(() => toast.error("Erro ao carregar animais"))
            .finally(() => setLoadingAnimais(false))

        medicacaoService.getLookup()
            .then(meds => {
                setMedicacoes(meds)
                setPrescricoes(prev => prev.map(p => {
                    if (p.medicacaoId) {
                        const matched = meds.find(m => String(m.id) === p.medicacaoId)
                        if (matched) {
                            return {
                                ...p,
                                principioAtivo: p.principioAtivo || matched.principioAtivo,
                                nomeComercial: p.nomeComercial || matched.nomeComercial,
                            }
                        }
                    }
                    return p
                }))
            })
            .catch((err) => {
                if (err.response?.status === 403) {
                    console.warn("Visualização restrita: sem permissão para listar medicações.")
                } else {
                    toast.error("Erro ao carregar opções de medicações.")
                }
            })
            .finally(() => setLoadingMedicacoes(false))
    }, [])

    useEffect(() => {
        if (!animalId) {
            setBiometria({ peso: "", comprimento: "", comprimentoCauda: "" })
            setOriginalBiometria({ peso: "", comprimento: "", comprimentoCauda: "" })
            return
        }
        setLoadingBiometria(true)
        animalService.getById(parseInt(animalId))
            .then(res => {
                if (res.biometriaAnimal) {
                    const bio = {
                        peso: res.biometriaAnimal.peso ? String(res.biometriaAnimal.peso).replace('.', ',') : "",
                        comprimento: res.biometriaAnimal.comprimento ? String(res.biometriaAnimal.comprimento).replace('.', ',') : "",
                        comprimentoCauda: res.biometriaAnimal.comprimentoCauda ? String(res.biometriaAnimal.comprimentoCauda).replace('.', ',') : ""
                    }
                    setBiometria(bio)
                    setOriginalBiometria(bio)
                } else {
                    const bio = { peso: "", comprimento: "", comprimentoCauda: "" }
                    setBiometria(bio)
                    setOriginalBiometria(bio)
                }
            })
            .catch(() => toast.error("Erro ao carregar dados da biometria"))
            .finally(() => setLoadingBiometria(false))
    }, [animalId])

    const setPrescricao = (id: string, field: keyof FormPrescricao, value: string) => {
        if (isReadOnly) return
        setPrescricoes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
    }

    const addPrescricao = () => !isReadOnly && setPrescricoes(prev => [...prev, emptyForm()])
    const removePrescricao = (id: string) => !isReadOnly && setPrescricoes(prev => prev.filter(p => p.id !== id))

    const handleSuspend = async () => {
        if (!prescricaoEdit) return
        if (!podeSuspender) {
            toast.error("Não é possível suspender: todas as doses já foram concluídas.")
            return
        }
        if (!motivoSuspensao.trim()) {
            toast.error("Motivo da suspensão deve ser informado.")
            return
        }
        setIsSuspending(true)
        try {
            await prescricaoMedicacaoService.suspender(prescricaoEdit.id, motivoSuspensao.trim())
            toast.success("Prescrição suspensa com sucesso.")
            setShowSuspendModal(false)
            navigate(returnUrl)
        } catch (error: any) {
            if (error.response?.data?.message) {
                toast.error(error.response.data.message)
            } else {
                toast.error("Erro ao suspender prescrição.")
            }
        } finally {
            setIsSuspending(false)
        }
    }

    const handleSubmit = async () => {
        if (isReadOnly) return false
        if (!animalId) { toast.error("Selecione o animal."); return false }

        for (const [index, form] of prescricoes.entries()) {
            const num = index + 1
            if (!form.medicacaoId) { toast.error(`Selecione a medicação na prescrição ${num}.`); return false }
            if (!form.volumeDose.trim()) { toast.error(`Informe a dose na prescrição ${num}.`); return false }
            if (!form.viaAdministracao) { toast.error(`Selecione a via de administração na prescrição ${num}.`); return false }
            if (!form.quantidadeDoses || parseInt(form.quantidadeDoses) < 1) { toast.error(`Informe a quantidade de doses na prescrição ${num}.`); return false }
            if (form.quantidadeDoses !== "1" && (!form.intervaloHoras || parseInt(form.intervaloHoras) < 1)) { toast.error(`Informe o intervalo entre doses na prescrição ${num}.`); return false }
            if (!form.dataHoraInicio) { toast.error(`Informe a data/hora de início na prescrição ${num}.`); return false }

            const selectedDate = new Date(form.dataHoraInicio)
            const now = new Date()
            now.setMinutes(now.getMinutes() - 5) // pequena margem de tolerância de 5 minutos
            if (selectedDate < now) {
                toast.error(`A data/hora de início da prescrição ${num} não pode estar no passado.`)
                return false
            }
        }

        let savedBiometria = false;
        if (
            biometria.peso !== originalBiometria.peso ||
            biometria.comprimento !== originalBiometria.comprimento ||
            biometria.comprimentoCauda !== originalBiometria.comprimentoCauda
        ) {
            if (!biometria.peso) {
                toast.error("O peso é obrigatório para atualizar a biometria.")
                return false
            }
            const pesoFloat = parseFloat(biometria.peso.replace(',', '.'))
            if (isNaN(pesoFloat)) {
                toast.error("Peso inválido.")
                return false
            }
            savedBiometria = true;
        }

        try {
            const promises = prescricoes.map(form => {
                if (prescricaoEdit) {
                    const cmd: UpdatePrescricaoMedicacaoCommand = {
                        id: parseInt(form.id),
                        animalId: parseInt(animalId),
                        medicacaoId: parseInt(form.medicacaoId),
                        volumeDose: form.volumeDose.trim(),
                        viaAdministracao: parseInt(form.viaAdministracao),
                        quantidadeDoses: parseInt(form.quantidadeDoses),
                        intervaloEntreDosesHoras: form.quantidadeDoses === "1" ? 0 : parseInt(form.intervaloHoras),
                        dataHoraInicio: form.dataHoraInicio,
                        observacao: form.observacao || null,
                        responsavel: responsavel.trim() || undefined,
                    }
                    return prescricaoMedicacaoService.update(cmd)
                } else {
                    const cmd: CreatePrescricaoMedicacaoCommand = {
                        animalId: parseInt(animalId),
                        medicacaoId: parseInt(form.medicacaoId),
                        volumeDose: form.volumeDose.trim(),
                        viaAdministracao: parseInt(form.viaAdministracao),
                        quantidadeDoses: parseInt(form.quantidadeDoses),
                        intervaloEntreDosesHoras: form.quantidadeDoses === "1" ? 0 : parseInt(form.intervaloHoras),
                        dataHoraInicio: form.dataHoraInicio,
                        observacao: form.observacao || null,
                        responsavel: responsavel.trim() || undefined,
                    }
                    return prescricaoMedicacaoService.create(cmd)
                }
            })

            if (savedBiometria) {
                const nowIso = new Date().toISOString()
                promises.push(createBiometriaAnimal({
                    animalId: parseInt(animalId),
                    peso: parseFloat(biometria.peso.replace(',', '.')),
                    comprimento: biometria.comprimento ? parseFloat(biometria.comprimento.replace(',', '.')) : undefined,
                    comprimentoCauda: biometria.comprimentoCauda ? parseFloat(biometria.comprimentoCauda.replace(',', '.')) : undefined,
                    dataBiometria: nowIso
                }))
            }

            const results = await Promise.all(promises)

            for (const res of results) {
                if (res && res.success === false) {
                    const errorMsg = res.validationErrors?.join(", ") || res.message || "Erro na validação do servidor."
                    toast.error(`Erro: ${errorMsg}`)
                    return false
                }
            }

            toast.success(prescricaoEdit ? "Prescrição atualizada com sucesso!" : "Prescrição criada com sucesso!")
            navigate(returnUrl)
            return true
        } catch (e: any) {
            toast.error(e.response?.data?.message || e.message || "Erro ao criar prescrição.")
            return false
        }
    }

    const checkIsDirty = () => {
        if (isReadOnly) return false
        if (!prescricoes.length) return false
        if (prescricaoEdit) return false
        if (biometria.peso !== originalBiometria.peso || biometria.comprimento !== originalBiometria.comprimento || biometria.comprimentoCauda !== originalBiometria.comprimentoCauda) return true
        return prescricoes.length > 1 ||
            prescricoes[0].medicacaoId !== "" ||
            prescricoes[0].volumeDose !== ""
    }

    const animaisOrdenados = [
        ...animais.filter((a) => /^\d/.test(a.numeroRegistro ?? "")).sort((a, b) => Number(a.numeroRegistro ?? 0) - Number(b.numeroRegistro ?? 0)),
        ...animais.filter((a) => !/^\d/.test(a.numeroRegistro ?? "")).sort((a, b) => (a.numeroRegistro ?? "").localeCompare(b.numeroRegistro ?? "", "pt-BR")),
    ]

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-white">
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle={urlAnimalId ? "Ficha do animal" : "Mapa de execução"}
                            breadcrumbUrl={returnUrl}
                            title={isSuspended ? "Visualizar prescrição" : todasDosesConcluidas ? "Visualizar prescrição" : prescricaoEdit ? "Editar prescrição" : "Nova prescrição"}
                        />
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">
                        <CardFichaAnimalForm
                            animalId={animalId}
                            onChange={(v) => setAnimalId(v)}
                            animaisOrdenados={animaisOrdenados}
                            isDisabled={loadingAnimais || !!prescricaoEdit}
                            placeholder={
                                loadingAnimais
                                    ? "Carregando animais..."
                                    : "Selecione o animal"
                            }
                            onOpenFicha={(id) => {
                                navigate(`/plantel/animal/${id}`)
                            }}
                        />

                        <FormLayoutBase
                            titleFirstSection={isSuspended ? "Visualização da Prescrição Suspensa" : todasDosesConcluidas ? "Visualização da Prescrição Concluída" : prescricaoEdit ? "Editar Prescrição" : "Informações da Prescrição"}
                            hideSubmit={isReadOnly}
                            submitLabel={isReadOnly ? "" : prescricaoEdit ? "Atualizar prescrição" : "Criar prescrição"}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate(returnUrl)}
                            onDelete={podeSuspender ? () => setShowSuspendModal(true) : undefined}
                            deleteLabel="Suspender prescrição"
                            checkIsDirty={checkIsDirty}
                            columnsClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
                            sideContent={
                                <CardResumoProjecaoMedicacao
                                    prescricoes={prescricoes}
                                    medicacoes={medicacoes}
                                    doses={doses}
                                    animalId={animalId}
                                />
                            }
                            extraSections={
                                <div className="space-y-6">
                                    {isSuspended && (
                                        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 flex items-start gap-3">
                                            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1 text-sm">
                                                <h4 className="font-semibold text-amber-800">Prescrição suspensa</h4>
                                                <p>Esta prescrição foi suspensa e não pode mais ser editada ou utilizada para registrar novas administrações.</p>
                                                {prescricaoEdit?.motivoSuspensao && (
                                                    <p className="font-medium mt-1">Motivo: <span className="font-normal">{prescricaoEdit.motivoSuspensao}</span></p>
                                                )}
                                                {prescricaoEdit?.dataHoraSuspensao && (
                                                    <p className="text-xs text-amber-700">
                                                        Suspensa em: {new Date(prescricaoEdit.dataHoraSuspensao).toLocaleString("pt-BR")}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {todasDosesConcluidas && !isSuspended && (
                                        <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-900 flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                                            <div className="space-y-1 text-sm">
                                                <h4 className="font-semibold text-emerald-800">Prescrição concluída</h4>
                                                <p>Todas as doses previstas para esta prescrição já foram administradas. O registro está disponível apenas para visualização.</p>
                                            </div>
                                        </div>
                                    )}

                                    {animalId && !loadingBiometria && (
                                        <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-gray-50 relative">
                                            <div className="flex items-center gap-2 mb-3">
                                                <h1 className="font-semibold text-gray-900">
                                                    Biometria Atual do Animal
                                                </h1>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Peso animal (g){!isReadOnly && <RequiredMark />}
                                                    </label>
                                                    <CurrencyInput
                                                        placeholder="Ex: 250,00"
                                                        value={biometria.peso}
                                                        onValueChange={(v) => setBiometria(prev => ({ ...prev, peso: v }))}
                                                        disabled={isReadOnly}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Comprimento (cm)
                                                    </label>
                                                    <CurrencyInput
                                                        placeholder="Ex: 15,5"
                                                        value={biometria.comprimento}
                                                        onValueChange={(v) => setBiometria(prev => ({ ...prev, comprimento: v }))}
                                                        disabled={isReadOnly}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Comprimento da Cauda (cm)
                                                    </label>
                                                    <CurrencyInput
                                                        placeholder="Ex: 10,2"
                                                        value={biometria.comprimentoCauda}
                                                        onValueChange={(v) => setBiometria(prev => ({ ...prev, comprimentoCauda: v }))}
                                                        disabled={isReadOnly}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {prescricoes.map((form, index) => (
                                        <div key={form.id} className="space-y-6 border border-gray-200 rounded-lg p-6 bg-gray-50 relative">
                                            {prescricoes.length > 1 && !isReadOnly && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="absolute top-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                                    onClick={() => removePrescricao(form.id)}
                                                >
                                                    Remover
                                                </Button>
                                            )}
                                            <div className="flex items-center gap-2 mb-3">
                                                <Pill className="h-4 w-4 text-blue-700" />
                                                <h1 className="font-semibold text-blue-700">
                                                    Medicação {index + 1}
                                                </h1>
                                            </div>

                                            <FormSection title="Informações da medicação">
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Medicação{!isReadOnly && <RequiredMark />}
                                                    </label>
                                                    <SeletorMedicacao
                                                        value={form.medicacaoId}
                                                        onChange={(medId) => setPrescricao(form.id, "medicacaoId", medId)}
                                                        medicacoes={medicacoes}
                                                        setMedicacoes={setMedicacoes}
                                                        disabled={loadingMedicacoes || isReadOnly}
                                                        placeholder="Selecione uma medicação..."
                                                    />
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Dose{!isReadOnly && <RequiredMark />}
                                                        </label>
                                                        <input
                                                            type="text"
                                                            disabled={isReadOnly}
                                                            value={form.volumeDose}
                                                            onChange={(e) => setPrescricao(form.id, "volumeDose", e.target.value)}
                                                            placeholder="Ex: 8 mg/kg"
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white h-9 disabled:bg-gray-100 disabled:text-gray-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Via{!isReadOnly && <RequiredMark />}
                                                        </label>
                                                        <Select
                                                            disabled={isReadOnly}
                                                            value={form.viaAdministracao}
                                                            onValueChange={(v) => setPrescricao(form.id, "viaAdministracao", v)}
                                                        >
                                                            <SelectTrigger className="w-full h-9 bg-white disabled:bg-gray-100 disabled:text-gray-500">
                                                                <SelectValue placeholder="Selecione a via" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {VIA_ADMINISTRACAO_OPTIONS.map((opt) => (
                                                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </div>
                                            </FormSection>

                                            <FormSection title="Esquema de administração">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Intervalo entre as doses (h){form.quantidadeDoses !== "1" && !isReadOnly && <RequiredMark />}
                                                        </label>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-gray-600">A cada</span>
                                                            <input
                                                                type="number"
                                                                min={form.quantidadeDoses === "1" ? 0 : 1}
                                                                value={form.quantidadeDoses === "1" ? "0" : form.intervaloHoras}
                                                                disabled={form.quantidadeDoses === "1" || isReadOnly}
                                                                onChange={(e) => setPrescricao(form.id, "intervaloHoras", e.target.value)}
                                                                className="w-20 rounded-lg border border-gray-200 px-3 py-2 text-sm text-center focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white h-9 disabled:bg-gray-100 disabled:text-gray-500"
                                                            />
                                                             <span className="text-sm text-gray-600">horas(s)</span>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Quantidade total das doses{!isReadOnly && <RequiredMark />}
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            value={form.quantidadeDoses}
                                                            onChange={(e) => setPrescricao(form.id, "quantidadeDoses", e.target.value)}
                                                            disabled={isReadOnly}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white h-9 disabled:bg-gray-100 disabled:text-gray-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                                            Data e hora de início{!isReadOnly && <RequiredMark />}
                                                        </label>
                                                        <input
                                                            type="datetime-local"
                                                            value={form.dataHoraInicio}
                                                            onChange={(e) => setPrescricao(form.id, "dataHoraInicio", e.target.value)}
                                                            disabled={isReadOnly}
                                                            min={new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                                                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white h-9 disabled:bg-gray-100 disabled:text-gray-500"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-6">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Observação (opcional)
                                                    </label>
                                                    <textarea
                                                        value={form.observacao}
                                                        onChange={(e) => setPrescricao(form.id, "observacao", e.target.value)}
                                                        disabled={isReadOnly}
                                                        rows={3}
                                                        placeholder="Informe orientações adicionais sobre o uso da medicação..."
                                                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white disabled:bg-gray-100 disabled:text-gray-500"
                                                    />
                                                </div>
                                            </FormSection>
                                        </div>
                                    ))}

                                    {!prescricaoEdit && !isReadOnly && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={addPrescricao}
                                            className="w-full py-2 border-dashed border-2 bg-white hover:bg-gray-50 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 border-gray-300"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Adicionar uma medicação
                                        </Button>
                                    )}

                                    {!isReadOnly && (
                                        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                                            <ResponsavelSelect
                                                value={responsavel}
                                                onChange={setResponsavel}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>
                            }
                        />
                    </div>
                </PageContainer>
            </SidebarInset>

            {showSuspendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3 text-amber-600">
                            <AlertTriangle className="w-6 h-6" />
                            <h3 className="text-lg font-semibold text-gray-900">Suspender prescrição</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Tem certeza que deseja suspender esta prescrição? A prescrição não será excluída e permanecerá no histórico clínico. Após a suspensão, nenhuma nova administração poderá ser registrada para esta prescrição.
                        </p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Motivo da suspensão <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                value={motivoSuspensao}
                                onChange={(e) => setMotivoSuspensao(e.target.value)}
                                rows={3}
                                placeholder="Informe o motivo da suspensão..."
                                className="w-full rounded-lg border border-gray-200 p-2.5 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowSuspendModal(false)}
                                disabled={isSuspending}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                onClick={handleSuspend}
                                disabled={isSuspending || !motivoSuspensao.trim()}
                            >
                                {isSuspending ? "Suspendendo..." : "Suspender prescrição"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </SidebarProvider>
    )
}
