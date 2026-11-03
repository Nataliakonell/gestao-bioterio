import { FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import { Textarea } from "@/components/ui/textarea"
import { DatePicker } from "@/components/ui/date-picker"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { isoToLocalDate } from "@/lib/date"

export interface RegistroObitoFormData {
    id?: number
    dataObito: string
    houveNecropsia: boolean
    observacoes: string
}

interface RegistroObitoFormProps {
    data: RegistroObitoFormData
    setData: React.Dispatch<React.SetStateAction<RegistroObitoFormData>>
}

export function RegistroObitoForm({ data, setData }: RegistroObitoFormProps) {
    return (
        <FormSection title="Dados do Óbito">
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Data do Óbito <span className="text-red-500">*</span>
                        </label>
                        <DatePicker
                            date={isoToLocalDate(data.dataObito)}
                            setDate={(date) => {
                                if (date) {
                                    const pad = (n: number) => n.toString().padStart(2, '0')
                                    const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T00:00:00`
                                    setData(prev => ({ ...prev, dataObito: localIso }))
                                } else {
                                    setData(prev => ({ ...prev, dataObito: "" }))
                                }
                            }}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Houve Necropsia? <span className="text-red-500">*</span>
                        </label>
                        <RadioGroup
                            value={data.houveNecropsia ? "sim" : "nao"}
                            onValueChange={(val) => setData(prev => ({ ...prev, houveNecropsia: val === "sim" }))}
                            className="flex items-center gap-6 mt-2"
                        >
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem value="sim" id="necropsia-sim" />
                                <label htmlFor="necropsia-sim" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Sim
                                </label>
                            </div>
                            <div className="flex items-center space-x-2 cursor-pointer">
                                <RadioGroupItem value="nao" id="necropsia-nao" />
                                <label htmlFor="necropsia-nao" className="text-sm font-medium text-gray-700 cursor-pointer">
                                    Não
                                </label>
                            </div>
                        </RadioGroup>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observações / Laudo Preliminar
                    </label>
                    <Textarea
                        value={data.observacoes}
                        onChange={(e) => setData(prev => ({ ...prev, observacoes: e.target.value }))}
                        placeholder="Informe detalhes sobre a causa presumida, necropsia ou observações adicionais..."
                        rows={4}
                        className="resize-none border-gray-200"
                    />
                </div>
            </div>
        </FormSection>
    )
}
