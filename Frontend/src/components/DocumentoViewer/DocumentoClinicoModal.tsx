import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { usePermissions } from "@/contexts/PermissionsContext"
import { X, ExternalLink, FileText, Loader2, Pause } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DocumentoViewer } from "@/components/DocumentoViewer"
import { TipoDocumento } from "@/services/ModeloDocumentoService"
import { getAtendimento, type AtendimentoDetailVm } from "@/services/AtendimentoService"
import { altaAmbulatoriaService, type AltaAmbulatoriaDetailVm } from "@/services/AltaAmbulatoriaService"
import { liberacaoQuarentenaService, type LiberacaoQuarentenaDetailVm } from "@/services/LiberacaoQuarentenaService"
import { animalService, type AnimalResponse } from "@/services/animalService"
import { instalacaoBioterioService, type InstalacaoBioterio } from "@/services/InstalacaoBioterioService"
import { solicitacaoExameService, type SolicitacaoExameVm } from "@/services/SolicitacaoExameService"
import { toast } from "sonner"
import { formatIsoToPtBr } from "@/lib/date"

export type TipoDocumentoClinicoModal =
    | "AltaAmbulatorial"
    | "LiberacaoQuarentena"
    | "SolicitacaoExame"

interface DocumentoClinicoModalProps {
    isOpen: boolean
    onClose: () => void
    tipoModal: TipoDocumentoClinicoModal | null
    atendimentoId: number
    animalId: number
    initialAnimal?: AnimalResponse | null
    solicitacoesGroup?: SolicitacaoExameVm[]
    onSuspender?: (group: SolicitacaoExameVm[]) => void
    onEdit?: (tipoModal: TipoDocumentoClinicoModal, id: number) => void
}

const tipoLabels: Record<TipoDocumentoClinicoModal, { titulo: string; tipoDoc: TipoDocumento; targetTab: string }> = {
    AltaAmbulatorial: {
        titulo: "Alta Ambulatorial",
        tipoDoc: TipoDocumento.AltaAmbulatorial,
        targetTab: "avaliacao",
    },
    LiberacaoQuarentena: {
        titulo: "Liberação de Quarentena",
        tipoDoc: TipoDocumento.LiberacaoQuarentena,
        targetTab: "avaliacao",
    },
    SolicitacaoExame: {
        titulo: "Solicitação de Exame",
        tipoDoc: TipoDocumento.SolicitacaoExame,
        targetTab: "exames",
    },
}

const parseTipoExame = (rawTipo: any): number | null => {
    if (typeof rawTipo === "number") return rawTipo
    if (rawTipo === "HemogramaCompleto" || rawTipo === "1") return 1
    if (rawTipo === "Ultrassonografia" || rawTipo === "2") return 2
    if (rawTipo === "Radiografia" || rawTipo === "3") return 3
    if (rawTipo === "Outros" || rawTipo === "4") return 4
    return null
}

const getGeneroDisplay = (genero: any): string => {
    if (genero === 1 || genero === "1" || genero === "Macho") return "Macho"
    if (genero === 2 || genero === "2" || genero === "Femea" || genero === "Fêmea") return "Fêmea"
    if (genero === 3 || genero === "3") return "Não Identificado"
    return typeof genero === "string" ? genero : ""
}

const getFaseDeVidaDisplay = (fase: any): string => {
    if (fase === 1 || fase === "1" || fase === "Filhote") return "Filhote"
    if (fase === 2 || fase === "2" || fase === "Jovem") return "Jovem"
    if (fase === 3 || fase === "3" || fase === "Adulto") return "Adulto"
    return typeof fase === "string" ? fase : ""
}

export function DocumentoClinicoModal({
    isOpen,
    onClose,
    tipoModal,
    atendimentoId,
    animalId,
    initialAnimal,
    solicitacoesGroup,
    onSuspender,
    onEdit,
}: DocumentoClinicoModalProps) {
    const { hasPermission } = usePermissions()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [dadosDocumento, setDadosDocumento] = useState<Record<string, any> | null>(null)
    const [atendimento, setAtendimento] = useState<AtendimentoDetailVm | null>(null)

    useEffect(() => {
        if (!isOpen || !tipoModal || !atendimentoId) {
            setDadosDocumento(null)
            setAtendimento(null)
            return
        }

        let isMounted = true

        const buildExamePayload = (solicitacoes: any[], baseDados: Record<string, any>) => {
            const tipos: number[] = []
            let sinaisClinicos = ""
            let suspeitaClinica = ""
            let regiaoAnatomica = ""
            let observacao = ""
            let outrosExame = ""

            solicitacoes.forEach((ex: any) => {
                const parsed = parseTipoExame(ex.tipoExame)
                if (parsed) {
                    tipos.push(parsed)
                    if (parsed === 4 && ex.observacao) {
                        if (ex.observacao.includes("|||OBS|||")) {
                            const parts = ex.observacao.split("|||OBS|||")
                            outrosExame = parts[0]
                            if (!observacao) observacao = parts[1]
                        } else {
                            outrosExame = ex.observacao
                        }
                    }
                }
                if (ex.sinaisClinicos && !sinaisClinicos) sinaisClinicos = ex.sinaisClinicos
                if (ex.suspeitaClinica && !suspeitaClinica) suspeitaClinica = ex.suspeitaClinica
                if (ex.regiaoAnatomica && !regiaoAnatomica) regiaoAnatomica = ex.regiaoAnatomica
                if (ex.observacao && !observacao && parsed !== 4) observacao = ex.observacao
            })

            const exameData = {
                tiposExame: tipos,
                outrosExame,
                sinaisClinicos,
                suspeitaClinica,
                regiaoAnatomica,
                observacao,
            }

            return {
                ...baseDados,
                tiposExame: exameData.tiposExame || [],
                outros: exameData.outrosExame || "",
                outrosExame: exameData.outrosExame || "",
                INPUT_OUTROS: exameData.outrosExame || "",
                INPUT_Outros: exameData.outrosExame || "",
                INPUT_SINAIS_CLINICOS: exameData.sinaisClinicos || "",
                INPUT_SinaisClinicos: exameData.sinaisClinicos || "",
                INPUT_SUSPEITA_CLINICA: exameData.suspeitaClinica || "",
                INPUT_SuspeitaClinica: exameData.suspeitaClinica || "",
                INPUT_REGIAO_ANATOMICA: exameData.regiaoAnatomica || "",
                INPUT_RegiaoAnatomica: exameData.regiaoAnatomica || "",
                INPUT_OBSERVACOES_ADICIONAIS: exameData.observacao || "",
                INPUT_OBSERVACAO: exameData.observacao || "",
                INPUT_Observacao: exameData.observacao || "",
                Exame: exameData,
            }
        }

        const carregarDados = async () => {
            try {
                setLoading(true)

                // Caminho otimizado para Solicitação de Exame agrupada (sem Atendimento)
                if (tipoModal === "SolicitacaoExame" && solicitacoesGroup && solicitacoesGroup.length > 0) {
                    const [animalRes, instalacoesRes] = await Promise.all([
                        initialAnimal ? Promise.resolve(initialAnimal) : animalService.getById(animalId).catch(() => null),
                        instalacaoBioterioService.getAll().catch(() => [] as InstalacaoBioterio[]),
                    ])
                    if (!isMounted) return
                    const instalacoes = Array.isArray(instalacoesRes) ? instalacoesRes : []
                    const currentAnimal = animalRes
                    const primeira = solicitacoesGroup[0] as any
                    const instalacaoAtualNome =
                        currentAnimal?.instalacaoBioterio?.nome || (currentAnimal as any)?.instalacaoBioterioNome || ""
                    const responsavel = (primeira?.rf && !/^\d+$/.test(String(primeira.rf).trim()) ? primeira.rf : "") || currentAnimal?.numeroRegistro || "Responsável Técnico"
                    const dataRef = primeira?.dataCriacao ? new Date(primeira.dataCriacao) : new Date()
                    const dataFormatada = dataRef.toLocaleDateString("pt-BR")
                    const dataHoraFormatada = dataRef.toLocaleString("pt-BR")

                    const baseDados: Record<string, any> = {
                        FUN_DATA_AGORA: dataFormatada,
                        FUN_DATA_HORA_AGORA: dataHoraFormatada,
                        FUN_NOME_COMPLETO_USUARIO: responsavel,
                        FUN_NOME_RESPONSAVEL: responsavel,
                        FUN_NOME_RESPOSAVEL: responsavel,
                        FUN_NUMERO_REGISTRO: currentAnimal?.numeroRegistro || "",
                        FUN_NumeroRegistro: currentAnimal?.numeroRegistro || "",
                        FUN_NOME_POPULAR: currentAnimal?.nomePopular || "",
                        FUN_NomePopular: currentAnimal?.nomePopular || "",
                        FUN_ESPECIE: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                        FUN_Especie: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                        FUN_GENERO: getGeneroDisplay(currentAnimal?.genero),
                        FUN_FASE_VIDA: getFaseDeVidaDisplay((currentAnimal as any)?.faseDeVida),
                        FUN_LOCAL_ORIGEM: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                        FUN_LocalOrigem: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                        FUN_INSTALACAO_ATUAL: instalacaoAtualNome || (instalacoes[0]?.nome ?? ""),
                        FUN_DIAGNOSTICO: "",
                        FUN_TRATAMENTO: "",
                        Clinica: { DataAtual: dataFormatada, Responsavel: responsavel },
                        Animal: currentAnimal || {},
                    }

                    const payloadExame = buildExamePayload(solicitacoesGroup, baseDados)
                    if (isMounted) {
                        setDadosDocumento(payloadExame)
                        setAtendimento(null)
                    }
                    return
                }

                // Caminho otimizado para Alta Ambulatorial (sem Atendimento)
                if (tipoModal === "AltaAmbulatorial") {
                    const [animalRes, instalacoesRes, altaRes] = await Promise.all([
                        initialAnimal ? Promise.resolve(initialAnimal) : animalService.getById(animalId).catch(() => null),
                        instalacaoBioterioService.getAll().catch(() => [] as InstalacaoBioterio[]),
                        (atendimentoId ? altaAmbulatoriaService.getById(atendimentoId).catch(() => null) : null) ||
                            altaAmbulatoriaService.getByAnimalId(animalId).catch(() => null),
                    ])

                    const currentAnimal = animalRes
                    const instalacoes = Array.isArray(instalacoesRes) ? instalacoesRes : []
                    const instalacaoRetornoNome =
                        instalacoes.find((i) => i.id === altaRes?.instalacaoBioterioRetornoId)?.nome || ""

                    const dataRefIso = altaRes?.dataAltaClinica || null
                    const dataFormatada = dataRefIso ? formatIsoToPtBr(dataRefIso) : new Date().toLocaleDateString("pt-BR")
                    const dataHoraFormatada = dataRefIso ? `${formatIsoToPtBr(dataRefIso)} ${new Date(dataRefIso.length === 10 ? `${dataRefIso}T00:00:00` : dataRefIso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : new Date().toLocaleString("pt-BR")
                    const responsavel = (altaRes as any)?.rf || "Responsável Técnico"

                    const payloadAlta = {
                        FUN_DATA_AGORA: dataFormatada,
                        FUN_DATA_HORA_AGORA: dataHoraFormatada,
                        FUN_NOME_COMPLETO_USUARIO: responsavel,
                        FUN_NOME_RESPONSAVEL: responsavel,
                        FUN_NOME_RESPOSAVEL: responsavel,
                        FUN_NUMERO_REGISTRO: currentAnimal?.numeroRegistro || "",
                        FUN_NumeroRegistro: currentAnimal?.numeroRegistro || "",
                        FUN_NOME_POPULAR: currentAnimal?.nomePopular || "",
                        FUN_NomePopular: currentAnimal?.nomePopular || "",
                        FUN_ESPECIE: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                        FUN_Especie: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                        FUN_GENERO: getGeneroDisplay(currentAnimal?.genero),
                        FUN_FASE_VIDA: getFaseDeVidaDisplay((currentAnimal as any)?.faseDeVida),
                        FUN_LOCAL_ORIGEM: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                        FUN_LocalOrigem: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                        FUN_INSTALACAO_ATUAL: currentAnimal?.instalacaoBioterio?.nome || (instalacoes[0]?.nome ?? ""),
                        FUN_DIAGNOSTICO: "",
                        FUN_TRATAMENTO: "",
                        Clinica: { DataAtual: dataFormatada, Responsavel: responsavel },
                        Animal: currentAnimal || {},
                        INPUT_DATA_ENTRADA_AMBULATORIO: formatIsoToPtBr(altaRes?.dataEntradaAmbulatorio),
                        INPUT_DATA_CLINICA: formatIsoToPtBr(altaRes?.dataAltaClinica),
                        INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO:
                            altaRes?.procedimentosMedicacoes || "",
                        INPUT_OBS_CLINICAS_ALTA: altaRes?.observacoesClinicas || "",
                        INPUT_INSTALACAO_RETORNO: instalacaoRetornoNome,
                        Alta: altaRes || {},
                    }

                    if (isMounted) {
                        setDadosDocumento(payloadAlta)
                        setAtendimento(null)
                    }
                    return
                }

                // Caminho otimizado para Liberação de Quarentena (sem Atendimento)
                if (tipoModal === "LiberacaoQuarentena") {
                    const [animalRes, instalacoesRes, quarentenaRes] = await Promise.all([
                        initialAnimal ? Promise.resolve(initialAnimal) : animalService.getById(animalId).catch(() => null),
                        instalacaoBioterioService.getAll().catch(() => [] as InstalacaoBioterio[]),
                        (atendimentoId ? liberacaoQuarentenaService.getById(atendimentoId).catch(() => null) : null) || liberacaoQuarentenaService.getByAnimalId(animalId).catch(() => null),
                    ])

                    const currentAnimal = animalRes
                    const instalacoes = Array.isArray(instalacoesRes) ? instalacoesRes : []
                    const instalacaoDestinoNome =
                        instalacoes.find((i) => i.id === quarentenaRes?.instalacaoBioterioId)?.nome || ""

                    const dataQuarentenaIso = quarentenaRes?.dataSaidaQuarentena || quarentenaRes?.dataEntradaQuarentena || null
                    const dataFormatada = dataQuarentenaIso ? formatIsoToPtBr(dataQuarentenaIso) : new Date().toLocaleDateString("pt-BR")
                    const dataHoraFormatada = dataQuarentenaIso ? `${formatIsoToPtBr(dataQuarentenaIso)} ${new Date(dataQuarentenaIso.length === 10 ? `${dataQuarentenaIso}T00:00:00` : dataQuarentenaIso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}` : new Date().toLocaleString("pt-BR")
                    const responsavel = (quarentenaRes as any)?.rf || "Responsável Técnico"

                    const payloadQuarentena = {
                        FUN_DATA_AGORA: dataFormatada,
                        FUN_DATA_HORA_AGORA: dataHoraFormatada,
                        FUN_NOME_COMPLETO_USUARIO: responsavel,
                        FUN_NOME_RESPONSAVEL: responsavel,
                        FUN_NOME_RESPOSAVEL: responsavel,
                        FUN_NUMERO_REGISTRO: currentAnimal?.numeroRegistro || "",
                        FUN_NumeroRegistro: currentAnimal?.numeroRegistro || "",
                        FUN_NOME_POPULAR: currentAnimal?.nomePopular || "",
                        FUN_NomePopular: currentAnimal?.nomePopular || "",
                        FUN_ESPECIE: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                        FUN_Especie: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                        FUN_GENERO: getGeneroDisplay(currentAnimal?.genero),
                        FUN_FASE_VIDA: getFaseDeVidaDisplay((currentAnimal as any)?.faseDeVida),
                        FUN_LOCAL_ORIGEM: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                        FUN_LocalOrigem: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                        FUN_INSTALACAO_ATUAL: currentAnimal?.instalacaoBioterio?.nome || (instalacoes[0]?.nome ?? ""),
                        FUN_DIAGNOSTICO: "",
                        FUN_TRATAMENTO: "",
                        Clinica: { DataAtual: dataFormatada, Responsavel: responsavel },
                        Animal: currentAnimal || {},
                        INPUT_DATA_ENTRADA_QUARENTENA: formatIsoToPtBr(quarentenaRes?.dataEntradaQuarentena),
                        INPUT_DATA_SAIDA_QUARENTENA: formatIsoToPtBr(quarentenaRes?.dataSaidaQuarentena),
                        INPUT_INSTALACAO_DESTINO: instalacaoDestinoNome,
                        INPUT_OBSERVACOES_QUARENTENA: (quarentenaRes as any)?.observacao || "",
                        Quarentena: quarentenaRes || {},
                    }

                    if (isMounted) {
                        setDadosDocumento(payloadQuarentena)
                        setAtendimento(null)
                    }
                    return
                }

                // Fluxo legado: tenta carregar via Atendimento; se falhar e for exame, tenta via SolicitacaoExame direto
                let atendimentoRes: AtendimentoDetailVm | null = null
                let animalRes: any = null
                let instalacoesRes: InstalacaoBioterio[] = []
                try {
                    const results = await Promise.all([
                        getAtendimento(atendimentoId),
                        initialAnimal ? Promise.resolve(initialAnimal) : animalService.getById(animalId).catch(() => null),
                        instalacaoBioterioService.getAll().catch(() => [] as InstalacaoBioterio[]),
                    ])
                    atendimentoRes = results[0]
                    animalRes = results[1]
                    instalacoesRes = results[2] as InstalacaoBioterio[]
                } catch (errAtendimento) {
                    if (tipoModal !== "SolicitacaoExame") throw errAtendimento
                    // Fallback para exame sem atendimento: busca solicitações do animal e localiza o grupo que contém o atendimentoId (que na verdade é solicitacaoId)
                    const [animalFallback, instalacoesFallback, todasSolicitacoes] = await Promise.all([
                        initialAnimal ? Promise.resolve(initialAnimal) : animalService.getById(animalId).catch(() => null),
                        instalacaoBioterioService.getAll().catch(() => [] as InstalacaoBioterio[]),
                        solicitacaoExameService.getAll().catch(() => [] as SolicitacaoExameVm[]),
                    ])
                    animalRes = animalFallback
                    instalacoesRes = instalacoesFallback as InstalacaoBioterio[]
                    const filtradas = (todasSolicitacoes as SolicitacaoExameVm[]).filter((s) => Number(s.animalId) === Number(animalId))
                    let grupoFallback: SolicitacaoExameVm[] = []
                    const alvo = filtradas.find((s) => s.id === atendimentoId)
                    if (alvo) {
                        // reusa lógica de agrupamento por tempo <2min e mesmos dados clínicos
                        const sorted = [...filtradas].sort((a, b) => {
                            const da = (a as any).dataCriacao ? new Date((a as any).dataCriacao).getTime() : 0
                            const db = (b as any).dataCriacao ? new Date((b as any).dataCriacao).getTime() : 0
                            return da - db
                        })
                        const idx = sorted.findIndex((s) => s.id === atendimentoId)
                        if (idx >= 0) {
                            grupoFallback = [sorted[idx]]
                            // expande para trás e frente dentro da janela de 2min com mesmos dados
                            const ref = sorted[idx] as any
                            const refTime = ref.dataCriacao ? new Date(ref.dataCriacao).getTime() : 0
                            for (let i = idx - 1; i >= 0; i--) {
                                const cur = sorted[i] as any
                                const curTime = cur.dataCriacao ? new Date(cur.dataCriacao).getTime() : 0
                                const diff = refTime && curTime ? Math.abs(refTime - curTime) : Number.MAX_SAFE_INTEGER
                                const sameClinico = (cur.sinaisClinicos || "") === (ref.sinaisClinicos || "") && (cur.suspeitaClinica || "") === (ref.suspeitaClinica || "") && (cur.regiaoAnatomica || "") === (ref.regiaoAnatomica || "")
                                if (diff < 120000 && sameClinico) grupoFallback.unshift(cur)
                                else break
                            }
                            for (let i = idx + 1; i < sorted.length; i++) {
                                const cur = sorted[i] as any
                                const curTime = cur.dataCriacao ? new Date(cur.dataCriacao).getTime() : 0
                                const diff = refTime && curTime ? Math.abs(refTime - curTime) : Number.MAX_SAFE_INTEGER
                                const sameClinico = (cur.sinaisClinicos || "") === (ref.sinaisClinicos || "") && (cur.suspeitaClinica || "") === (ref.suspeitaClinica || "") && (cur.regiaoAnatomica || "") === (ref.regiaoAnatomica || "")
                                if (diff < 120000 && sameClinico) grupoFallback.push(cur)
                                else break
                            }
                        }
                    }
                    if (grupoFallback.length === 0 && alvo) grupoFallback = [alvo]
                    if (grupoFallback.length > 0) {
                        if (!isMounted) return
                        const instalacoes = Array.isArray(instalacoesRes) ? instalacoesRes : []
                        const currentAnimal = animalRes
                        const primeira = grupoFallback[0] as any
                        const dataRef = primeira?.dataCriacao ? new Date(primeira.dataCriacao) : new Date()
                        const dataFormatada = dataRef.toLocaleDateString("pt-BR")
                        const dataHoraFormatada = dataRef.toLocaleString("pt-BR")
                        const responsavel = (primeira?.rf && !/^\d+$/.test(String(primeira.rf).trim()) ? primeira.rf : "") || "Responsável Técnico"
                        const baseDadosFallback: Record<string, any> = {
                            FUN_DATA_AGORA: dataFormatada,
                            FUN_DATA_HORA_AGORA: dataHoraFormatada,
                            FUN_NOME_COMPLETO_USUARIO: responsavel,
                            FUN_NOME_RESPONSAVEL: responsavel,
                            FUN_NOME_RESPOSAVEL: responsavel,
                            FUN_NUMERO_REGISTRO: currentAnimal?.numeroRegistro || "",
                            FUN_NumeroRegistro: currentAnimal?.numeroRegistro || "",
                            FUN_NOME_POPULAR: currentAnimal?.nomePopular || "",
                            FUN_NomePopular: currentAnimal?.nomePopular || "",
                            FUN_ESPECIE: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                            FUN_Especie: currentAnimal?.especie?.nome || (currentAnimal as any)?.especieNome || "",
                            FUN_GENERO: getGeneroDisplay(currentAnimal?.genero),
                            FUN_FASE_VIDA: getFaseDeVidaDisplay((currentAnimal as any)?.faseDeVida),
                            FUN_LOCAL_ORIGEM: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                            FUN_LocalOrigem: currentAnimal?.localOrigem?.nome || (currentAnimal as any)?.localOrigemNome || "",
                            FUN_INSTALACAO_ATUAL: currentAnimal?.instalacaoBioterio?.nome || (instalacoes[0]?.nome ?? ""),
                            FUN_DIAGNOSTICO: "",
                            FUN_TRATAMENTO: "",
                            Clinica: { DataAtual: dataFormatada, Responsavel: responsavel },
                            Animal: currentAnimal || {},
                        }
                        const payload = buildExamePayload(grupoFallback, baseDadosFallback)
                        if (isMounted) {
                            setDadosDocumento(payload)
                            setAtendimento(null)
                        }
                        return
                    }
                    throw errAtendimento
                }

                if (!isMounted) return

                if (!atendimentoRes) throw new Error("Atendimento não encontrado")
                setAtendimento(atendimentoRes)

                const instalacoes = Array.isArray(instalacoesRes) ? instalacoesRes : []
                const currentAnimal = animalRes

                const instalacaoAtualNome =
                    instalacoes.find((i) => i.id === atendimentoRes!.instalacaoBioterioId)?.nome ||
                    atendimentoRes!.instalacaoBioterioId?.toString() ||
                    ""

                const responsavel = atendimentoRes!.responsavel || "Responsável Técnico"
                const dataAtendimentoFormatada = atendimentoRes!.dataHoraRegistro
                    ? new Date(atendimentoRes!.dataHoraRegistro).toLocaleDateString("pt-BR")
                    : new Date().toLocaleDateString("pt-BR")
                const dataHoraAtendimentoFormatada = atendimentoRes!.dataHoraRegistro
                    ? new Date(atendimentoRes!.dataHoraRegistro).toLocaleString("pt-BR")
                    : new Date().toLocaleString("pt-BR")

                // Dados base comuns
                const baseDados: Record<string, any> = {
                    FUN_DATA_AGORA: dataAtendimentoFormatada,
                    FUN_DATA_HORA_AGORA: dataHoraAtendimentoFormatada,
                    FUN_NOME_COMPLETO_USUARIO: responsavel,
                    FUN_NOME_RESPONSAVEL: responsavel,
                    FUN_NOME_RESPOSAVEL: responsavel,
                    FUN_NUMERO_REGISTRO: currentAnimal?.numeroRegistro || atendimentoRes!.numeroRegistro || "",
                    FUN_NumeroRegistro: currentAnimal?.numeroRegistro || atendimentoRes!.numeroRegistro || "",
                    FUN_NOME_POPULAR: currentAnimal?.nomePopular || "",
                    FUN_NomePopular: currentAnimal?.nomePopular || "",
                    FUN_ESPECIE: currentAnimal?.especie?.nome || currentAnimal?.especieNome || atendimentoRes!.especieNome || "",
                    FUN_Especie: currentAnimal?.especie?.nome || currentAnimal?.especieNome || atendimentoRes!.especieNome || "",
                    FUN_GENERO: getGeneroDisplay(currentAnimal?.genero),
                    FUN_FASE_VIDA: getFaseDeVidaDisplay(currentAnimal?.faseDeVida),
                    FUN_LOCAL_ORIGEM: currentAnimal?.localOrigem?.nome || currentAnimal?.localOrigemNome || "",
                    FUN_LocalOrigem: currentAnimal?.localOrigem?.nome || currentAnimal?.localOrigemNome || "",
                    FUN_INSTALACAO_ATUAL: instalacaoAtualNome,
                    FUN_DIAGNOSTICO: atendimentoRes!.diagnostico || "",
                    FUN_TRATAMENTO: atendimentoRes!.tratamento || "",
                    Clinica: {
                        DataAtual: dataAtendimentoFormatada,
                        Responsavel: responsavel,
                    },
                    Atendimento: atendimentoRes!,
                    Animal: currentAnimal || {},
                }

                // 2. Constrói dados específicos de cada tipo de documento
                if (tipoModal === "AltaAmbulatorial") {
                    const altaRes: AltaAmbulatoriaDetailVm | null =
                        (atendimentoId ? await altaAmbulatoriaService.getById(atendimentoId).catch(() => null) : null) ||
                        (await altaAmbulatoriaService.getByAnimalId(animalId).catch(() => null))

                    const instalacaoRetornoNome =
                        instalacoes.find((i) => i.id === altaRes?.instalacaoBioterioRetornoId)?.nome || ""

                    const payloadAlta = {
                        ...baseDados,
                        INPUT_DATA_ENTRADA_AMBULATORIO: formatIsoToPtBr(altaRes?.dataEntradaAmbulatorio),
                        INPUT_DATA_CLINICA: formatIsoToPtBr(altaRes?.dataAltaClinica),
                        INPUT_PROCEDIMENTOS_MEDICACAO_REALIZADAS_DURANTE_ATENDIMENTO:
                            altaRes?.procedimentosMedicacoes || "",
                        INPUT_OBS_CLINICAS_ALTA: altaRes?.observacoesClinicas || "",
                        INPUT_INSTALACAO_RETORNO: instalacaoRetornoNome,
                        Alta: altaRes || {},
                    }

                    if (isMounted) setDadosDocumento(payloadAlta)
                } else if (tipoModal === "LiberacaoQuarentena") {
                    const quarentenaRes: LiberacaoQuarentenaDetailVm | null = await liberacaoQuarentenaService
                        .getByAnimalId(animalId)
                        .catch(() => null)

                    const instalacaoDestinoNome =
                        instalacoes.find((i) => i.id === quarentenaRes?.instalacaoBioterioId)?.nome || ""

                    const payloadQuarentena = {
                        ...baseDados,
                        INPUT_DATA_ENTRADA_QUARENTENA: formatIsoToPtBr(quarentenaRes?.dataEntradaQuarentena),
                        INPUT_DATA_SAIDA_QUARENTENA: formatIsoToPtBr(quarentenaRes?.dataSaidaQuarentena),
                        INPUT_INSTALACAO_DESTINO: instalacaoDestinoNome,
                        INPUT_OBSERVACOES_QUARENTENA: atendimentoRes.anamnese || "",
                        Quarentena: quarentenaRes || {},
                    }

                    if (isMounted) setDadosDocumento(payloadQuarentena)
                } else if (tipoModal === "SolicitacaoExame") {
                    const solicitacoes = atendimentoRes!.solicitacoesExame && atendimentoRes!.solicitacoesExame.length > 0 ? atendimentoRes!.solicitacoesExame : []
                    const payloadExame = buildExamePayload(solicitacoes, baseDados)
                    if (isMounted) setDadosDocumento(payloadExame)
                }
            } catch (err) {
                console.error("Erro ao carregar dados do documento:", err)
                toast.error("Erro ao carregar os dados do documento clínico.")
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        carregarDados()

        return () => {
            isMounted = false
        }
    }, [isOpen, tipoModal, atendimentoId, animalId, initialAnimal, solicitacoesGroup])

    if (!isOpen || !tipoModal) return null

    const config = tipoLabels[tipoModal]

    const handleEditAtendimento = () => {
        onClose()
        navigate(`/atendimento/editar/${atendimentoId}?animalId=${animalId}&tab=${config.targetTab}`)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-4xl max-h-[94vh] flex flex-col rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-800">
                            <FileText className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-tight">
                                Documento: {config.titulo}
                            </h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                {tipoModal !== "SolicitacaoExame" && atendimento?.responsavel
                                    ? `Resp: ${atendimento.responsavel}`
                                    : ""}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {tipoModal === "SolicitacaoExame" && solicitacoesGroup && onSuspender && (() => {
                            const statuses = solicitacoesGroup.map(s => (s as any).status || "Ativa")
                            const isAtiva = statuses.every((s: string) => s === "Ativa")
                            if (!isAtiva) return null
                            const canEditExame = hasPermission("Exames", "Editar")
                            return (
                                <button
                                    type="button"
                                    onClick={() => onSuspender(solicitacoesGroup)}
                                    disabled={!canEditExame}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-orange-700 hover:text-orange-800 hover:bg-orange-50 border border-orange-200 bg-orange-50/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Suspender esta solicitação"
                                >
                                    <Pause className="h-3.5 w-3.5" />
                                    Suspender
                                </button>
                            )
                        })()}
                        {tipoModal !== "SolicitacaoExame" && (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={!hasPermission("Atendimento veterinário", "Editar")}
                                onClick={() => {
                                    if (onEdit) {
                                        onEdit(tipoModal, atendimentoId)
                                    } else {
                                        handleEditAtendimento()
                                    }
                                }}
                                className="rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 border-gray-200"
                            >
                                <ExternalLink className="h-3.5 w-3.5 mr-1.5 text-slate-500" />
                                {tipoModal === "AltaAmbulatorial" ? "Editar Alta" : tipoModal === "LiberacaoQuarentena" ? "Editar Liberação" : "Editar Atendimento"}
                            </Button>
                        )}
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            aria-label="Fechar"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/70">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-3 bg-white rounded-xl border border-gray-100">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-800" />
                            <span className="text-sm font-medium text-slate-600">
                                Carregando dados e montando documento...
                            </span>
                        </div>
                    ) : dadosDocumento ? (
                        <div className="flex flex-col gap-3">
                            {tipoModal === "SolicitacaoExame" && solicitacoesGroup && (() => {
                                const statuses = solicitacoesGroup.map(s => (s as any).status || "Ativa")
                                const isCancelada = statuses.includes("Cancelada")
                                const isSuspensa = statuses.includes("Suspensa")
                                if (!isCancelada && !isSuspensa) return null
                                const motivo = isCancelada
                                    ? (solicitacoesGroup.find(s => (s as any).motivoCancelamento) as any)?.motivoCancelamento
                                    : (solicitacoesGroup.find(s => (s as any).motivoSuspensao) as any)?.motivoSuspensao
                                const data = isCancelada
                                    ? (solicitacoesGroup.find(s => (s as any).dataCancelamento) as any)?.dataCancelamento
                                    : (solicitacoesGroup.find(s => (s as any).dataSuspensao) as any)?.dataSuspensao
                                return (
                                    <div className={`rounded-lg border px-4 py-3 text-sm ${isCancelada ? 'bg-red-50 border-red-200 text-red-900' : 'bg-orange-50 border-orange-200 text-orange-900'}`}>
                                        <div className="font-semibold flex items-center gap-2">{isCancelada ? 'Solicitação cancelada' : 'Solicitação suspensa'} {data ? `em ${new Date(data).toLocaleDateString("pt-BR")}` : ""}</div>
                                        {motivo && <div className="mt-1"><span className="font-medium">Motivo:</span> {motivo}</div>}
                                        <div className="mt-1 text-xs opacity-80">O documento permanece no histórico para auditoria.</div>
                                    </div>
                                )
                            })()}
                            <DocumentoViewer
                                tipoDocumento={config.tipoDoc}
                                dados={dadosDocumento}
                            />
                        </div>
                    ) : (
                        <div className="p-12 text-center text-slate-500 bg-white rounded-xl">
                            Não foi possível carregar as informações para este documento.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
