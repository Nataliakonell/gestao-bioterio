import React, { useEffect, useState, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { StatsCard } from "@/components/stats-card"
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, AlertCircle, Plus, CalendarDays, AlertTriangle, Pill } from "lucide-react"
import { toast } from "sonner"
import { medicacaoAdministradaService, type MedicacaoAdministradaListVm } from "@/services/MedicacaoAdministradaService"
import { prescricaoMedicacaoService, type PrescricaoMedicacaoListVm } from "@/services/PrescricaoMedicacaoService"
import { animalService, type AnimalLookupVm } from "@/services/animalService"
import RegistrarAdministracaoModal from "@/components/clinico/RegistrarAdministracaoModal"
import { DataTable, type ColumnDef } from "@/components/data-table"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { AddButton } from "@/components/formulario-registro/AddButton"
import { usePermissions } from "@/contexts/PermissionsContext"

interface MapaRow {
    animalId: number
    numeroRegistro: string
    especieNome: string
    peso?: number
    local: string
    prescricao: PrescricaoMedicacaoListVm
    doses: MedicacaoAdministradaListVm[]
    temAtrasada: boolean
}

const formatDate = (d: Date) =>
    d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })

const formatDateISO = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const parseDateISO = (str: string | null | undefined): Date | null => {
    if (!str) return null
    const clean = str.split('T')[0]
    const parts = clean.split('-')
    if (parts.length === 3) {
        const y = parseInt(parts[0], 10)
        const m = parseInt(parts[1], 10) - 1
        const d = parseInt(parts[2], 10)
        const date = new Date(y, m, d)
        return isNaN(date.getTime()) ? null : date
    }
    const date = new Date(str)
    return isNaN(date.getTime()) ? null : date
}


const STATUS_CONFIG = {
    Concluido: {
        icon: CheckCircle2,
        bg: "bg-emerald-100 dark:bg-emerald-950/50",
        iconColor: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800",
        label: "Concluída",
    },
    Atrasada: {
        icon: AlertCircle,
        bg: "bg-red-100 dark:bg-red-950/50",
        iconColor: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-800",
        label: "Atrasada",
    },
    Agendada: {
        icon: Clock,
        bg: "bg-blue-100 dark:bg-blue-950/50",
        iconColor: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-800",
        label: "Agendada",
    },
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function MapaExecucao() {
    const navigate = useNavigate()
    const initialDate = React.useMemo(() => {
        const p = new URLSearchParams(window.location.search)
        const d = p.get("data") || p.get("date")
        return parseDateISO(d)
    }, [])
    const [selectedDate, setSelectedDate] = useState<Date>(() => initialDate || new Date())
    const hasInitializedDateRef = React.useRef(!!initialDate)
    const [search, setSearch] = useState("")
    const initialAnimalId = React.useMemo(() => {
        const p = new URLSearchParams(window.location.search)
        const v = p.get("animalId")
        return v ? Number(v) : null
    }, [])
    const [rows, setRows] = useState<MapaRow[]>([])
    const [loading, setLoading] = useState(true)
    const [modalOpen, setModalOpen] = useState(false)
    const [modalDose, setModalDose] = useState<MedicacaoAdministradaListVm | null>(null)
    const [modalPrescricao, setModalPrescricao] = useState<PrescricaoMedicacaoListVm | null>(null)
    const [modalHour, setModalHour] = useState<number | null>(null)
    const [modalAnimal, setModalAnimal] = useState<AnimalLookupVm | null>(null)

    const [statusFilter, setStatusFilter] = useState<"todas" | "atrasadas" | "ativas">("todas")
    const [selectedEspecie, setSelectedEspecie] = useState<string>("todos")
    const [sortField, setSortField] = useState<string>("numeroRegistro")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
    const hasInitializedSearchRef = React.useRef(false)
    const [totalPrescricoesAtivasGeral, setTotalPrescricoesAtivasGeral] = useState(0)
    const [totalDosesAtrasadasGeral, setTotalDosesAtrasadasGeral] = useState(0)

    const { hasPermission } = usePermissions()

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const [doses, prescricoes, animais] = await Promise.all([
                medicacaoAdministradaService.getAll(),
                prescricaoMedicacaoService.getAll(),
                animalService.getLookup(),
            ])

            const animaisMap = new Map<number, AnimalLookupVm>()
            for (const a of animais) animaisMap.set(a.id, a)

            // Contadores globais para os cards de status
            const agora = new Date()
            const atrasadasGeral = doses.filter(d => {
                if (d.statusDose === "Concluido") return false
                if (d.statusDose === "Atrasada") return true
                return new Date(d.dataHoraPrevista) < agora
            }).length
            setTotalDosesAtrasadasGeral(atrasadasGeral)

            const ativasGeral = prescricoes.filter(p => {
                if (p.status !== "Ativa") return false
                const total = p.totalAdministracoes || p.quantidadeDoses || 0
                const concluidas = p.administracoesConcluidas || 0
                return !(total > 0 && concluidas >= total)
            }).length
            setTotalPrescricoesAtivasGeral(ativasGeral)

            if (initialAnimalId && !hasInitializedDateRef.current) {
                const prescricoesDoAnimal = prescricoes.filter(p => p.animalId === initialAnimalId)
                const prescricoesIds = new Set(prescricoesDoAnimal.map(p => p.id))
                const dosesDoAnimal = doses.filter(d => prescricoesIds.has(d.prescricaoMedicacaoId))

                const currTargetDate = formatDateISO(selectedDate)
                const temDosesHoje = dosesDoAnimal.some(d => {
                    const dataRef = (d.statusDose === "Concluido" && d.dataHoraAdministracao)
                        ? d.dataHoraAdministracao
                        : d.dataHoraPrevista
                    return formatDateISO(new Date(dataRef)) === currTargetDate
                })

                if (!temDosesHoje) {
                    let dataAlvoStr: string | null = null
                    if (dosesDoAnimal.length > 0) {
                        const pendente = dosesDoAnimal.find(d => d.statusDose !== "Concluido")
                        dataAlvoStr = pendente ? pendente.dataHoraPrevista : dosesDoAnimal[0].dataHoraPrevista
                    } else if (prescricoesDoAnimal.length > 0 && prescricoesDoAnimal[0].dataHoraInicio) {
                        dataAlvoStr = prescricoesDoAnimal[0].dataHoraInicio
                    }

                    if (dataAlvoStr) {
                        const parsed = parseDateISO(dataAlvoStr)
                        if (parsed) {
                            hasInitializedDateRef.current = true
                            setSelectedDate(parsed)
                            return
                        }
                    }
                }
                hasInitializedDateRef.current = true
            }

            const now = new Date()
            const targetDate = formatDateISO(selectedDate)

            const dosesNoDia = doses.map(d => {
                const dataPrevista = new Date(d.dataHoraPrevista)
                let computedStatus = d.statusDose
                if (computedStatus === "Agendada" && dataPrevista < now) {
                    computedStatus = "Atrasada"
                }
                return { ...d, statusDose: computedStatus }
            }).filter((d) => {
                if (d.statusDose === "Concluido" && d.dataHoraAdministracao) {
                    const dataAdm = new Date(d.dataHoraAdministracao)
                    return formatDateISO(dataAdm) === targetDate
                }
                const dataPrevista = new Date(d.dataHoraPrevista)
                return formatDateISO(dataPrevista) === targetDate
            })

            const dosesPorPrescricao = new Map<number, MedicacaoAdministradaListVm[]>()
            for (const dose of dosesNoDia) {
                const list = dosesPorPrescricao.get(dose.prescricaoMedicacaoId) ?? []
                list.push(dose)
                dosesPorPrescricao.set(dose.prescricaoMedicacaoId, list)
            }

            const prescricoesComDoses = prescricoes.filter(
                (p) => dosesPorPrescricao.has(p.id) && animaisMap.has(p.animalId)
            )

            const mapa: MapaRow[] = prescricoesComDoses.map((p) => {
                const animal = animaisMap.get(p.animalId)
                const d = dosesPorPrescricao.get(p.id) ?? []
                return {
                    animalId: p.animalId,
                    numeroRegistro: animal?.numeroRegistro ?? String(p.animalId),
                    especieNome: animal?.especieNome ?? "—",
                    peso: animal?.peso,
                    local: "Ambulatório",
                    prescricao: p,
                    doses: d,
                    temAtrasada: d.some((d) => d.statusDose === "Atrasada")
                }
            })

            if (initialAnimalId && !hasInitializedSearchRef.current) {
                const animal = animaisMap.get(initialAnimalId)
                if (animal?.numeroRegistro) {
                    setSearch(prev => {
                        if (prev === "") {
                            hasInitializedSearchRef.current = true
                            return animal.numeroRegistro
                        }
                        hasInitializedSearchRef.current = true
                        return prev
                    })
                } else {
                    hasInitializedSearchRef.current = true
                }
            }

            setRows(mapa)
        } catch {
            toast.error("Erro ao carregar mapa de execução")
        } finally {
            setLoading(false)
        }
    }, [selectedDate, initialAnimalId])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    useEffect(() => {
        const p = new URLSearchParams(window.location.search)
        const currentDateParam = p.get("data") || p.get("date")
        const newDateStr = formatDateISO(selectedDate)
        if (currentDateParam !== newDateStr && (p.has("animalId") || p.has("data") || p.has("date"))) {
            p.set("data", newDateStr)
            p.delete("date")
            const qs = p.toString()
            navigate(`/clinico/mapa-execucao${qs ? `?${qs}` : ""}`, { replace: true })
        }
    }, [selectedDate, navigate])

    const prevDay = () => {
        const d = new Date(selectedDate)
        d.setDate(d.getDate() - 1)
        setSelectedDate(d)
    }

    const nextDay = () => {
        const d = new Date(selectedDate)
        d.setDate(d.getDate() + 1)
        setSelectedDate(d)
    }

    const goToday = () => setSelectedDate(new Date())

    const getDoseParaHora = (row: MapaRow, hour: number): MedicacaoAdministradaListVm | null => {
        return row.doses.find((d) => {
            if (d.statusDose === "Concluido" && d.dataHoraAdministracao) {
                return new Date(d.dataHoraAdministracao).getHours() === hour
            }
            return new Date(d.dataHoraPrevista).getHours() === hour
        }) ?? null
    }

    const handleCellClick = (row: MapaRow, hour: number) => {
        const dose = getDoseParaHora(row, hour)
        const animal: AnimalLookupVm = {
            id: row.animalId,
            numeroRegistro: row.numeroRegistro,
            especieNome: row.especieNome,
        }

        if (row.prescricao.status === "Suspensa" && dose?.statusDose !== "Concluido") {
            toast.error("Não é possível registrar administrações para uma prescrição suspensa.")
            return
        }

        if (!dose) {
            if (row.temAtrasada) {
                toast.warning("Resolva a dose atrasada antes de adicionar uma dose extra.")
                return
            }
            setModalDose(null)
            setModalPrescricao(row.prescricao)
            setModalHour(hour)
            setModalAnimal(animal)
            setModalOpen(true)
        } else if (dose.statusDose === "Concluido") {
            setModalDose(dose)
            setModalPrescricao(row.prescricao)
            setModalHour(hour)
            setModalAnimal(animal)
            setModalOpen(true)
        } else if (dose.statusDose === "Atrasada") {
            setModalDose(dose)
            setModalPrescricao(row.prescricao)
            setModalHour(hour)
            setModalAnimal(animal)
            setModalOpen(true)
        } else {
            if (row.temAtrasada) {
                toast.warning("Resolva a dose atrasada antes de registrar esta dose.")
                return
            }
            setModalDose(dose)
            setModalPrescricao(row.prescricao)
            setModalHour(hour)
            setModalAnimal(animal)
            setModalOpen(true)
        }
    }

    const handleRowClick = (row: MapaRow) => {
        if (hasPermission("Atendimento veterinário", "Editar")) {
            navigate("/clinico/nova-prescricao", { state: { prescricaoParaEditar: row.prescricao } })
        }
    }

    const especiesUnicas = useMemo(() => {
        const especies = new Set<string>()
        rows.forEach(r => especies.add(r.especieNome))
        return Array.from(especies).sort()
    }, [rows])

    const handleSearchChange = React.useCallback((val: string) => {
        setSearch(val)
        if (val === "" && initialAnimalId) {
            const p = new URLSearchParams(window.location.search)
            if (p.has("animalId")) {
                p.delete("animalId")
                const qs = p.toString()
                navigate(`/clinico/mapa-execucao${qs ? `?${qs}` : ""}`, { replace: true })
            }
        }
    }, [initialAnimalId, navigate])

    const filteredRows = useMemo(() => {
        const result = rows.filter((row) => {
            const q = search.toLowerCase().trim()
            if (q && !(
                row.numeroRegistro.toLowerCase().includes(q) ||
                row.especieNome.toLowerCase().includes(q) ||
                row.prescricao.medicacaoNome.toLowerCase().includes(q)
            )) {
                return false
            }

            if (selectedEspecie !== "todos" && selectedEspecie !== "" && row.especieNome !== selectedEspecie) {
                return false
            }

            if (statusFilter === "atrasadas") {
                return row.temAtrasada
            }

            if (statusFilter === "ativas") {
                const total = row.prescricao.totalAdministracoes || row.prescricao.quantidadeDoses || 0
                const concluidas = row.prescricao.administracoesConcluidas || 0
                const estaAtiva = row.prescricao.status === "Ativa" && !(total > 0 && concluidas >= total)
                return estaAtiva
            }

            return true
        })

        result.sort((a, b) => {
            let valA: string = ""
            let valB: string = ""

            if (sortField === "numeroRegistro") {
                valA = a.numeroRegistro
                valB = b.numeroRegistro
            } else if (sortField === "especieNome") {
                valA = a.especieNome
                valB = b.especieNome
            } else if (sortField === "medicacaoNome") {
                valA = a.prescricao.medicacaoNome
                valB = b.prescricao.medicacaoNome
            }

            if (valA < valB) return sortDirection === "asc" ? -1 : 1
            if (valA > valB) return sortDirection === "asc" ? 1 : -1
            return 0
        })

        return result
    }, [rows, search, selectedEspecie, statusFilter, sortField, sortDirection])

    const baseCols: ColumnDef<MapaRow>[] = [
        {
            header: "Animal",
            accessorKey: "numeroRegistro",
            cell: (row) => (
                <div className="flex flex-col">
                    <span className="truncate text-xs font-semibold text-zinc-400 dark:text-zinc-400">#{row.numeroRegistro}</span>
                    <span className="font-semibold italic text-zinc-900 dark:text-zinc-100">{row.especieNome}</span>
                </div>
            ),
            width: 120,
        },
        {
            header: "Peso(g)",
            accessorKey: "peso",
            cell: (row) => (
                <div className="flex justify-center w-full">
                    <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{row.peso ? row.peso : "—"}</span>
                </div>
            ),
            width: 90,
        },
        {
            header: "Instalação",
            accessorKey: "local",
            cell: (row) => (
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{row.local || "—"}</span>
            ),
            width: 110,
        },
        {
            header: "Prescrição",
            cell: (row) => (
                <div className="flex flex-col max-w-[200px]">
                    <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate" title={row.prescricao.medicacaoNome}>
                            {row.prescricao.medicacaoNome} {row.prescricao.volumeDose}
                        </span>
                        {row.prescricao.status === "Suspensa" && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800 shrink-0">
                                Suspensa
                            </span>
                        )}
                    </div>
                    <span className="text-zinc-500 dark:text-zinc-300 text-[11px] font-medium">
                        {row.prescricao.quantidadeDoses === 1
                            ? "Dose única"
                            : `A cada ${row.prescricao.intervaloEntreDosesHoras} horas`} • Via {row.prescricao.viaAdministracao}
                    </span>
                </div>
            ),
            width: 200,
        }
    ];

    const hourCols: ColumnDef<MapaRow>[] = HOURS.map((hour) => ({
        header: String(hour).padStart(2, "0"),
        headerClassName: "text-center px-1 border-l border-gray-100 dark:border-gray-800 font-medium text-zinc-200 dark:text-zinc-200",
        cellClassName: "text-center px-1 border-l border-gray-100 dark:border-gray-800",
        width: 40,
        cell: (row) => {
            const dose = getDoseParaHora(row, hour)
            const status = dose?.statusDose as keyof typeof STATUS_CONFIG | undefined
            const cfg = status ? STATUS_CONFIG[status] : null
            const isSuspended = row.prescricao.status === "Suspensa"

            return (
                <HourCell
                    dose={dose}
                    cfg={cfg}
                    hour={hour}
                    isSuspended={isSuspended}
                    bloqueado={isSuspended || (!dose && row.temAtrasada) || (status === "Agendada" && row.temAtrasada)}
                    onClick={() => handleCellClick(row, hour)}
                />
            )
        },
    }))

    const columns = [...baseCols, ...hourCols]

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <PageContainer>
                    <HeaderContainer>
                        <HeaderGeral
                            breadcrumbTitle="Clínico"
                            breadcrumbUrl="/atendimento/visao-geral"
                            title="Mapa de execução"
                        />
                        {hasPermission("Atendimento veterinário", "Gerenciar") && (
                            <AddButton text="Nova prescrição" route="/clinico/nova-prescricao" />
                        )}
                    </HeaderContainer>

                    {/* Cards de Status / Indicadores */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                        <StatsCard
                            label="Medicações atrasadas"
                            value={totalDosesAtrasadasGeral}
                            description="Doses pendentes com horário expirado"
                            icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
                            onClick={() => {
                                setStatusFilter((prev) => (prev === "atrasadas" ? "todas" : "atrasadas"))
                            }}
                            className={
                                statusFilter === "atrasadas"
                                    ? "border-red-500 ring-2 ring-red-500/20"
                                    : ""
                            }
                        />
                        <StatsCard
                            label="Prescrições ativas"
                            value={totalPrescricoesAtivasGeral}
                            description="Prescrições ativas em andamento"
                            icon={<Pill className="h-5 w-5 text-blue-500" />}
                            onClick={() => {
                                setStatusFilter((prev) => (prev === "ativas" ? "todas" : "ativas"))
                            }}
                            className={
                                statusFilter === "ativas"
                                    ? "border-blue-500 ring-2 ring-blue-500/20"
                                    : ""
                            }
                        />
                        <StatsCard
                            label="Prescrições no dia"
                            value={rows.length}
                            description="Prescrições com doses agendadas nesta data"
                            icon={<CalendarDays className="h-5 w-5 text-emerald-500" />}
                            onClick={() => {
                                setStatusFilter("todas")
                            }}
                            className={
                                statusFilter === "todas"
                                    ? "border-emerald-500 ring-2 ring-emerald-500/20"
                                    : ""
                            }
                        />
                    </div>

                    <div className="flex min-w-0 flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="flex items-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-card shadow-sm overflow-hidden shrink-0">
                                <button
                                    onClick={prevDay}
                                    className="px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    aria-label="Dia anterior"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <input
                                    type="date"
                                    value={formatDateISO(selectedDate)}
                                    onChange={(e) => {
                                        if (e.target.value) {
                                            const [year, month, day] = e.target.value.split("-").map(Number)
                                            if (year && month && day) {
                                                setSelectedDate(new Date(year, month - 1, day))
                                            }
                                        }
                                    }}
                                    className="px-3 py-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100 border-x border-gray-200 dark:border-gray-800 text-center bg-transparent cursor-pointer focus:outline-none focus:bg-gray-50 dark:focus:bg-zinc-800"
                                    aria-label="Selecionar ou digitar data"
                                />
                                <button
                                    onClick={nextDay}
                                    className="px-3 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-zinc-800 transition"
                                    aria-label="Próximo dia"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="ml-auto">
                                <BarraDeBuscaEFiltro
                                    search={search}
                                    onSearchChange={handleSearchChange}
                                    placeholder="Buscar por registro ou espécie..."
                                    filterSections={[
                                        {
                                            key: "sort",
                                            label: "Ordenar por",
                                            type: "radio",
                                            options: [
                                                { value: "numeroRegistro:asc", label: "Nº Registro (A → Z)" },
                                                { value: "numeroRegistro:desc", label: "Nº Registro (Z → A)" },
                                                { value: "especieNome:asc", label: "Espécie (A → Z)" },
                                                { value: "especieNome:desc", label: "Espécie (Z → A)" },
                                                { value: "medicacaoNome:asc", label: "Medicação (A → Z)" },
                                                { value: "medicacaoNome:desc", label: "Medicação (Z → A)" },
                                            ],
                                            selectedValue: `${sortField}:${sortDirection}`,
                                            onValueChange: (val) => {
                                                const [field, dir] = val.split(":")
                                                setSortField(field)
                                                setSortDirection(dir as "asc" | "desc")
                                            },
                                        },
                                        {
                                            key: "especie",
                                            label: "Espécie",
                                            type: "select",
                                            options: especiesUnicas.map((especie) => ({
                                                value: especie,
                                                label: especie,
                                            })),
                                            selectedValue: selectedEspecie,
                                            onValueChange: setSelectedEspecie,
                                        },
                                    ]}
                                />
                            </div>
                        </div>

                        {/* ── Tabela Mapa ── */}
                        <DataTable
                            columns={columns}
                            data={filteredRows}
                            onRowClick={handleRowClick}
                            loading={loading}
                            emptyMessage={search ? "Nenhuma prescrição encontrada para a busca." : "Nenhuma prescrição ativa para este dia."}
                            tableClassName="min-w-[1480px]"
                        />
                    </div>
                </PageContainer>
            </SidebarInset>

            {/* Modal de administração */}
            {modalOpen && modalPrescricao && hasPermission("Atendimento veterinário", "Editar") && (
                <RegistrarAdministracaoModal
                    open={modalOpen}
                    onClose={() => setModalOpen(false)}
                    dose={modalDose}
                    prescricao={modalPrescricao}
                    animal={modalAnimal}
                    hour={modalHour}
                    selectedDate={selectedDate}
                    onSuccess={() => {
                        setModalOpen(false)
                        fetchData()
                    }}
                />
            )}
        </SidebarProvider>
    )
}

interface HourCellProps {
    dose: MedicacaoAdministradaListVm | null
    cfg: (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG] | null
    hour: number
    isSuspended?: boolean
    bloqueado: boolean
    onClick: () => void
}

function HourCell({ dose, cfg, hour, isSuspended, bloqueado, onClick }: HourCellProps) {
    const [showTooltip, setShowTooltip] = useState(false)
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Atendimento veterinário", "Editar")

    let tooltipText: string
    if (isSuspended) {
        if (dose?.statusDose === "Concluido" && dose.dataHoraAdministracao) {
            const time = new Date(dose.dataHoraAdministracao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            tooltipText = `Prescrição suspensa • Administrada às ${time}`
        } else {
            tooltipText = "Prescrição suspensa"
        }
    } else if (dose) {
        if (dose.statusDose === "Concluido" && dose.dataHoraAdministracao) {
            const time = new Date(dose.dataHoraAdministracao).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            tooltipText = `Administrada às ${time}`
        } else if (dose.dataHoraPrevista) {
            const timePrev = new Date(dose.dataHoraPrevista).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
            tooltipText = `${cfg?.label ?? dose.statusDose} • ${timePrev}`
        } else {
            tooltipText = `${cfg?.label ?? dose.statusDose} • ${String(hour).padStart(2, "0")}:00`
        }
    } else {
        tooltipText = !canEdit
            ? "Sem permissão"
            : bloqueado
                ? "Resolva a dose atrasada primeiro"
                : `Adicionar dose extra às ${String(hour).padStart(2, "0")}h`
    }

    if (!dose) {
        return (
            <div className="relative flex justify-center w-full">
                <button
                    onClick={(e) => { e.stopPropagation(); onClick(); }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className={`h-7 w-7 aspect-square flex items-center justify-center rounded-full border transition
                        ${bloqueado || !canEdit
                            ? "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-zinc-800/40 cursor-not-allowed opacity-40"
                            : "border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-zinc-800/40 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:border-gray-400 dark:hover:border-gray-600 cursor-pointer text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                    disabled={bloqueado || !canEdit}
                    title={tooltipText}
                >
                    <Plus className="h-3 w-3" />
                </button>
                {showTooltip && (
                    <Tooltip text={tooltipText} />
                )}
            </div>
        )
    }

    const Icon = cfg?.icon ?? CheckCircle2
    const isButtonDisabled = isSuspended ? dose.statusDose !== "Concluido" : (bloqueado && dose.statusDose !== "Atrasada")

    return (
        <div className="relative flex justify-center w-full">
            <button
                onClick={(e) => { e.stopPropagation(); onClick( ); }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                disabled={isButtonDisabled}
                className={`h-7 w-7 aspect-square flex items-center justify-center rounded-full border ${cfg?.bg ?? "bg-gray-100"} ${cfg?.border ?? "border-gray-200"} transition hover:opacity-80 cursor-pointer ${isButtonDisabled ? "cursor-not-allowed opacity-50" : ""}`}
                title={tooltipText}
            >
                <Icon className={`h-3.5 w-3.5 ${cfg?.iconColor ?? "text-gray-400"}`} />
            </button>
            {showTooltip && (
                <Tooltip text={tooltipText} />
            )}
        </div>
    )
}

function Tooltip({ text }: { text: string }) {
    return (
        <div className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 z-50 whitespace-nowrap rounded-md bg-gray-800 px-2 py-1 text-[10px] text-white shadow-lg pointer-events-none">
            {text}
            <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </div>
    )
}
