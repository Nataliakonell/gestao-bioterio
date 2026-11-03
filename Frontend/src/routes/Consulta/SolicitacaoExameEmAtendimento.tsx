import React from "react"
import { FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { TipoExame, tipoExameLabels } from "@/services/SolicitacaoExameService"
import { usePermissions } from "@/contexts/PermissionsContext"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"

export interface SolicitacaoExameFormData {
    tiposExame: TipoExame[]
    outrosExame?: string
    sinaisClinicos: string
    suspeitaClinica: string
    regiaoAnatomica: string
    observacao: string
    responsavel: string
}

interface SolicitacaoExameEmAtendimentoProps {
    exameData: SolicitacaoExameFormData
    setExameData: React.Dispatch<React.SetStateAction<SolicitacaoExameFormData>>
}

const EXAME_OPTIONS = [
    {
        value: TipoExame.HemogramaCompleto,
        label: tipoExameLabels[TipoExame.HemogramaCompleto],
    },
    {
        value: TipoExame.Ultrassonografia,
        label: tipoExameLabels[TipoExame.Ultrassonografia],
    },
    {
        value: TipoExame.Radiografia,
        label: tipoExameLabels[TipoExame.Radiografia],
    },
    {
        value: TipoExame.Outros,
        label: tipoExameLabels[TipoExame.Outros],
    }
]

export default function SolicitacaoExameEmAtendimento({
    exameData,
    setExameData
}: SolicitacaoExameEmAtendimentoProps) {
    const { hasPermission } = usePermissions()
    const canEdit = hasPermission("Atendimento veterinário", "Editar")

    const handleTipoExameToggle = (tipo: TipoExame) => {
        setExameData((prev) => {
            const currentTipos = prev.tiposExame || []
            const exists = currentTipos.includes(tipo)
            const newTipos = exists
                ? currentTipos.filter((t) => t !== tipo)
                : [...currentTipos, tipo]

            return {
                ...prev,
                tiposExame: newTipos,
                outrosExame: !newTipos.includes(TipoExame.Outros) ? "" : prev.outrosExame
            }
        })
    }

    return (
        <FormSection title="Solicitação de Exame Clínico">
            <div className="space-y-6">
                {/* Seleção em Checkbox */}
                <div className="space-y-3">
                    <Label className="block text-sm font-semibold text-gray-800">
                        Exames Solicitados <span className="text-red-500">*</span>
                    </Label>
                    
                    <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl border border-gray-200 bg-gray-50/60">
                        {EXAME_OPTIONS.map((opt) => {
                            const isChecked = exameData.tiposExame?.includes(opt.value)

                            return (
                                <label
                                    key={opt.value}
                                    className="flex items-center gap-2.5 text-sm font-medium text-gray-800 cursor-pointer select-none"
                                >
                                    <Checkbox
                                        checked={isChecked}
                                        disabled={!canEdit}
                                        onCheckedChange={() => handleTipoExameToggle(opt.value)}
                                    />
                                    <span>{opt.label}</span>
                                </label>
                            )
                        })}
                    </div>
                </div>

                {exameData.tiposExame?.includes(TipoExame.Outros) && (
                    <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2 animate-in fade-in-50">
                        <Label className="block text-xs font-semibold text-amber-900">
                            Especifique o outro exame <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            disabled={!canEdit}
                            type="text"
                            placeholder="Ex: Bioquímico (Ureia e Creatinina), Coproparasitológico..."
                            value={exameData.outrosExame || ""}
                            onChange={(e) =>
                                setExameData((prev) => ({ ...prev, outrosExame: e.target.value }))
                            }
                            className="bg-white border-amber-300 focus:border-amber-500 focus:ring-amber-200"
                        />
                    </div>
                )}

                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                        Sinais clínicos observados
                    </Label>
                    <Textarea
                        disabled={!canEdit}
                        rows={6}
                        placeholder="Descreva os sinais clínicos, alterações comportamentais ou físicas observadas..."
                        value={exameData.sinaisClinicos}
                        onChange={(e) =>
                            setExameData((prev) => ({ ...prev, sinaisClinicos: e.target.value }))
                        }
                        className="bg-white"
                    />
                </div>

                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                        Suspeita clínica
                    </Label>
                    <Textarea
                        disabled={!canEdit}
                        rows={6}
                        placeholder="Descreva as hipóteses diagnósticas ou suspeita principal..."
                        value={exameData.suspeitaClinica}
                        onChange={(e) =>
                            setExameData((prev) => ({ ...prev, suspeitaClinica: e.target.value }))
                        }
                        className="bg-white"
                    />
                </div>
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                        Região anatômica de interesse <span className="text-xs text-gray-400 font-normal">(Relevante para Raio-X e Ultrassom)</span>
                    </Label>
                    <Input
                        disabled={!canEdit}
                        type="text"
                        placeholder="Ex: Abdômen total, Membro torácico direito, Tórax (projeções LL e VD)..."
                        value={exameData.regiaoAnatomica}
                        onChange={(e) =>
                            setExameData((prev) => ({ ...prev, regiaoAnatomica: e.target.value }))
                        }
                        className="bg-white"
                    />
                </div>
                <div>
                    <Label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações adicionais
                    </Label>
                    <Textarea
                        disabled={!canEdit}
                        rows={5}
                        placeholder="Instruções de preparo, jejum, urgência ou outras observações clínicas..."
                        value={exameData.observacao}
                        onChange={(e) =>
                            setExameData((prev) => ({ ...prev, observacao: e.target.value }))
                        }
                        className="bg-white"
                    />
                </div>
                                <ResponsavelSelect
                    disabled={!canEdit}
                    value={exameData.responsavel}
                    onChange={(val) => setExameData(prev => ({ ...prev, responsavel: val }))}
                    required
                />
            </div>
        </FormSection>
    )
}
