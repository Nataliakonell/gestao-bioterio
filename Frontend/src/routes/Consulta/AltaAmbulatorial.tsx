import { FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import type { LocalizacaoListVm } from "@/services/localizacaoService"
import { isoToLocalDate } from "@/lib/date"
import { usePermissions } from "@/contexts/PermissionsContext"

export interface AltaData {
    id?: number
    dataEntradaAmbulatorio: string
    dataAltaClinica: string
    procedimentosMedicacoes: string
    observacoesClinicas: string
    instalacaoBioterioRetornoId?: string
    responsavel: string
}

interface AltaAmbulatorialProps {
    altaData: AltaData
    setAltaData: React.Dispatch<React.SetStateAction<AltaData>>
    instalacoes: LocalizacaoListVm[]
}

export function AltaAmbulatorial({ altaData, setAltaData, instalacoes }: AltaAmbulatorialProps) {
    const { hasPermission } = usePermissions()

    return (
        hasPermission("Atendimento veterinário", "Gerenciar") && (
        <FormSection title="Documento de alta ambulatorial">
            <div className="space-y-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data de entrada no ambulatório <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            date={isoToLocalDate(altaData.dataEntradaAmbulatorio)}
                            setDate={(date) => {
                                if (date) {
                                    const pad = (n: number) => n.toString().padStart(2, '0')
                                    const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`
                                    setAltaData(prev => ({ ...prev, dataEntradaAmbulatorio: localIso }))
                                } else {
                                    setAltaData(prev => ({ ...prev, dataEntradaAmbulatorio: "" }))
                                }
                            }}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data da alta clínica <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            date={isoToLocalDate(altaData.dataAltaClinica)}
                            setDate={(date) => {
                                if (date) {
                                    const pad = (n: number) => n.toString().padStart(2, '0')
                                    const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`
                                    setAltaData(prev => ({ ...prev, dataAltaClinica: localIso }))
                                } else {
                                    setAltaData(prev => ({ ...prev, dataAltaClinica: "" }))
                                }
                            }}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Procedimentos / medicações realizadas durante o atendimento
                    </label>
                    <Textarea
                        value={altaData.procedimentosMedicacoes}
                        onChange={(e) => setAltaData(prev => ({ ...prev, procedimentosMedicacoes: e.target.value }))}
                        rows={4}
                        placeholder="Descreva os procedimentos e medicações realizados"
                        className="bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações clínicas na alta
                    </label>
                    <Textarea
                        value={altaData.observacoesClinicas}
                        onChange={(e) => setAltaData(prev => ({ ...prev, observacoesClinicas: e.target.value }))}
                        rows={4}
                        placeholder="Observações clínicas ao momento da alta"
                        className="bg-white"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Destino após a alta (Instalação de retorno)
                    </label>
                    <SearchableSelect
                        options={instalacoes.map((i) => ({ value: i.id.toString(), label: i.caminhoHierarquia || i.nome }))}
                        value={altaData.instalacaoBioterioRetornoId || ""}
                        onChange={(val) => setAltaData(prev => ({ ...prev, instalacaoBioterioRetornoId: val }))}
                        placeholder="Selecione o local/sala de destino..."
                    />
                    <p className="text-xs text-gray-500 mt-1">O animal será transferido para este local ao salvar.</p>
                </div>
                <ResponsavelSelect
                    value={altaData.responsavel}
                    onChange={(val) => setAltaData(prev => ({ ...prev, responsavel: val }))}
                    required
                />
            </div>
        </FormSection>
        )
    )
}
