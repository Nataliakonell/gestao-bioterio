import { useState, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import { useNavigate } from "react-router-dom"
import { type DateRange } from "react-day-picker"
import {Stethoscope, FlaskConical, Pill, FileText, Scissors, Paperclip, UserCheck, ArrowRightCircle, ShieldCheck, Skull} from "lucide-react"
import { toast } from "sonner"
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro"
import { prescricaoMedicacaoService } from "@/services/PrescricaoMedicacaoService"
import { evolucaoService } from "@/services/EvolucaoService"
import { procedimentoService } from "@/services/ProcedimentoService"
import { consultaService } from "@/services/ConsultaService"
import { anexoService } from "@/services/AnexoService"
import { type ClinicoTimelineItem } from "../../components/clinico/ClinicoTimelineCard"
import { ClinicoTimelineList } from "../../components/clinico/ClinicoTimelineList"
import { ClinicoExameSuspensaoModal } from "../../components/clinico/ClinicoExameSuspensaoModal"
import { ClinicoAtendimentoSelectorModal } from "../../components/clinico/ClinicoAtendimentoSelectorModal"
import { DocumentoClinicoModal, type TipoDocumentoClinicoModal } from "@/components/DocumentoViewer"
import { ConsultaFormModal } from "@/routes/Consulta/ConsultaFormModal"
import { AltaAmbulatorialModal } from "@/routes/Consulta/AltaAmbulatorialModal"
import { LiberacaoQuarentenaModal } from "@/routes/Consulta/LiberacaoQuarentenaModal"
import { RegistroObitoModal } from "@/routes/Consulta/RegistroObitoModal"
import { registroObitoService, type RegistroObitoDetailVm } from "@/services/RegistroObitoService"
import { altaAmbulatoriaService } from "@/services/AltaAmbulatoriaService"
import { liberacaoQuarentenaService } from "@/services/LiberacaoQuarentenaService"
import { AnexoModal } from "@/routes/Consulta/AnexoModal"
import { EvolucaoModal } from "@/routes/Consulta/EvolucaoModal"
import { ProcedimentoModal } from "@/routes/Consulta/ProcedimentoModal"
import { PrescricaoMedicacaoModal } from "@/routes/Consulta/PrescricaoMedicacaoModal"
import { SolicitacaoExameModal } from "@/routes/Consulta/SolicitacaoExameModal"
import { solicitacaoExameService, tipoExameLabels } from "@/services/SolicitacaoExameService"
import { tipoAtendimentoLabels } from "@/services/AtendimentoService"
import { usePermissions } from "@/contexts/PermissionsContext"

interface AbaClinicoProps {
    animalId: number
    situacaoAnimal?: number
    onInstalacaoChanged?: () => void | Promise<void>
}

const normalizeStr = (str: string | null | undefined) => {
    if (!str) return ""
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

const categoriaMarkerStyles: Record<string, { bg: string; border: string; text: string; icon: any }> = {
    Consulta: { bg: "bg-green-50", border: "border-green-500", text: "text-green-600", icon: Stethoscope },
    AltaAmbulatorial: { bg: "bg-red-50", border: "border-red-500", text: "text-red-600", icon: UserCheck },
    EncaminhamentoAmbulatorial: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-600", icon: ArrowRightCircle },
    EncaminhamentoLiberacaoQuarentena: { bg: "bg-red-50", border: "border-red-500", text: "text-red-600", icon: ShieldCheck },
    LiberacaoQuarentena: { bg: "bg-red-50", border: "border-red-500", text: "text-red-600", icon: ShieldCheck },
    RegistroObito: { bg: "bg-red-50", border: "border-red-600", text: "text-red-700", icon: Skull },
    ResultadoExame: { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-600", icon: FlaskConical },
    Exame: { bg: "bg-amber-50", border: "border-amber-500", text: "text-amber-600", icon: FlaskConical },
    Evolucao: { bg: "bg-purple-50", border: "border-purple-500", text: "text-purple-600", icon: FileText },
    Procedimento: { bg: "bg-blue-50", border: "border-blue-500", text: "text-blue-600", icon: Scissors },
    Anexo: { bg: "bg-slate-50", border: "border-slate-500", text: "text-slate-600", icon: Paperclip },
    PrescricaoMedicacao: { bg: "bg-teal-50", border: "border-teal-500", text: "text-teal-600", icon: Pill },
}

export function AbaClinico({ animalId, situacaoAnimal, onInstalacaoChanged }: AbaClinicoProps) {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [timelineItems, setTimelineItems] = useState<ClinicoTimelineItem[]>([])
    const [search, setSearch] = useState("")
    const [dateRange, setDateRange] = useState<DateRange | undefined>()
    const [selectedTipos, setSelectedTipos] = useState<string[]>([])
    const [selectedExameStatus, setSelectedExameStatus] = useState<string[]>([])
    const [sortField, setSortField] = useState<string>("dataHoraRegistro")
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [headerContainer, setHeaderContainer] = useState<HTMLElement | null>(null)
    
    useEffect(() => {
        const el = document.getElementById("tab-header-actions")
        setHeaderContainer(el)
    }, [])

    const [docModal, setDocModal] = useState<{
        isOpen: boolean
        tipo: TipoDocumentoClinicoModal
        atendimentoId: number
        solicitacoesGroup?: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]
    } | null>(null)

    const [atendimentoSelectorOpen, setAtendimentoSelectorOpen] = useState(false)
    const [tipoAtendimentoSelecionado, setTipoAtendimentoSelecionado] = useState<string>("")
    const [consultaModalOpen, setConsultaModalOpen] = useState(false)
    const [consultaParaEditar, setConsultaParaEditar] = useState<import("@/services/ConsultaService").ConsultaListVm | null>(null)
    const [altaModalOpen, setAltaModalOpen] = useState(false)
    const [altaParaEditar, setAltaParaEditar] = useState<import("@/services/AltaAmbulatoriaService").AltaAmbulatoriaDetailVm | null>(null)
    const [quarentenaModalOpen, setQuarentenaModalOpen] = useState(false)
    const [quarentenaParaEditar, setQuarentenaParaEditar] = useState<import("@/services/LiberacaoQuarentenaService").LiberacaoQuarentenaDetailVm | null>(null)
    const [registroObitoModalOpen, setRegistroObitoModalOpen] = useState(false)
    const [registroObitoParaEditar, setRegistroObitoParaEditar] = useState<RegistroObitoDetailVm | null>(null)
    const [anexoModalOpen, setAnexoModalOpen] = useState(false)
    const [anexoParaEditar, setAnexoParaEditar] = useState<any>(null)
    const [evolucaoModalOpen, setEvolucaoModalOpen] = useState(false)
    const [evolucaoParaEditar, setEvolucaoParaEditar] = useState<any>(null)
    const [procedimentoModalOpen, setProcedimentoModalOpen] = useState(false)
    const [procedimentoParaEditar, setProcedimentoParaEditar] = useState<any>(null)
    const [prescricaoModalOpen, setPrescricaoModalOpen] = useState(false)
    const [solicitacaoExameModalOpen, setSolicitacaoExameModalOpen] = useState(false)
    const [exameSuspensaoModal, setExameSuspensaoModal] = useState<{ group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[] } | null>(null)
    const [prescricoesRefreshKey, setPrescricoesRefreshKey] = useState(0)

    const handleEditDocumento = useCallback(async (tipo: TipoDocumentoClinicoModal, id: number) => {
        setDocModal(null)
        if (tipo === "AltaAmbulatorial") {
            const alta = (id ? await altaAmbulatoriaService.getById(id).catch(() => null) : null) || await altaAmbulatoriaService.getByAnimalId(animalId).catch(() => null)
            setAltaParaEditar(alta)
            setAltaModalOpen(true)
        } else if (tipo === "LiberacaoQuarentena") {
            const quarentena = (id ? await liberacaoQuarentenaService.getById(id).catch(() => null) : null) || await liberacaoQuarentenaService.getByAnimalId(animalId).catch(() => null)
            setQuarentenaParaEditar(quarentena)
            setQuarentenaModalOpen(true)
        } else {
            navigate(`/atendimento/editar/${id}?animalId=${animalId}`)
        }
    }, [animalId, navigate])

    const getGrupoStatus = useCallback((group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]): "Ativa" | "Suspensa" | "Cancelada" => {
        const statuses = group.map(s => (s.status || "Ativa"))
        if (statuses.includes("Cancelada")) return "Cancelada"
        if (statuses.every(s => s === "Suspensa")) return "Suspensa"
        if (statuses.includes("Suspensa")) return "Suspensa"
        return "Ativa"
    }, [])

    const handleOpenDocumento = useCallback((tipo: TipoDocumentoClinicoModal, atendimentoId: number, solicitacoesGroup?: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]) => {
        setDocModal({
            isOpen: true,
            tipo,
            atendimentoId,
            solicitacoesGroup,
        })
    }, [])

    const handleOpenExameDocumento = useCallback((group: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[]) => {
        if (!group || group.length === 0) return
        setDocModal({
            isOpen: true,
            tipo: "SolicitacaoExame",
            atendimentoId: group[0].id,
            solicitacoesGroup: group,
        })
    }, [])

    const handleAtendimentoTipoConfirm = () => {
        if (!tipoAtendimentoSelecionado) {
            toast.error("Selecione o tipo de atendimento")
            return
        }
        setAtendimentoSelectorOpen(false)
        if (tipoAtendimentoSelecionado === "Consulta") { setConsultaParaEditar(null); setConsultaModalOpen(true) }
        else if (tipoAtendimentoSelecionado === "AltaAmbulatorial") setAltaModalOpen(true)
        else if (tipoAtendimentoSelecionado === "LiberacaoQuarentena") setQuarentenaModalOpen(true)
        else if (tipoAtendimentoSelecionado === "RegistroObito") { setRegistroObitoParaEditar(null); setRegistroObitoModalOpen(true); }
        setTipoAtendimentoSelecionado("")
    }

    const fetchDadosClinicos = useCallback(async () => {
        try {
            setLoading(true)
            const [prescricoesRes, evolucoesRes, procedimentosRes, consultasRes, anexosRes, solicitacoesExameRes, altaRes, quarentenaRes, registroObitoRes] = await Promise.all([
                prescricaoMedicacaoService.getAll({ animalId }).catch(() => []),
                evolucaoService.getAll().catch(() => []),
                procedimentoService.getAll().catch(() => []),
                consultaService.getAll({ animalId }).catch(() => []),
                anexoService.getAll({ animalId }).catch(() => []),
                solicitacaoExameService.getAll({ animalId }).catch(() => []),
                altaAmbulatoriaService.getAll({ animalId }).catch(() => []),
                liberacaoQuarentenaService.getAll({ animalId }).catch(() => []),
                registroObitoService.getAll({ animalId }).catch(() => []),
            ])

            const items: ClinicoTimelineItem[] = []

            // Resolve o profissional a partir dos dados persistidos no registro (nunca do usuário logado).
            // Prioridade: responsavel > rf (matrícula) > fallback genérico
            const resolverProfissional = (responsavelField?: string, rf?: string): string => {
                if (responsavelField && responsavelField.trim() && responsavelField !== "string")
                    return responsavelField.trim()
                if (rf && rf.trim() && rf !== "string")
                    return rf.trim()
                return "Profissional Responsável"
            }

            if (Array.isArray(prescricoesRes) && prescricoesRes.length > 0) {
                prescricoesRes
                    .filter((p) => Number(p.animalId) === Number(animalId))
                    .forEach((p) => {
                        const desc = `Medicação: ${p.medicacaoNome} | Dose: ${p.volumeDose} | Via: ${p.viaAdministracao || "Oral"} | Doses: ${p.quantidadeDoses}${p.intervaloEntreDosesHoras ? ` (a cada ${p.intervaloEntreDosesHoras}h)` : ""}${p.observacao ? ` | Obs: ${p.observacao}` : ""}`
                        items.push({
                            key: `presc_${p.id}`,
                            id: p.id,
                            tipo: "PrescricaoMedicacao",
                            label: "Prescrição",
                            status: p.status,
                            dataHora: p.dataHoraInicio || p.dataCriacao || new Date().toISOString(),
                            dataCriacao: p.dataCriacao || p.dataHoraInicio || new Date().toISOString(),
                            responsavel: resolverProfissional(p.responsavel, p.rf),
                            detalhesText: desc,
                            borderColor: "border-l-4 border-l-teal-500",
                            badgeColor: "bg-teal-50 text-teal-700 border border-teal-200",
                            nodeBorder: "border-teal-500 text-teal-600",
                            markerStyle: categoriaMarkerStyles["PrescricaoMedicacao"],
                            count: 1,
                            isStandalone: true,
                            prescricaoRaw: p,
                            onClick: () => navigate(`/clinico/nova-prescricao?animalId=${animalId}`, { state: { prescricaoParaEditar: p } }),
                        })
                    })
            }

            if (Array.isArray(evolucoesRes) && evolucoesRes.length > 0) {
                evolucoesRes
                    .filter((e) => Number(e.animalId) === Number(animalId) && !e.atendimentoId)
                    .forEach((e) => {
                        items.push({
                            key: `evol_${e.id}`,
                            id: e.id,
                            tipo: "Evolucao",
                            label: "Evolução",
                            dataHora: e.dataHoraRegistro || e.dataCriacao || new Date().toISOString(),
                            dataCriacao: e.dataCriacao || e.dataHoraRegistro || new Date().toISOString(),
                            responsavel: resolverProfissional(e.responsavel, e.rf),
                            detalhesText: e.descricao,
                            evolucaoDesc: e.descricao,
                            borderColor: "border-l-4 border-l-purple-500",
                            badgeColor: "bg-purple-50 text-purple-700 border border-purple-200",
                            nodeBorder: "border-purple-500 text-purple-600",
                            markerStyle: categoriaMarkerStyles["Evolucao"],
                            isStandalone: true,
                            onClick: () => { setEvolucaoParaEditar(e); setEvolucaoModalOpen(true) },
                        })
                    })
            }

            if (Array.isArray(procedimentosRes) && procedimentosRes.length > 0) {
                procedimentosRes
                    .filter((p) => Number(p.animalId) === Number(animalId) && !p.atendimentoId)
                    .forEach((p) => {
                        const desc = p.tipoProcedimentoNome ? `${p.tipoProcedimentoNome}: ${p.descricao}` : p.descricao
                        items.push({
                            key: `proc_${p.id}`,
                            id: p.id,
                            tipo: "Procedimento",
                            label: "Procedimento",
                            dataHora: p.dataCriacao || new Date().toISOString(),
                            dataCriacao: p.dataCriacao || new Date().toISOString(),
                            responsavel: resolverProfissional(p.responsavel, p.rf),
                            detalhesText: desc,
                            procedimentoDesc: desc,
                            borderColor: "border-l-4 border-l-blue-500",
                            badgeColor: "bg-blue-50 text-blue-700 border border-blue-200",
                            nodeBorder: "border-blue-500 text-blue-600",
                            markerStyle: categoriaMarkerStyles["Procedimento"],
                            count: 1,
                            isStandalone: true,
                            onClick: () => { setProcedimentoParaEditar(p); setProcedimentoModalOpen(true) },
                        })
                    })
            }

            if (Array.isArray(consultasRes) && consultasRes.length > 0) {
                consultasRes
                    .filter((c) => Number(c.animalId) === Number(animalId))
                    .forEach((c) => {
                        const detalhes = [c.anamnese, c.exameFisico, c.suspeitaDiagnostica].filter(Boolean).join(" | ")
                        items.push({
                            key: `consulta_${c.id}`,
                            id: c.id,
                            tipo: "Consulta",
                            label: "Consulta",
                            dataHora: c.dataHoraConsulta || c.dataCriacao || new Date().toISOString(),
                            dataCriacao: c.dataCriacao || c.dataHoraConsulta || new Date().toISOString(),
                            responsavel: resolverProfissional(c.responsavel, c.rf),
                            detalhesText: detalhes,
                            anamnese: c.anamnese || undefined,
                            borderColor: "border-l-4 border-l-green-500",
                            badgeColor: "bg-green-50 text-green-700 border border-green-200",
                            nodeBorder: "border-green-500 text-green-600",
                            markerStyle: categoriaMarkerStyles["Consulta"],
                            isStandalone: true,
                            onClick: () => { setConsultaParaEditar(c); setConsultaModalOpen(true) },
                        })
                    })
            }

            if (Array.isArray(anexosRes) && anexosRes.length > 0) {
                anexosRes
                    .filter((a) => Number(a.animalId) === Number(animalId))
                    .forEach((a) => {
                        const detalhes = [a.nomeArquivoAnexo, a.descricao].filter(Boolean).join(" | ")
                        items.push({
                            key: `anexo_${a.id}`,
                            id: a.id,
                            tipo: "Anexo",
                            label: "Anexo",
                            dataHora: a.dataCriacao || new Date().toISOString(),
                            dataCriacao: a.dataCriacao || new Date().toISOString(),
                            responsavel: resolverProfissional(a.responsavel, a.rf),
                            detalhesText: detalhes || "Documento anexado",
                            borderColor: "border-l-4 border-l-slate-500",
                            badgeColor: "bg-slate-100 text-slate-700 border border-slate-200",
                            nodeBorder: "border-slate-400 text-slate-600",
                            markerStyle: categoriaMarkerStyles["Anexo"],
                            isStandalone: true,
                            onClick: () => { setAnexoParaEditar(a); setAnexoModalOpen(true) },
                        })
                    })
            }

            if (Array.isArray(solicitacoesExameRes) && solicitacoesExameRes.length > 0) {
                const filteredExames = solicitacoesExameRes.filter((s) => Number(s.animalId) === Number(animalId))

                const grupos: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[][] = []
                if (filteredExames.length > 0) {
                    const sorted = [...filteredExames].sort((a, b) => {
                        const da = a.dataCriacao ? new Date(a.dataCriacao).getTime() : 0
                        const db = b.dataCriacao ? new Date(b.dataCriacao).getTime() : 0
                        if (da !== db) return da - db
                        return a.id - b.id
                    })

                    let currentGroup: import("@/services/SolicitacaoExameService").SolicitacaoExameVm[] = [sorted[0]]
                    for (let i = 1; i < sorted.length; i++) {
                        const curr = sorted[i]
                        const prev = currentGroup[0]
                        const currTime = curr.dataCriacao ? new Date(curr.dataCriacao).getTime() : 0
                        const prevTime = prev.dataCriacao ? new Date(prev.dataCriacao).getTime() : 0
                        const timeDiff = currTime && prevTime ? Math.abs(currTime - prevTime) : Number.MAX_SAFE_INTEGER
                        const sameClinico =
                            (curr.sinaisClinicos || "") === (prev.sinaisClinicos || "") &&
                            (curr.suspeitaClinica || "") === (prev.suspeitaClinica || "") &&
                            (curr.regiaoAnatomica || "") === (prev.regiaoAnatomica || "") &&
                            (curr.rf || "") === (prev.rf || "")

                        if (currTime && prevTime && timeDiff < 120000 && sameClinico) {
                            currentGroup.push(curr)
                        } else if (!curr.dataCriacao || !prev.dataCriacao) {
                            const idDiff = Math.abs(curr.id - prev.id)
                            if (sameClinico && idDiff <= 5 && currentGroup.length < 5) {
                                currentGroup.push(curr)
                            } else {
                                grupos.push(currentGroup)
                                currentGroup = [curr]
                            }
                        } else {
                            grupos.push(currentGroup)
                            currentGroup = [curr]
                        }
                    }
                    grupos.push(currentGroup)
                }

                grupos.forEach((group) => {
                    const tiposLabels = group.map((s) => {
                        const label = typeof s.tipoExame === "number" ? (tipoExameLabels[s.tipoExame as number] ?? String(s.tipoExame)) : String(s.tipoExame)
                        if ((s.tipoExame === 4 || s.tipoExame === "Outros" || s.tipoExame === "4") && s.observacao) {
                            const desc = s.observacao.includes("|||OBS|||") ? s.observacao.split("|||OBS|||")[0] : s.observacao
                            return `${label}: ${desc}`
                        }
                        return label
                    })
                    const primeiro = group[0]
                    const detalhesPartes: string[] = []
                    detalhesPartes.push(`Solicitação de exame: ${tiposLabels.join(", ")}`)
                    if (primeiro.sinaisClinicos) detalhesPartes.push(`Sinais: ${primeiro.sinaisClinicos}`)
                    if (primeiro.suspeitaClinica) detalhesPartes.push(`Suspeita: ${primeiro.suspeitaClinica}`)
                    if (primeiro.regiaoAnatomica && primeiro.regiaoAnatomica !== "-") detalhesPartes.push(`Região: ${primeiro.regiaoAnatomica}`)
                    const obsLimpa = (() => {
                        if (!primeiro.observacao) return ""
                        if (primeiro.observacao.includes("|||OBS|||")) return primeiro.observacao.split("|||OBS|||")[1] || ""
                        const isOutrosNoGrupo = group.some((g) => g.tipoExame === 4 || g.tipoExame === "Outros" || g.tipoExame === "4")
                        if (isOutrosNoGrupo && tiposLabels.some((t) => t.startsWith("Outros"))) {
                            return ""
                        }
                        return primeiro.observacao
                    })()
                    if (obsLimpa) detalhesPartes.push(`Obs: ${obsLimpa}`)

                    const detalhes = detalhesPartes.join(" | ")
                    const dataHora = primeiro.dataCriacao ? new Date(primeiro.dataCriacao).toISOString() : new Date().toISOString()
                    const responsavel = resolverProfissional(primeiro.responsavel, primeiro.rf)
                    const label = "Exame"
                    const groupKey = group.map((g) => g.id).join("_")

                    items.push({
                        key: `solExame_group_${groupKey}`,
                        id: primeiro.id,
                        tipo: "Exame",
                        label,
                        dataHora,
                        dataCriacao: dataHora,
                        responsavel,
                        detalhesText: detalhes,
                        borderColor: "border-l-4 border-l-amber-400",
                        badgeColor: "bg-amber-50 text-amber-700 border border-amber-200",
                        nodeBorder: "border-amber-400 text-amber-500",
                        markerStyle: categoriaMarkerStyles["Exame"],
                        count: group.length,
                        isStandalone: true,
                        exameGroup: group,
                        onClick: () => handleOpenExameDocumento(group),
                    })
                })
            }

            if (altaRes) {
                const altas = Array.isArray(altaRes) ? altaRes : [altaRes]
                altas.forEach((a) => {
                    if (!a || !a.id) return
                    const detalhes = [
                        a.observacoesClinicas || "Durante o acompanhamento clínico, o animal apresentou resposta satisfatória com o protocolo terapêutico administrado com melhora do quadro clínico",
                        a.procedimentosMedicacoes ? `Procedimentos/Medicações: ${a.procedimentosMedicacoes}` : null,
                        a.dataEntradaAmbulatorio ? `Entrada: ${new Date(a.dataEntradaAmbulatorio).toLocaleDateString("pt-BR")}` : null,
                        a.dataAltaClinica ? `Alta: ${new Date(a.dataAltaClinica).toLocaleDateString("pt-BR")}` : null,
                    ].filter(Boolean).join(" | ")

                    const dataEvt = a.dataAltaClinica || a.dataEntradaAmbulatorio || (a as any).dataCriacao || new Date().toISOString()
                    const dataReg = (a as any).dataCriacao || a.dataAltaClinica || a.dataEntradaAmbulatorio || new Date().toISOString()

                    items.push({
                        key: `alta_${a.id}`,
                        id: a.id,
                        tipo: "AltaAmbulatorial",
                        label: "Alta",
                        dataHora: dataEvt,
                        dataCriacao: dataReg,
                        responsavel: resolverProfissional((a as any).responsavel, (a as any).rf),
                        detalhesText: detalhes,
                        borderColor: "border-l-4 border-l-red-500",
                        badgeColor: "bg-red-50 text-red-600 border border-red-200",
                        nodeBorder: "border-red-500 text-red-600",
                        markerStyle: categoriaMarkerStyles["AltaAmbulatorial"],
                        isStandalone: true,
                        onClick: () => handleOpenDocumento("AltaAmbulatorial", a.id),
                    })
                })
            }

            if (registroObitoRes) {
                const obitos = Array.isArray(registroObitoRes) ? registroObitoRes : [registroObitoRes];
                obitos.forEach((o) => {
                    if (!o || !o.id) return;
                    const detalhes = [
                        `Data do Óbito: ${o.dataObito ? new Date(o.dataObito).toLocaleDateString("pt-BR") : "N/D"}`,
                        `Necropsia: ${o.houveNecropsia ? "Sim" : "Não"}`,
                        o.observacoes ? `Obs: ${o.observacoes}` : null,
                    ].filter(Boolean).join(" | ");

                    const dataEvt = o.dataObito || o.dataCriacao || new Date().toISOString();
                    const dataReg = o.dataCriacao || o.dataObito || new Date().toISOString();

                    items.push({
                        key: `obito_${o.id}`,
                        id: o.id,
                        tipo: "RegistroObito",
                        label: "Óbito",
                        dataHora: dataEvt,
                        dataCriacao: dataReg,
                        responsavel: resolverProfissional(undefined, o.rf),
                        detalhesText: detalhes,
                        borderColor: "border-l-4 border-l-red-600",
                        badgeColor: "bg-red-100 text-red-800 border border-red-300",
                        nodeBorder: "border-red-600 text-red-700",
                        markerStyle: categoriaMarkerStyles["RegistroObito"],
                        isStandalone: true,
                        onClick: () => { setRegistroObitoParaEditar(o); setRegistroObitoModalOpen(true); },
                    });
                });
            }

            if (quarentenaRes) {
                const quarentenas = Array.isArray(quarentenaRes) ? quarentenaRes : [quarentenaRes]
                quarentenas.forEach((q) => {
                    if (!q || !q.id) return
                    const detalhes = [
                        (q as any).observacao || "Liberação de quarentena realizada após avaliação clínica favorável",
                        q.dataEntradaQuarentena ? `Entrada: ${new Date(q.dataEntradaQuarentena).toLocaleDateString("pt-BR")}` : null,
                        q.dataSaidaQuarentena ? `Saída: ${new Date(q.dataSaidaQuarentena).toLocaleDateString("pt-BR")}` : null,
                    ].filter(Boolean).join(" | ")

                    const dataEvt = q.dataSaidaQuarentena || q.dataEntradaQuarentena || (q as any).dataCriacao || new Date().toISOString()
                    const dataReg = (q as any).dataCriacao || q.dataSaidaQuarentena || q.dataEntradaQuarentena || new Date().toISOString()

                    items.push({
                        key: `quarentena_${q.id}`,
                        id: q.id,
                        tipo: "LiberacaoQuarentena",
                        label: "Liberação",
                        dataHora: dataEvt,
                        dataCriacao: dataReg,
                        responsavel: resolverProfissional((q as any).responsavel, (q as any).rf),
                        detalhesText: detalhes,
                        borderColor: "border-l-4 border-l-red-500",
                        badgeColor: "bg-red-50 text-red-600 border border-red-200",
                        nodeBorder: "border-red-500 text-red-600",
                        markerStyle: categoriaMarkerStyles["LiberacaoQuarentena"],
                        isStandalone: true,
                        onClick: () => handleOpenDocumento("LiberacaoQuarentena", q.id),
                    })
                })
            }

            setTimelineItems(items)
            setPrescricoesRefreshKey((k) => k + 1)
        } catch (error) {
            console.error("Erro ao carregar histórico clínico:", error)
            toast.error("Erro ao carregar histórico clínico")
        } finally {
            setLoading(false)
        }
    }, [animalId, navigate, handleOpenExameDocumento, handleOpenDocumento])

    useEffect(() => {
        setPage(1)
    }, [search, pageSize, selectedTipos, selectedExameStatus, dateRange])

    useEffect(() => {
        fetchDadosClinicos()
    }, [fetchDadosClinicos])

    const handleRefreshComInstalacao = useCallback(async () => {
        await fetchDadosClinicos()
        await onInstalacaoChanged?.()
    }, [fetchDadosClinicos, onInstalacaoChanged])

    const tiposUnicos = useMemo(() => {
        const tipos = new Set<string>()
        timelineItems.forEach((item) => {
            if (item.tipo) tipos.add(item.tipo)
        })
        return Array.from(tipos)
    }, [timelineItems])

    const filteredItems = useMemo(() => {
        const filtered = timelineItems.filter((item) => {
            if (selectedTipos.length > 0 && !selectedTipos.includes(item.tipo)) {
                return false
            }

            if (selectedExameStatus.length > 0 && item.tipo === "Exame" && item.exameGroup) {
                const st = getGrupoStatus(item.exameGroup)
                if (!selectedExameStatus.includes(st)) return false
            }

            if (dateRange?.from) {
                const from = new Date(dateRange.from)
                from.setHours(0, 0, 0, 0)
                const itemDate = item.dataHora ? new Date(item.dataHora) : null
                if (!itemDate || itemDate < from) return false

                if (dateRange.to) {
                    const to = new Date(dateRange.to)
                    to.setHours(23, 59, 59, 999)
                    if (itemDate > to) return false
                }
            }

            const term = normalizeStr(search)
            if (!term) return true
            const statusTerm = item.tipo === "Exame" && item.exameGroup ? normalizeStr(getGrupoStatus(item.exameGroup)) : ""
            return (
                normalizeStr(item.detalhesText).includes(term) ||
                normalizeStr(item.label).includes(term) ||
                normalizeStr(item.responsavel).includes(term) ||
                statusTerm.includes(term)
            )
        })

        return [...filtered].sort((a, b) => {
            let valA: any
            let valB: any
            if (sortField === "dataHoraRegistro") {
                const dateA = a.dataHora ? new Date(a.dataHora) : null
                const dateB = b.dataHora ? new Date(b.dataHora) : null
                const dayA = dateA ? new Date(dateA.getFullYear(), dateA.getMonth(), dateA.getDate()).getTime() : 0
                const dayB = dateB ? new Date(dateB.getFullYear(), dateB.getMonth(), dateB.getDate()).getTime() : 0

                if (dayA !== dayB) {
                    return sortDirection === "asc" ? dayA - dayB : dayB - dayA
                }

                const timeRegA = a.dataCriacao ? new Date(a.dataCriacao).getTime() : (a.dataHora ? new Date(a.dataHora).getTime() : 0)
                const timeRegB = b.dataCriacao ? new Date(b.dataCriacao).getTime() : (b.dataHora ? new Date(b.dataHora).getTime() : 0)
                if (timeRegA !== timeRegB) {
                    return sortDirection === "asc" ? timeRegA - timeRegB : timeRegB - timeRegA
                }

                if (a.id !== b.id) return sortDirection === "asc" ? a.id - b.id : b.id - a.id
                return 0
            } else {
                valA = normalizeStr(a.label)
                valB = normalizeStr(b.label)
            }
            if (valA < valB) return sortDirection === "asc" ? -1 : 1
            if (valA > valB) return sortDirection === "asc" ? 1 : -1
            return 0
        })
    }, [timelineItems, selectedTipos, selectedExameStatus, dateRange, search, sortField, sortDirection, getGrupoStatus])

    const totalItems = filteredItems.length
    const paginatedItems = useMemo(() => {
        const start = (page - 1) * pageSize
        return filteredItems.slice(start, start + pageSize)
    }, [filteredItems, page, pageSize])

    const headerActionsContent = (
        <BarraDeBuscaEFiltro
            search={search}
            onSearchChange={setSearch}
            placeholder="Buscar no histórico clínico..."
            dateRange={dateRange}
            onDateRangeChange={setDateRange}
            filterSections={[
                {
                    key: "sort",
                    label: "Ordenar por",
                    type: "radio",
                    options: [
                        { value: "dataHoraRegistro:desc", label: "Data (mais recente)" },
                        { value: "dataHoraRegistro:asc", label: "Data (mais antiga)" },
                        { value: "tipo:asc", label: "Tipo (A → Z)" },
                        { value: "tipo:desc", label: "Tipo (Z → A)" },
                    ],
                    selectedValue: `${sortField}:${sortDirection}`,
                    onValueChange: (val) => {
                        const [field, dir] = val.split(":")
                        setSortField(field)
                        setSortDirection(dir as "asc" | "desc")
                    },
                },
                {
                    key: "tipo",
                    label: "Filtrar por Categoria",
                    type: "checkbox",
                    options: tiposUnicos.map((tipo) => ({
                        value: tipo,
                        label: tipoAtendimentoLabels[tipo] ?? tipo,
                    })),
                    selected: selectedTipos,
                    onChange: setSelectedTipos,
                },
            ]}
        />
    )

    return (
        <div className="space-y-6">
            {headerContainer && createPortal(headerActionsContent, headerContainer)}

            <ClinicoTimelineList
                loading={loading}
                paginatedItems={paginatedItems}
                totalItems={totalItems}
                search={search}
                dateRange={dateRange}
                selectedTipos={selectedTipos}
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                setPageSize={setPageSize}
                getGrupoStatus={getGrupoStatus}
                handleOpenDocumento={handleOpenDocumento}
                handleEditDocumento={handleEditDocumento}
                handleOpenExameDocumento={handleOpenExameDocumento}
                setExameSuspensaoModal={setExameSuspensaoModal}
                onOpenAtendimento={() => { if (situacaoAnimal !== undefined && situacaoAnimal !== 1) { toast.warning("Ações clínicas permitidas apenas para animais VIVOS."); return; } setAtendimentoSelectorOpen(true) }}
                onOpenPrescricao={() => { if (situacaoAnimal !== undefined && situacaoAnimal !== 1) { toast.warning("Ações clínicas permitidas apenas para animais VIVOS."); return; } setPrescricaoModalOpen(true) }}
                onOpenExame={() => { if (situacaoAnimal !== undefined && situacaoAnimal !== 1) { toast.warning("Ações clínicas permitidas apenas para animais VIVOS."); return; } setSolicitacaoExameModalOpen(true) }}
                onOpenAnexo={() => { if (situacaoAnimal !== undefined && situacaoAnimal !== 1) { toast.warning("Ações clínicas permitidas apenas para animais VIVOS."); return; } setAnexoModalOpen(true) }}
                onOpenEvolucao={() => { if (situacaoAnimal !== undefined && situacaoAnimal !== 1) { toast.warning("Ações clínicas permitidas apenas para animais VIVOS."); return; } setEvolucaoModalOpen(true) }}
                onOpenProcedimento={() => { if (situacaoAnimal !== undefined && situacaoAnimal !== 1) { toast.warning("Ações clínicas permitidas apenas para animais VIVOS."); return; } setProcedimentoModalOpen(true) }}
                animalId={animalId}
                prescricoesRefreshKey={prescricoesRefreshKey}
            />

            {docModal?.isOpen && (                <DocumentoClinicoModal
                    isOpen={docModal.isOpen}
                    onClose={() => setDocModal(null)}
                    tipoModal={docModal.tipo}
                    atendimentoId={docModal.atendimentoId}
                    animalId={animalId}
                    solicitacoesGroup={docModal.solicitacoesGroup}
                    onEdit={handleEditDocumento}
                    onSuspender={(group) => {
                        setDocModal(null)
                        setTimeout(() => setExameSuspensaoModal({ group }), 150)
                    }}
                />
            )}

            <ConsultaFormModal
                isOpen={consultaModalOpen}
                onClose={() => { setConsultaModalOpen(false); setConsultaParaEditar(null) }}
                animalId={animalId}
                editingConsulta={consultaParaEditar}
                onSaved={fetchDadosClinicos}
            />

            <AltaAmbulatorialModal
                isOpen={altaModalOpen}
                onClose={() => { setAltaModalOpen(false); setAltaParaEditar(null) }}
                animalId={animalId}
                altaParaEditar={altaParaEditar}
                onSaved={handleRefreshComInstalacao}
            />

            <LiberacaoQuarentenaModal
                isOpen={quarentenaModalOpen}
                onClose={() => { setQuarentenaModalOpen(false); setQuarentenaParaEditar(null) }}
                animalId={animalId}
                quarentenaParaEditar={quarentenaParaEditar}
                onSaved={handleRefreshComInstalacao}
            />

            <SolicitacaoExameModal
                isOpen={solicitacaoExameModalOpen}
                onClose={() => setSolicitacaoExameModalOpen(false)}
                animalId={animalId}
                onSaved={fetchDadosClinicos}
            />

            <EvolucaoModal
                isOpen={evolucaoModalOpen}
                onClose={() => { setEvolucaoModalOpen(false); setEvolucaoParaEditar(null); }}
                evolucaoEdit={evolucaoParaEditar}
                animalId={animalId}
                onSaved={fetchDadosClinicos}
            />

            {procedimentoModalOpen && (
                <ProcedimentoModal
                    isOpen={procedimentoModalOpen}
                    onClose={() => { setProcedimentoModalOpen(false); setProcedimentoParaEditar(null) }}
                    animalId={animalId}
                    procedimentoEdit={procedimentoParaEditar}
                    onSaved={fetchDadosClinicos}
                />
            )}

            <PrescricaoMedicacaoModal
                isOpen={prescricaoModalOpen}
                onClose={() => setPrescricaoModalOpen(false)}
                animalId={animalId}
                onSaved={fetchDadosClinicos}
            />

            {anexoModalOpen && (
                <AnexoModal
                    isOpen={anexoModalOpen}
                    onClose={() => { setAnexoModalOpen(false); setAnexoParaEditar(null) }}
                    animalId={animalId}
                    anexoEdit={anexoParaEditar}
                    onSaved={fetchDadosClinicos}
                />
            )}

            <ClinicoExameSuspensaoModal
                exameSuspensaoModal={exameSuspensaoModal}
                onClose={() => setExameSuspensaoModal(null)}
                onSaved={fetchDadosClinicos}
            />

            <RegistroObitoModal
                isOpen={registroObitoModalOpen}
                onClose={() => { setRegistroObitoModalOpen(false); setRegistroObitoParaEditar(null); }}
                animalId={animalId}
                registroObitoParaEditar={registroObitoParaEditar}
                onSaved={handleRefreshComInstalacao}
            />

            <ClinicoAtendimentoSelectorModal
                isOpen={atendimentoSelectorOpen}
                onClose={() => setAtendimentoSelectorOpen(false)}
                tipoAtendimentoSelecionado={tipoAtendimentoSelecionado}
                setTipoAtendimentoSelecionado={setTipoAtendimentoSelecionado}
                onConfirm={handleAtendimentoTipoConfirm}
            />
        </div>
    )
}
