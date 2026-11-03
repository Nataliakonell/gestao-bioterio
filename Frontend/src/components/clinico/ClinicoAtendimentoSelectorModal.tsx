import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BriefcaseMedical } from "lucide-react"
import { ModalShell } from "@/components/ui/modal-shell"

interface ClinicoAtendimentoSelectorModalProps {
  isOpen: boolean
  onClose: () => void
  tipoAtendimentoSelecionado: string
  setTipoAtendimentoSelecionado: (value: string) => void
  onConfirm: () => void
}

export function ClinicoAtendimentoSelectorModal({
  isOpen,
  onClose,
  tipoAtendimentoSelecionado,
  setTipoAtendimentoSelecionado,
  onConfirm,
}: ClinicoAtendimentoSelectorModalProps) {
  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Atendimento"
      icon={<BriefcaseMedical className="h-6 w-6" />}
      iconBg="blue"
      size="sm"
      footer={
        <div className="flex justify-end gap-3 w-full">
          <Button variant="ghost" size="lg" onClick={onClose} className="rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-6 font-semibold">
            Cancelar
          </Button>
          <Button size="lg" onClick={onConfirm} className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 px-8">
            Continuar
          </Button>
        </div>
      }
    >
      <div>
        <p className="text-sm text-slate-500 mb-4">Selecione o tipo de ação clínica que deseja realizar para prosseguir.</p>
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-100 space-y-3">
          <label className="block text-sm font-semibold text-slate-700">Qual é o tipo de atendimento?</label>
          <Select value={tipoAtendimentoSelecionado} onValueChange={setTipoAtendimentoSelecionado}>
            <SelectTrigger className="bg-white text-base h-11 rounded-lg shadow-sm border-slate-200 focus:ring-blue-500/20">
              <SelectValue placeholder="Escolha uma opção na lista..." />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="rounded-xl border-slate-100 shadow-xl">
              <SelectItem value="Consulta" className="text-base py-3 cursor-pointer">
                Consulta Clínica
              </SelectItem>
              <SelectItem value="AltaAmbulatorial" className="text-base py-3 cursor-pointer">
                Alta Ambulatorial
              </SelectItem>
              <SelectItem value="LiberacaoQuarentena" className="text-base py-3 cursor-pointer">
                Liberação de Quarentena
              </SelectItem>
              <SelectItem value="RegistroObito" className="text-base py-3 cursor-pointer text-red-600 focus:text-red-700">
                Registro de Óbito
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </ModalShell>
  )
}
