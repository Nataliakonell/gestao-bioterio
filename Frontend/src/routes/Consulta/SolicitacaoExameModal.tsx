import { useState, useEffect } from "react"
import { FlaskConical } from "lucide-react"
import { toast } from "sonner"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import SolicitacaoExameEmAtendimento, { type SolicitacaoExameFormData } from "./SolicitacaoExameEmAtendimento"
import { solicitacaoExameService, TipoExame } from "@/services/SolicitacaoExameService"
import { getUserInfo } from "@/services/api"
import { usePermissions } from "@/contexts/PermissionsContext"

interface SolicitacaoExameModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  onSaved?: () => void
}

export function SolicitacaoExameModal({ isOpen, onClose, animalId, onSaved }: SolicitacaoExameModalProps) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("Atendimento veterinário", "Editar")
  const [exameData, setExameData] = useState<SolicitacaoExameFormData>({
    tiposExame: [],
    outrosExame: "",
    sinaisClinicos: "",
    suspeitaClinica: "",
    regiaoAnatomica: "",
    observacao: "",
    responsavel: "",
  })

  useEffect(() => {
    if (isOpen) {
      const user = getUserInfo()
      setExameData((prev) => ({ ...prev, responsavel: user?.name || "" }))
    }
  }, [isOpen])

  const isDirty = Boolean(
    exameData.tiposExame.length > 0 ||
    exameData.outrosExame.trim() ||
    exameData.sinaisClinicos.trim() ||
    exameData.suspeitaClinica.trim() ||
    exameData.regiaoAnatomica.trim() ||
    exameData.observacao.trim()
  )

  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleConfirmCancelWithReset = () => {
    setExameData({ tiposExame: [], outrosExame: "", sinaisClinicos: "", suspeitaClinica: "", regiaoAnatomica: "", observacao: "", responsavel: "" })
    handleConfirmCancel()
  }

  const handleSave = async () => {
    if (!exameData.tiposExame || exameData.tiposExame.length === 0) {
      toast.error("Selecione ao menos um exame.")
      return
    }
    if (exameData.tiposExame.includes(TipoExame.Outros) && !exameData.outrosExame?.trim()) {
      toast.error("Especifique o outro exame.")
      return
    }
    try {
      setSaving(true)
      const promises = exameData.tiposExame.map((tipo) => {
        const obs =
          tipo === TipoExame.Outros && exameData.outrosExame
            ? `${exameData.outrosExame}${exameData.observacao ? `|||OBS|||${exameData.observacao}` : ""}`
            : exameData.observacao || undefined
        return solicitacaoExameService.create({
          animalId,
          tipoExame: tipo,
          sinaisClinicos: exameData.sinaisClinicos || undefined,
          suspeitaClinica: exameData.suspeitaClinica || undefined,
          regiaoAnatomica: exameData.regiaoAnatomica || "-",
          observacao: obs,
          responsavel: exameData.responsavel.trim() || undefined,
        })
      })
      await Promise.all(promises)
      toast.success("Solicitação de exame registrada com sucesso!")
      setExameData({ tiposExame: [], outrosExame: "", sinaisClinicos: "", suspeitaClinica: "", regiaoAnatomica: "", observacao: "", responsavel: "" })
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar solicitação")
    } finally {
      setSaving(false)
    }
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={handleAttemptClose}
      title="Solicitar Exame"
      icon={<FlaskConical className="h-4 w-4" />}
      iconBg="amber"
      showCancelModal={showCancelModal}
      onCancelModalClose={closeCancelModal}
      onCancelModalConfirm={handleConfirmCancelWithReset}
      footerProps={{ onCancel: handleAttemptClose, onSave: canEdit ? handleSave : undefined, saveLabel: "Salvar solicitação", saving }}
    >
      <SolicitacaoExameEmAtendimento exameData={exameData} setExameData={setExameData} />
      <p className="text-xs text-gray-500">Após salvar, será possível gerar/visualizar o documento (ModeloDocumento — Solicitação de Exame) e imprimir/salvar em PDF.</p>
    </ModalShell>
  )
}
