import { formatarLocalizacao } from "@/lib/utils";
import { useEffect, useState } from "react"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { FileText } from "lucide-react"
import { animalService, type AnimalResponse } from "@/services/animalService"
import { getAlimentacoes } from "@/services/AlimentacaoService"
import { consultaService } from "@/services/ConsultaService"
import { useNavigate } from "react-router-dom"
import { Button } from "./ui/button"

const generoMap: Record<number, string> = { 1: "Macho", 2: "Fêmea", 3: "Não Identificado" }
const faseDeVidaMap: Record<number, string> = { 1: "Filhote", 2: "Jovem", 3: "Adulto" }

interface AnimalLookupVm {
    id: number;
    numeroRegistro: string;
    especieNome: string;
}

interface CardFichaAnimalFormProps {
    animalId: string
    onChange: (value: string) => void
    animaisOrdenados: AnimalLookupVm[]
    isDisabled?: boolean
    placeholder?: string
}

export function CardFichaAnimalForm({
    animalId,
    onChange,
    animaisOrdenados,
    isDisabled,
    placeholder,
}: CardFichaAnimalFormProps) {
    const navigate = useNavigate()
    const [animalDetails, setAnimalDetails] = useState<AnimalResponse | null>(null)
    const [ultimaAlimentacao, setUltimaAlimentacao] = useState<string | null>(null)
    const [ultimoAtendimento, setUltimoAtendimento] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!animalId) {
            setAnimalDetails(null)
            setUltimaAlimentacao(null)
            setUltimoAtendimento(null)
            return
        }

        const idNum = Number(animalId)
        if (isNaN(idNum) || idNum <= 0) {
            setAnimalDetails(null)
            setUltimaAlimentacao(null)
            setUltimoAtendimento(null)
            return
        }

        setLoading(true)

        Promise.all([
            animalService.getById(idNum).catch(error => {
                console.error("Erro ao carregar dados do animal:", error)
                return null
            }),
            getAlimentacoes({ animalId: idNum, pageSize: 1 }).catch(error => {
                console.error("Erro ao carregar última alimentação:", error)
                return null
            }),
            consultaService.getAll({ animalId: idNum }).catch(error => {
                console.error("Erro ao carregar última consulta:", error)
                return null
            }),
        ])
            .then(([animalRes, alimentacaoRes, consultasRes]) => {
                setAnimalDetails(animalRes)

                if (alimentacaoRes?.items && alimentacaoRes.items.length > 0) {
                    setUltimaAlimentacao(alimentacaoRes.items[0].dataAlimentacao)
                } else {
                    setUltimaAlimentacao(null)
                }

                if (Array.isArray(consultasRes) && consultasRes.length > 0) {
                    const sorted = [...consultasRes].sort((a, b) => new Date(b.dataHoraConsulta).getTime() - new Date(a.dataHoraConsulta).getTime())
                    setUltimoAtendimento(sorted[0].dataHoraConsulta)
                } else {
                    setUltimoAtendimento(null)
                }
            })
            .finally(() => {
                setLoading(false)
            })
    }, [animalId])

    const formatData = (isoString?: string | null) => {
        if (!isoString) return "-"
        return new Date(isoString).toLocaleDateString("pt-BR")
    }

    const formatPeso = (peso?: number) => {
        if (peso === undefined || peso === null) return "-"
        return `${peso}g`
    }

    return (
        <div className="w-full rounded-xl border border-gray-200 bg-white border-l-blue-600 border-l-4 p-5 shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row gap-6 w-full">
                <div className="flex-1 flex flex-col gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Animal<span className="text-red-500"> *</span>
                        </label>
                        <SearchableSelect
                            options={animaisOrdenados.map((a) => ({
                                value: a.id.toString(),
                                label: `${a.numeroRegistro} — ${a.especieNome}`,
                            }))}
                            value={animalId}
                            isDisabled={isDisabled}
                            onChange={onChange}
                            placeholder={placeholder}
                            isClearable
                        />
                    </div>

                    {animalDetails ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2 text-sm">
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Nome popular</span>
                                <span className="font-semibold text-gray-900">{animalDetails.nomePopular || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Peso(g)</span>
                                <span className="font-semibold text-gray-900">{formatPeso(animalDetails.biometriaAnimal?.peso)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Local</span>
                                <span className="font-semibold text-gray-900">{formatarLocalizacao(animalDetails.localizacaoNome || animalDetails.localizacaoHierarquia || animalDetails.instalacaoBioterioNome, "-")}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Sexo:</span>
                                <span className="font-semibold text-gray-900">{generoMap[animalDetails.genero] || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Fase de vida</span>
                                <span className="font-semibold text-gray-900">{faseDeVidaMap[animalDetails.faseDeVida] || "-"}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Data entrada</span>
                                <span className="font-semibold text-gray-900">{formatData(animalDetails.dataDeEntrada)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Última alimentação</span>
                                <span className="font-semibold text-gray-900">{formatData(ultimaAlimentacao)}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 text-xs font-medium">Última consulta</span>
                                <span className="font-semibold text-gray-900">{formatData(ultimoAtendimento)}</span>
                            </div>
                        </div>
                    ) : (
                        loading ? (
                            <div className="text-sm text-gray-500">Carregando detalhes do animal...</div>
                        ) : (
                            <div className="text-sm text-gray-500">Selecione um animal para visualizar seus dados.</div>
                        )
                    )}
                </div>

                {animalDetails && (
                    <div className="shrink-0 md:w-72 mt-4 md:mt-0 flex items-center">
                        <div className="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm flex flex-col gap-3">
                            <div className="flex items-center gap-2 text-blue-600 font-medium">
                                <FileText className="w-5 h-5" />
                                <span>Ver ficha completa</span>
                            </div>
                            <p className="text-xs text-gray-500 leading-relaxed">
                                Acesse o histórico clinico, alimentação, biometria e demais informações do animal
                            </p>
                            <div></div>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={!animalId}
                                onClick={() => navigate(`/plantel/animal/${animalId}`)}
                                className="w-full border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                                Abrir ficha do animal
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
