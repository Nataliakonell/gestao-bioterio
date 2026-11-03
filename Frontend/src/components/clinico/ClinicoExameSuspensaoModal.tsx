import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/ui/form-field"
import { ModalShell } from "@/components/ui/modal-shell"
import { toast } from "sonner"
import { solicitacaoExameService, type SolicitacaoExameVm } from "@/services/SolicitacaoExameService"

interface ClinicoExameSuspensaoModalProps {
  exameSuspensaoModal: { group: SolicitacaoExameVm[] } | null
  onClose: () => void
  onSaved: () => void
}

export function ClinicoExameSuspensaoModal({ exameSuspensaoModal, onClose, onSaved }: ClinicoExameSuspensaoModalProps) {
  const [motivoSuspensao, setMotivoSuspensao] = useState("")
  const [isSuspending, setIsSuspending] = useState(false)

  if (!exameSuspensaoModal) return null

  const handleConfirm = async () => {
    if (!motivoSuspensao.trim()) {
      toast.error("Informe o motivo da suspensão.")
      return
    }
    setIsSuspending(true)
    try {
      const ids = exameSuspensaoModal.group.map((g) => g.id)
      const motivo = motivoSuspensao.trim()
      const results = await Promise.all(ids.map((id) => solicitacaoExameService.suspender(id, motivo)))
      const falhas = results.filter((r) => r && r.success === false)
      if (falhas.length > 0) {
        toast.error(falhas[0].message || "Erro ao suspender alguns exames do grupo.")
      } else {
        toast.success("Solicitação suspensa com sucesso.")
      }
      setMotivoSuspensao("")
      onSaved()
      onClose()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.message || "Erro ao suspender solicitação.")
    } finally {
      setIsSuspending(false)
    }
  }

  return (
    <ModalShell
      isOpen={!!exameSuspensaoModal}
      onClose={() => !isSuspending && onClose()}
      title="Suspender Solicitação de Exame"
      icon={<AlertTriangle className="h-5 w-5" />}
      iconBg="orange"
      size="sm"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSuspending}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} disabled={isSuspending} className="bg-orange-600 hover:bg-orange-700 text-white">
            {isSuspending && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
            Confirmar suspensão
          </Button>
        </div>
      }
    >
      <p className="text-xs text-gray-500 mb-3">Informe o motivo da suspensão desta solicitação para registro no histórico clínico.</p>
      <FormField label="Motivo da suspensão" required>
        <Textarea
          value={motivoSuspensao}
          onChange={(e) => setMotivoSuspensao(e.target.value)}
          placeholder="Ex: Animal em jejum insuficiente, solicitação duplicada, etc."
          rows={3}
          className="bg-white text-xs"
        />
      </FormField>
    </ModalShell>
  )
}
