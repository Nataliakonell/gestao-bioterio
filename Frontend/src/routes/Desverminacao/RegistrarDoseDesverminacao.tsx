import React, { useEffect, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { toast } from "sonner"
import { FormLayoutBase } from "@/components/formulario-registro/CadastroRegistroForm"
import { CardFichaAnimalForm } from "@/components/CardFichaAnimalForm"
import { animalService, type AnimalLookupVm } from "@/services/animalService"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { getProtocolosDesverminacao, getProtocoloDesverminacaoById, createProtocoloDesverminacao } from "@/services/ProtocoloDesverminacaoService"
import { createDoseAplicacaoDesverminacao, updateDoseAplicacaoDesverminacao, TipoDose, StatusDoseDesverminacao } from "@/services/DoseAplicacaoDesverminacaoService"
import { PainelResumoProtocolo } from "../../components/desverminacao/PainelResumoProtocolo"
import { Calendar as CalendarIcon } from "lucide-react"

const RequiredMark = () => <span className="text-red-500"> *</span>

export default function RegistrarDoseDesverminacao() {
    const navigate = useNavigate()
    const { id } = useParams<{ id?: string }>()
    const isEditing = !!id
    const [editingDoseId, setEditingDoseId] = useState<number | null>(null)
    const [searchParams] = useSearchParams()
    const urlAnimalId = searchParams.get("animalId")

    const [animalId, setAnimalId] = useState<string>(urlAnimalId || "")
    const [animais, setAnimais] = useState<AnimalLookupVm[]>([])
    const [loadingAnimais, setLoadingAnimais] = useState(true)
    const [dataEntradaAnimal, setDataEntradaAnimal] = useState<string | null>(null)

    const returnUrl = (urlAnimalId || animalId)
        ? `/plantel/animal/${urlAnimalId || animalId}?tab=desverminacao`
        : "/desverminacao/visao-geral"

    const [situacaoCiclo, setSituacaoCiclo] = useState<"nao_iniciado" | "ja_fez_doses">("nao_iniciado")
    const [tipoDoseInformada, setTipoDoseInformada] = useState<string>("")
    const [dataDoseInformada, setDataDoseInformada] = useState<string>("")
    const [observacao, setObservacao] = useState<string>("")

    useEffect(() => {
        if (urlAnimalId) {
            setAnimalId(urlAnimalId)
        }
    }, [urlAnimalId])

    useEffect(() => {
        animalService.getLookup()
            .then(setAnimais)
            .catch(() => toast.error("Erro ao carregar animais"))
            .finally(() => setLoadingAnimais(false))
    }, [])

    useEffect(() => {
        if (id) {
            getProtocoloDesverminacaoById(parseInt(id))
                .then(proto => {
                    if (proto) {
                        setAnimalId(String(proto.animalId))
                        const doses = proto.doses || []
                        const appliedDose = doses
                            .filter(d => d.statusDoseDesverminacao === "Aplicada" || !!d.dataAplicacao)
                            .sort((a, b) => new Date(b.dataAplicacao || b.dataPrevista).getTime() - new Date(a.dataAplicacao || a.dataPrevista).getTime())[0]

                        if (appliedDose) {
                            setEditingDoseId(appliedDose.id)
                            setSituacaoCiclo("ja_fez_doses")
                            let tipoVal = "1"
                            if (appliedDose.tipoDose === "SegundaDose" || appliedDose.tipoDose === "2") tipoVal = "2"
                            if (appliedDose.tipoDose === "Anual" || appliedDose.tipoDose === "3") tipoVal = "3"
                            setTipoDoseInformada(tipoVal)

                            if (appliedDose.dataAplicacao) {
                                setDataDoseInformada(appliedDose.dataAplicacao.split("T")[0])
                            }
                            setObservacao(appliedDose.observacao || "")
                        } else {
                            setSituacaoCiclo("nao_iniciado")
                        }
                    }
                })
                .catch(() => toast.error("Erro ao carregar protocolo para edição"))
        }
    }, [id])

    useEffect(() => {
        if (!animalId) {
            setDataEntradaAnimal(null)
            return
        }
        animalService.getById(parseInt(animalId))
            .then(res => {
                setDataEntradaAnimal(res.dataDeEntrada || new Date().toISOString())
            })
            .catch(() => toast.error("Erro ao carregar detalhes do animal"))

        if (!id) {
            getProtocolosDesverminacao()
                .then(protos => {
                    const existingProto = protos.find(p => Number(p.animalId) === Number(animalId))
                    if (existingProto) {
                        const doses = existingProto.doses || []
                        const appliedDose = doses
                            .filter(d => d.statusDoseDesverminacao === "Aplicada" || !!d.dataAplicacao)
                            .sort((a, b) => new Date(b.dataAplicacao || b.dataPrevista).getTime() - new Date(a.dataAplicacao || a.dataPrevista).getTime())[0]

                        if (appliedDose) {
                            setEditingDoseId(appliedDose.id)
                            setSituacaoCiclo("ja_fez_doses")
                            let tipoVal = "1"
                            if (appliedDose.tipoDose === "SegundaDose" || appliedDose.tipoDose === "2") tipoVal = "2"
                            if (appliedDose.tipoDose === "Anual" || appliedDose.tipoDose === "3") tipoVal = "3"
                            setTipoDoseInformada(tipoVal)

                            if (appliedDose.dataAplicacao) {
                                setDataDoseInformada(appliedDose.dataAplicacao.split("T")[0])
                            }
                            setObservacao(appliedDose.observacao || "")
                        }
                    }
                })
                .catch(() => { })
        }
    }, [animalId, id])

    const handleSubmit = async () => {
        if (!animalId) { toast.error("Selecione o animal."); return false }

        if (!dataEntradaAnimal) {
            toast.error("Aguarde o carregamento dos dados do animal ou selecione outro.")
            return false
        }

        if (situacaoCiclo === "ja_fez_doses") {
            if (!tipoDoseInformada) { toast.error("Selecione o tipo de dose informada."); return false }
            if (!dataDoseInformada) { toast.error("Informe a data da dose administrada."); return false }

            const selectedDate = new Date(dataDoseInformada)
            const now = new Date()
            if (selectedDate > now) {
                toast.error("A data da dose não pode estar no futuro.")
                return false
            }
        }

        try {
            const listaProtocolos = await getProtocolosDesverminacao();
            const protocoloExistente = id ? null : listaProtocolos.find(p => p.animalId === parseInt(animalId));

            let protocoloId = id ? parseInt(id) : protocoloExistente?.id;

            if (!id && situacaoCiclo === "nao_iniciado" && protocoloExistente) {
                toast.error("Este animal já possui um protocolo de desverminação em andamento.");
                return false;
            }

            if (!protocoloId) {
                const novoProtocolo = await createProtocoloDesverminacao({
                    animalId: parseInt(animalId),
                    dataEntrada: new Date(dataEntradaAnimal).toISOString(),
                    temHistoricoDoses: situacaoCiclo === "ja_fez_doses",
                })
                protocoloId = novoProtocolo.id
            }

            if (situacaoCiclo === "ja_fez_doses" && protocoloId) {
                const dataAplicacao = new Date(dataDoseInformada + "T12:00:00")

                if (editingDoseId) {
                    await updateDoseAplicacaoDesverminacao({
                        id: editingDoseId,
                        protocoloDesverminacaoId: protocoloId,
                        tipoDose: parseInt(tipoDoseInformada) as TipoDose,
                        dataPrevista: dataAplicacao.toISOString(),
                        dataAplicacao: dataAplicacao.toISOString(),
                        statusDoseDesverminacao: StatusDoseDesverminacao.Aplicada,
                        observacao: observacao || null
                    })
                } else {
                    await createDoseAplicacaoDesverminacao({
                        protocoloDesverminacaoId: protocoloId,
                        tipoDose: parseInt(tipoDoseInformada) as TipoDose,
                        dataPrevista: dataAplicacao.toISOString(),
                        dataAplicacao: dataAplicacao.toISOString(),
                        statusDoseDesverminacao: StatusDoseDesverminacao.Aplicada,
                        observacao: observacao || null
                    })
                }
            }

            toast.success(isEditing ? "Informações de desverminação atualizadas com sucesso!" : "Ciclo/Dose de desverminação registrado com sucesso!")
            navigate(returnUrl)
            return true
        } catch (err: any) {
            const msg =
                err?.response?.data?.ValidationErrors?.join(", ") ||
                err?.response?.data?.message ||
                err?.response?.data?.title ||
                "Erro ao registrar/atualizar. Verifique os dados e tente novamente."
            toast.error(msg)
            return false
        }
    }

    const checkIsDirty = () => {
        return !!animalId || !!observacao || !!dataDoseInformada || !!tipoDoseInformada;
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
                            breadcrumbTitle={urlAnimalId ? "Ficha do Animal" : "Visão Geral da Desverminação"}
                            breadcrumbUrl={returnUrl}
                            title={isEditing ? "Editar Dose de Desverminação" : "Registrar Dose de Desverminação"}
                        />
                    </HeaderContainer>

                    <div className="flex flex-col gap-6">
                        <CardFichaAnimalForm
                            animalId={animalId}
                            onChange={(v) => setAnimalId(v)}
                            animaisOrdenados={animaisOrdenados}
                            isDisabled={loadingAnimais || isEditing || !!urlAnimalId}
                            placeholder={loadingAnimais ? "Carregando animais..." : "Selecione o animal"}
                        />

                        <FormLayoutBase
                            titleFirstSection="Informações do Ciclo"
                            submitLabel={isEditing ? "Salvar alterações" : "Registrar protocolo"}
                            onSubmit={handleSubmit}
                            onCancel={() => navigate(returnUrl)}
                            checkIsDirty={checkIsDirty}
                            columnsClassName="grid grid-cols-1 md:grid-cols-2 gap-6"
                            sideContent={
                                <PainelResumoProtocolo
                                    dataEntrada={dataEntradaAnimal}
                                    statusCiclo={situacaoCiclo}
                                    dataUltimaDoseInformada={dataDoseInformada || null}
                                    tipoUltimaDoseInformada={tipoDoseInformada || null}
                                />
                            }
                            extraSections={
                                <div className="space-y-6">
                                    <div className="space-y-6 border border-gray-200 rounded-lg p-6 bg-gray-50">
                                        <div className="flex flex-col gap-4">
                                            <h1 className="font-semibold text-gray-900 mb-2">Situação do ciclo de desverminação <RequiredMark /></h1>

                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="situacaoCiclo"
                                                        value="nao_iniciado"
                                                        checked={situacaoCiclo === "nao_iniciado"}
                                                        onChange={() => setSituacaoCiclo("nao_iniciado")}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    Animal ainda não iniciou o ciclo
                                                </label>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                                    <input
                                                        type="radio"
                                                        name="situacaoCiclo"
                                                        value="ja_fez_doses"
                                                        checked={situacaoCiclo === "ja_fez_doses"}
                                                        onChange={() => setSituacaoCiclo("ja_fez_doses")}
                                                        className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                    />
                                                    Animal já fez doses anteriores
                                                </label>
                                            </div>
                                        </div>

                                        {situacaoCiclo === "ja_fez_doses" && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-200">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Tipo da última dose <RequiredMark />
                                                    </label>
                                                    <Select value={tipoDoseInformada} onValueChange={setTipoDoseInformada}>
                                                        <SelectTrigger className="w-full h-9 bg-white">
                                                            <SelectValue placeholder="Selecione a dose..." />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="1">1ª Dose</SelectItem>
                                                            <SelectItem value="2">2ª Dose</SelectItem>
                                                            <SelectItem value="3">Dose Anual</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Data da dose <RequiredMark />
                                                    </label>
                                                    <div className="relative">
                                                        <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                                                        <Input
                                                            type="date"
                                                            value={dataDoseInformada}
                                                            onChange={(e) => setDataDoseInformada(e.target.value)}
                                                            className="w-full pl-9 bg-white h-9 text-gray-700"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Observação (opcional)
                                            </label>
                                            <textarea
                                                value={observacao}
                                                onChange={(e) => setObservacao(e.target.value)}
                                                rows={3}
                                                placeholder="Reações, intercorrências ou observações do manejo..."
                                                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 resize-none focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white"
                                            />
                                        </div>
                                    </div>
                                </div>
                            }
                        />
                    </div>
                </PageContainer>
            </SidebarInset>
        </SidebarProvider>
    )
}
