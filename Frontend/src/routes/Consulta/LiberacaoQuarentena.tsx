import { FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import type { LocalizacaoListVm } from "@/services/localizacaoService"
import { isoToLocalDate } from "@/lib/date"
import { usePermissions } from "@/contexts/PermissionsContext"

export interface LiberacaoQuarentenaFormData {
    id?: number
    dataEntradaQuarentena: string
    dataSaidaQuarentena: string
    instalacaoBioterioId?: string
    observacao?: string
    responsavel: string
}

interface LiberacaoQuarentenaProps {
    quarentenaData: LiberacaoQuarentenaFormData
    setQuarentenaData: React.Dispatch<React.SetStateAction<LiberacaoQuarentenaFormData>>
    instalacoes: LocalizacaoListVm[]
}

export function LiberacaoQuarentena({ quarentenaData, setQuarentenaData, instalacoes }: LiberacaoQuarentenaProps) {
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Atendimento veterinário", "Gerenciar")

    return (
        <FormSection title="Liberação da Quarentena">
            <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de entrada na quarentena <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            disabled={!canEdit}
                            date={isoToLocalDate(quarentenaData.dataEntradaQuarentena)}
                            setDate={(date) => {
                                if (date) {
                                    const pad = (n: number) => n.toString().padStart(2, '0')
                                    const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`
                                    setQuarentenaData(prev => ({ ...prev, dataEntradaQuarentena: localIso }))
                                } else {
                                    setQuarentenaData(prev => ({ ...prev, dataEntradaQuarentena: "" }))
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de saída / liberação <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            disabled={!canEdit}
                            date={isoToLocalDate(quarentenaData.dataSaidaQuarentena)}
                            setDate={(date) => {
                                if (date) {
                                    const pad = (n: number) => n.toString().padStart(2, '0')
                                    const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`
                                    setQuarentenaData(prev => ({ ...prev, dataSaidaQuarentena: localIso }))
                                } else {
                                    setQuarentenaData(prev => ({ ...prev, dataSaidaQuarentena: "" }))
                                }
                            }}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destino após liberação (Instalação / Sala)
                    </label>
                    <SearchableSelect
                        options={instalacoes.map((i) => ({ value: i.id.toString(), label: i.caminhoHierarquia || i.nome }))}
                        value={quarentenaData.instalacaoBioterioId || ""}
                        isDisabled={!canEdit}
                        onChange={(val) => setQuarentenaData(prev => ({ ...prev, instalacaoBioterioId: val }))}
                        placeholder="Selecione o local/sala de destino..."
                    />
                    <p className="text-xs text-gray-500 mt-1">O animal será transferido para este local ao salvar.</p>
                </div>
                <ResponsavelSelect
                    disabled={!canEdit}
                    value={quarentenaData.responsavel}
                    onChange={(val) => setQuarentenaData(prev => ({ ...prev, responsavel: val }))}
                    required
                />
            </div>
        </FormSection>
    )
}
