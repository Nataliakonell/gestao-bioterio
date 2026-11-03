import { useEffect, useState } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import HeaderGeral from "@/components/header-geral"
import { FormLayoutBase } from "@/components/formulario-registro/CadastroRegistroForm"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { especieService, type EspecieLookupVm } from "@/services/EspecieService"
import rotinaAnimalService, {TipoRotina, FaseDeVida, TipoFrequencia, type UpdateRotinaAnimalPayload } from "@/services/RotinaAnimalService"
import { toast } from "sonner"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
import { Trash2 } from "lucide-react"
import { usePermissions } from "@/contexts/PermissionsContext"

const DIAS_SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
const DIAS_ABREV = ["D", "S", "T", "Q", "Q", "S", "S"]

type FaseKey = "filhote" | "jovem" | "adulto"

interface FaseConfig {
    tipoFrequencia: string
    frequencia: string
    diaSemanaProgramado: string[]
    protocoloDieta: string
}

const defaultFaseConfig = (): FaseConfig => ({
    tipoFrequencia: "intervalo",
    frequencia: "7",
    diaSemanaProgramado: [],
    protocoloDieta: "",
})

const FASE_LABELS: Record<FaseKey | "todos", string> = {
    filhote: "Filhote",
    jovem: "Jovem",
    adulto: "Adulto",
    todos: "Todas as fases",
}

const FASE_TO_ENUM: Record<FaseKey, FaseDeVida> = {
    filhote: FaseDeVida.Filhote,
    jovem: FaseDeVida.Jovem,
    adulto: FaseDeVida.Adulto,
}

const ALL_FASE_KEYS: FaseKey[] = ["filhote", "jovem", "adulto"]

export default function RegistroRotina() {
    const navigate = useNavigate()
    const location = useLocation()
    const { id } = useParams<{ id?: string }>()
    const isEditing = Boolean(id)
    const returnUrl = location.state?.returnUrl || "/rotina/visao-geral"
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Rotinas", "Editar")

    const [especies, setEspecies] = useState<EspecieLookupVm[]>([])
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [validationErrors, setValidationErrors] = useState<string[]>([])
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const preSelectedEspecieId = location.state?.preSelectedEspecieId

    const [selectedEspecie, setSelectedEspecie] = useState("")
    const [tipoRotina, setTipoRotina] = useState("")
    const [aplicarParaTodas, setAplicarParaTodas] = useState(false)

    const [faseConfigs, setFaseConfigs] = useState<Record<FaseKey, FaseConfig>>({
        filhote: defaultFaseConfig(),
        jovem: defaultFaseConfig(),
        adulto: defaultFaseConfig(),
    })

    const [todosConfig, setTodosConfig] = useState<FaseConfig>(defaultFaseConfig())

    useEffect(() => {
        const fetchData = async () => {
            try {
                const especiesData = await especieService.getLookup()
                setEspecies(especiesData)

                if (preSelectedEspecieId && !isEditing) {
                    setSelectedEspecie(String(preSelectedEspecieId))
                }

                if (isEditing && id) {
                    const rotina = await rotinaAnimalService.getById(Number(id))
                    setSelectedEspecie(rotina.especieId.toString())
                    setTipoRotina(rotina.tipoRotina === TipoRotina.Alimentacao ? "alimentacao" : "biometria")

                    const allRotinas = await rotinaAnimalService.getAll({
                        especieId: rotina.especieId,
                        pageSize: 100,
                    })

                    const faseKeyMap: Record<number, FaseKey> = {
                        [FaseDeVida.Filhote]: "filhote",
                        [FaseDeVida.Jovem]: "jovem",
                        [FaseDeVida.Adulto]: "adulto",
                    }

                    const faseToEnum: Record<string, number> = {
                        "Filhote": FaseDeVida.Filhote,
                        "Jovem": FaseDeVida.Jovem,
                        "Adulto": FaseDeVida.Adulto,
                    }

                    const novosConfigs = { ...faseConfigs }
                    const tipoAlvo = rotina.tipoRotina === TipoRotina.Alimentacao ? "Alimentacao" : "Biometria"

                    for (const row of allRotinas.items) {
                        if (row.tipoRotina !== tipoAlvo) continue

                        const faseEnum = faseToEnum[row.faseDeVida]
                        if (!faseEnum) continue

                        const faseKey = faseKeyMap[faseEnum] || "adulto"
                        const tipoFreqRow = row.tipoFrequencia
                        let tipoFreq = "diasSemana"
                        let freq = "1"

                        if (tipoFreqRow === "Diaria") {
                            tipoFreq = "diaria"
                            freq = ""
                        } else if (tipoFreqRow === "IntervaloEmDias") {
                            tipoFreq = "intervalo"
                            freq = row.frequencia?.toString() || "7"
                        } else {
                            tipoFreq = "diasSemana"
                            freq = row.frequencia?.toString() || "1"
                        }

                        novosConfigs[faseKey] = {
                            tipoFrequencia: tipoFreq,
                            frequencia: freq,
                            diaSemanaProgramado: row.diaSemanaProgramado || [],
                            protocoloDieta: row.protocoloDieta ?? "",
                        }
                    }
                    setFaseConfigs(novosConfigs)
                    
                    const mainTipoFreqRow = rotina.tipoFrequencia
                    let mainTipoFreq = "diasSemana"
                    let mainFreq = "1"
                    if (mainTipoFreqRow === "Diaria") {
                        mainTipoFreq = "diaria"
                        mainFreq = ""
                    } else if (mainTipoFreqRow === "IntervaloEmDias") {
                        mainTipoFreq = "intervalo"
                        mainFreq = rotina.frequencia?.toString() || "7"
                    } else {
                        mainTipoFreq = "diasSemana"
                        mainFreq = rotina.frequencia?.toString() || "1"
                    }
                    
                    setTodosConfig({
                        tipoFrequencia: mainTipoFreq,
                        frequencia: mainFreq,
                        diaSemanaProgramado: rotina.diaSemanaProgramado || [],
                        protocoloDieta: rotina.protocoloDieta ?? "",
                    })
                }
            } catch {
                toast.error("Erro ao carregar dados")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id, isEditing])

    const updateFaseConfig = (fase: FaseKey, updates: Partial<FaseConfig>) => {
        setFaseConfigs((prev) => ({
            ...prev,
            [fase]: { ...prev[fase], ...updates },
        }))
    }

    const updateTodosConfig = (updates: Partial<FaseConfig>) => {
        setTodosConfig((prev) => ({ ...prev, ...updates }))
    }

    const checkIsDirty = () => {
        if (selectedEspecie || tipoRotina) return true
        return false
    }

    const confirmDeleteRotina = async () => {
        if (!id) return
        try {
            setDeleting(true)
            await rotinaAnimalService.delete(Number(id))
            toast.success("Rotina excluída com sucesso!")
            navigate(returnUrl)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Erro ao excluir rotina")
        } finally {
            setDeleting(false)
            setShowDeleteModal(false)
        }
    }

    const handleTipoFrequenciaChange = (fase: FaseKey | "todos", novoTipo: string) => {
        let defaultFreq = "1"
        if (novoTipo === "diaria") defaultFreq = ""
        else if (novoTipo === "intervalo") defaultFreq = "7"
        else if (novoTipo === "diasSemana") defaultFreq = "1"

        if (fase === "todos") {
            updateTodosConfig({ tipoFrequencia: novoTipo, frequencia: defaultFreq, diaSemanaProgramado: [] })
        } else {
            updateFaseConfig(fase, { tipoFrequencia: novoTipo, frequencia: defaultFreq, diaSemanaProgramado: [] })
        }
    }

    const toggleDay = (fase: FaseKey | "todos", day: string) => {
        if (fase === "todos") {
            const currentDays = todosConfig.diaSemanaProgramado
            const nextDays = currentDays.includes(day)
                ? currentDays.filter((d) => d !== day)
                : [...currentDays, day]
            updateTodosConfig({ diaSemanaProgramado: nextDays })
        } else {
            const currentDays = faseConfigs[fase].diaSemanaProgramado
            const nextDays = currentDays.includes(day)
                ? currentDays.filter((d) => d !== day)
                : [...currentDays, day]
            updateFaseConfig(fase, { diaSemanaProgramado: nextDays })
        }
    }

    const buildFreqPayload = (cfg: FaseConfig) => {
        let backendFreq: TipoFrequencia
        let freqValue: number | undefined
        let diasString: string[] | undefined

        if (cfg.tipoFrequencia === "diaria") {
            backendFreq = TipoFrequencia.Diaria
        } else if (cfg.tipoFrequencia === "intervalo") {
            backendFreq = TipoFrequencia.IntervaloEmDias
            freqValue = Number(cfg.frequencia) || undefined
        } else {
            backendFreq = TipoFrequencia.DiasDaSemana
            freqValue = Number(cfg.frequencia) || 1
            diasString = cfg.diaSemanaProgramado.length > 0 ? cfg.diaSemanaProgramado : undefined
        }

        return { backendFreq, freqValue, diasString }
    }

    const validateConfig = (cfg: FaseConfig): boolean => {
        if (cfg.tipoFrequencia === "diasSemana" && cfg.diaSemanaProgramado.length === 0) return false
        if (cfg.tipoFrequencia !== "diaria" && !cfg.frequencia) return false
        return true
    }

    const handleSubmit = async (): Promise<boolean> => {
        setValidationErrors([])

        if (!canEdit) {
            toast.error("Você não tem permissão para editar rotinas.")
            return false
        }

        if (!selectedEspecie) {
            toast.error("Selecione uma espécie")
            return false
        }
        if (!tipoRotina) {
            toast.error("Selecione o tipo de rotina")
            return false
        }

        const isAlimentacao = tipoRotina === "alimentacao"

        if (aplicarParaTodas) {
            if (!validateConfig(todosConfig)) {
                toast.error("Configure corretamente a frequência na configuração única.")
                return false
            }
        } else {
            const invalidFases = ALL_FASE_KEYS.filter(k => !validateConfig(faseConfigs[k]))
            if (invalidFases.length > 0) {
                const nomes = invalidFases.map(k => FASE_LABELS[k]).join(", ")
                toast.error(`Configure corretamente a frequência para: ${nomes}.`)
                return false
            }
        }

        try {
            setSubmitting(true)
            const backendTipoRotina = isAlimentacao ? TipoRotina.Alimentacao : TipoRotina.Biometria

            const fases = ALL_FASE_KEYS.map((faseKey) => {
                const cfg = aplicarParaTodas ? todosConfig : faseConfigs[faseKey]
                const { backendFreq, freqValue, diasString } = buildFreqPayload(cfg)
                return {
                    faseDeVida: FASE_TO_ENUM[faseKey],
                    tipoFrequencia: backendFreq,
                    frequencia: freqValue,
                    diaSemanaProgramado: diasString,
                    protocoloDieta: isAlimentacao ? cfg.protocoloDieta || undefined : undefined,
                }
            })

            const payload = {
                especieId: Number(selectedEspecie),
                tipoRotina: backendTipoRotina,
                fases,
            }

            if (isEditing && id) {
                const response = await rotinaAnimalService.update(payload)
                if (!response.success) {
                    setValidationErrors(response.validationErrors || [])
                    toast.error(response.message || "Erro ao atualizar rotina")
                    return false
                }
                toast.success("Rotina(s) atualizada(s) com sucesso!")
                navigate(returnUrl)
                return true
            }

            const response = await rotinaAnimalService.create(payload)
            if (!response.success) {
                setValidationErrors(response.validationErrors || [])
                toast.error(response.message || "Erro ao cadastrar rotina")
                return false
            }
            toast.success("Rotina(s) cadastrada(s) com sucesso!")
            navigate(returnUrl)
            return true
        } catch {
            toast.error("Erro ao salvar rotina. Tente novamente.")
            return false
        } finally {
            setSubmitting(false)
        }
    }

    const renderConfigBlock = (faseId: FaseKey | "todos", config: FaseConfig, isAlimentacao: boolean) => {
        const showDiasSelector = config.tipoFrequencia === "diasSemana"

        return (
            <div className="flex flex-col h-full space-y-5">
                <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Frequência</h3>
                    <RadioGroup
                        value={config.tipoFrequencia}
                        onValueChange={(v) => handleTipoFrequenciaChange(faseId, v)}
                        className="flex flex-col gap-3"
                    >
                        <div className={`flex items-center gap-2 ${config.tipoFrequencia !== "diaria" ? "text-gray-400" : ""}`}>
                            <RadioGroupItem
                                value="diaria"
                                id={`freq-diaria-${faseId}`}
                                className="data-checked:border-brand data-checked:bg-brand/10 dark:data-checked:bg-brand/10 [&_[data-slot=radio-group-indicator]>span]:bg-brand"
                            />
                            <Label htmlFor={`freq-diaria-${faseId}`} className="cursor-pointer font-normal text-sm">
                                Diário
                            </Label>
                        </div>

                        <div className={`flex items-center gap-2 ${config.tipoFrequencia !== "intervalo" ? "text-gray-400" : ""}`}>
                            <RadioGroupItem
                                value="intervalo"
                                id={`freq-intervalo-${faseId}`}
                                className="data-checked:border-brand data-checked:bg-brand/10 dark:data-checked:bg-brand/10 [&_[data-slot=radio-group-indicator]>span]:bg-brand"
                            />
                            <Label htmlFor={`freq-intervalo-${faseId}`} className="cursor-pointer flex items-center gap-2 font-normal text-sm">
                                <span>A cada</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={config.tipoFrequencia === "intervalo" ? config.frequencia : ""}
                                    onFocus={() => handleTipoFrequenciaChange(faseId, "intervalo")}
                                    onChange={(e) => {
                                        if (faseId === "todos") updateTodosConfig({ frequencia: e.target.value })
                                        else updateFaseConfig(faseId, { frequencia: e.target.value })
                                    }}
                                    className="w-14 h-7 rounded-md border border-gray-200 text-center text-sm outline-none focus:ring-1 focus:ring-brand"
                                    placeholder="0"
                                />
                                <span>dia(s)</span>
                            </Label>
                        </div>

                        <div className={`flex items-center gap-2 ${config.tipoFrequencia !== "diasSemana" ? "text-gray-400" : ""}`}>
                            <RadioGroupItem
                                value="diasSemana"
                                id={`freq-diasSemana-${faseId}`}
                                className="data-checked:border-brand data-checked:bg-brand/10 dark:data-checked:bg-brand/10 [&_[data-slot=radio-group-indicator]>span]:bg-brand"
                            />
                            <Label htmlFor={`freq-diasSemana-${faseId}`} className="cursor-pointer flex items-center gap-2 font-normal text-sm">
                                <span>A cada</span>
                                <input
                                    type="number"
                                    min={1}
                                    value={config.tipoFrequencia === "diasSemana" ? config.frequencia : ""}
                                    onFocus={() => handleTipoFrequenciaChange(faseId, "diasSemana")}
                                    onChange={(e) => {
                                        if (faseId === "todos") updateTodosConfig({ frequencia: e.target.value })
                                        else updateFaseConfig(faseId, { frequencia: e.target.value })
                                    }}
                                    className="w-14 h-7 rounded-md border border-gray-200 text-center text-sm outline-none focus:ring-1 focus:ring-brand"
                                    placeholder="1"
                                />
                                <span>semana(s)</span>
                            </Label>
                        </div>
                    </RadioGroup>

                    {showDiasSelector && (
                        <div className="mt-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">
                                Dias da semana programados
                            </p>
                            <div className="flex gap-1 flex-wrap">
                                {DIAS_SEMANA.map((day, idx) => {
                                    const selected = config.diaSemanaProgramado.includes(day)
                                    return (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(faseId, day)}
                                            title={day}
                                            className={`
                                                w-7 h-7 rounded-full text-xs font-semibold transition-all
                                                ${selected
                                                    ? "bg-brand text-white shadow-sm"
                                                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                                }
                                            `}
                                        >
                                            {DIAS_ABREV[idx]}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {isAlimentacao && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">Protocolo de Dieta</h3>
                        <textarea
                            value={config.protocoloDieta}
                            onChange={(e) => {
                                if (faseId === "todos") updateTodosConfig({ protocoloDieta: e.target.value })
                                else updateFaseConfig(faseId as FaseKey, { protocoloDieta: e.target.value })
                            }}
                            placeholder="Instruções de manejo..."
                            rows={3}
                            className="w-full p-2.5 text-sm rounded-md border border-gray-200 bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-brand resize-none"
                        />
                    </div>
                )}
            </div>
        )
    }

    const isAlimentacao = tipoRotina === "alimentacao"

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-white">
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral                   
                            title={isEditing ? "Editar Rotina" : "Cadastro de Rotina"}
                            breadcrumbTitle="Rotinas"
                            breadcrumbUrl="/rotina/visao-geral"
                        />
                    </HeaderContainer>

                    {loading ? (
                        <div className="p-8 text-center text-gray-500">Carregando...</div>
                    ) : (
                        <FormLayoutBase
                            titleFirstSection="Rotina do animal"
                            submitLabel={submitting ? "Salvando..." : isEditing ? "Atualizar" : "Salvar"}
                            onSubmit={canEdit ? handleSubmit : undefined}
                            onCancel={() => navigate(returnUrl)}
                            checkIsDirty={checkIsDirty}
                            columnsClassName="grid-cols-1"
                            extraSections={
                                <>
                                    {validationErrors.length > 0 && (
                                        <div className="rounded-md border border-red-200 bg-red-50 p-4">
                                            <p className="text-sm font-semibold text-red-700 mb-2">
                                                Verifique os seguintes erros:
                                            </p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {validationErrors.map((err, i) => (
                                                    <li key={i} className="text-sm text-red-600">
                                                        {err}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </>
                            }
                        >
                            {/* Espécie */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Selecione uma espécie <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={especies.map((e) => ({
                                        value: e.id.toString(),
                                        label: `${e.nome} (${e.nomePopular})`,
                                    }))}
                                    value={selectedEspecie}
                                    onChange={(v) => {
                                        setSelectedEspecie(v)
                                        setValidationErrors([])
                                    }}
                                    placeholder="Selecione a espécie"
                                    disabled={isEditing || Boolean(preSelectedEspecieId)}
                                />
                                <p className="text-xs text-gray-500">
                                    {isEditing
                                        ? "Espécie definida no cadastro."
                                        : preSelectedEspecieId
                                        ? "Espécie definida a partir do cadastro de espécie."
                                        : "Selecione a espécie para cadastrar a rotina."}
                                </p>
                            </div>

                            {/* Tipo de Rotina */}
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Tipo de Rotina <span className="text-red-500">*</span>
                                </label>
                                <SearchableSelect
                                    options={[
                                        { value: "alimentacao", label: "Alimentação" },
                                        { value: "biometria", label: "Biometria" },
                                    ]}
                                    value={tipoRotina}
                                    onChange={(value) => {
                                        setTipoRotina(value)
                                        setValidationErrors([])
                                    }}
                                    placeholder="Selecione o tipo de rotina"
                                    disabled={isEditing}
                                />
                            </div>

                            {/* Configuração por fase */}
                            {tipoRotina && (
                                <div className="rounded-lg border border-gray-200 bg-white border-l-4 border-l-brand overflow-hidden mt-2">
                                    <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <Switch
                                                checked={aplicarParaTodas}
                                                onCheckedChange={setAplicarParaTodas}
                                                id="aplicar-todas"
                                            />
                                            <Label htmlFor="aplicar-todas" className="cursor-pointer font-medium text-gray-700">
                                                Aplicar a mesma rotina para todas as fases
                                            </Label>
                                        </div>

                                        {isEditing && canEdit && (
                                            <button
                                                type="button"
                                                onClick={() => setShowDeleteModal(true)}
                                                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                                                title="Excluir rotina"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div className="p-5">
                                        {aplicarParaTodas ? (
                                            <div className="border border-gray-200 rounded-lg p-5">
                                                <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">Configuração Única (Aplicada a todas as fases)</h3>
                                                {renderConfigBlock("todos", todosConfig, isAlimentacao)}
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                                                {ALL_FASE_KEYS.map((fase) => (
                                                    <div key={fase} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-white hover:border-gray-300 transition-colors">
                                                        <h3 className="font-semibold text-gray-800 mb-4 border-b pb-2">{FASE_LABELS[fase]}</h3>
                                                        {renderConfigBlock(fase, faseConfigs[fase], isAlimentacao)}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </FormLayoutBase>
                    )}
                </PageContainer>
            </SidebarInset>
            <DeleteConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteRotina}
                title="Excluir Rotina"
                description="Deseja realmente excluir esta rotina? Esta ação não poderá ser desfeita."
                loading={deleting}
            />
        </SidebarProvider>
    )
}
