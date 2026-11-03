import { useState, useEffect } from "react"
import { ArrowLeft, BriefcaseMedical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { parseDateInput } from "@/lib/date"
import { liberacaoQuarentenaService } from "@/services/LiberacaoQuarentenaService"
import { getUserInfo } from "@/services/api"
import { LiberacaoQuarentena, type LiberacaoQuarentenaFormData } from "./LiberacaoQuarentena"
import { localizacaoService, type LocalizacaoListVm } from "@/services/localizacaoService"
import { usePermissions } from "@/contexts/PermissionsContext"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"

interface LiberacaoQuarentenaModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  quarentenaParaEditar?: import("@/services/LiberacaoQuarentenaService").LiberacaoQuarentenaDetailVm | null
  onSaved?: () => void
  onBack?: () => void
}

export function LiberacaoQuarentenaModal({ isOpen, onClose, animalId, quarentenaParaEditar, onSaved, onBack }: LiberacaoQuarentenaModalProps) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("Atendimento veterinário", "Gerenciar")
  const canGerenciar = hasPermission("Atendimento veterinário", "Gerenciar")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [instalacoes, setInstalacoes] = useState<LocalizacaoListVm[]>([])
  const [form, setForm] = useState<LiberacaoQuarentenaFormData>({
    dataEntradaQuarentena: "",
    dataSaidaQuarentena: "",
    instalacaoBioterioId: "",
    observacao: "",
    responsavel: "",
  })

  useEffect(() => {
    if (!isOpen) return
    localizacaoService.getAll().then(setInstalacoes).catch(() => {})
    const user = getUserInfo()
    if (quarentenaParaEditar) {
      setForm({
        id: quarentenaParaEditar.id,
        dataEntradaQuarentena: quarentenaParaEditar.dataEntradaQuarentena ? quarentenaParaEditar.dataEntradaQuarentena.split("T")[0] : "",
        dataSaidaQuarentena: quarentenaParaEditar.dataSaidaQuarentena ? quarentenaParaEditar.dataSaidaQuarentena.split("T")[0] : "",
        instalacaoBioterioId: quarentenaParaEditar.instalacaoBioterioId ? String(quarentenaParaEditar.instalacaoBioterioId) : "",
        observacao: (quarentenaParaEditar as any).observacao || "",
        responsavel: (quarentenaParaEditar as any).responsavel || quarentenaParaEditar.rf || user?.name || "",
      })
    } else {
      setForm({ dataEntradaQuarentena: "", dataSaidaQuarentena: "", instalacaoBioterioId: "", observacao: "", responsavel: user?.name || "" })
    }
  }, [isOpen, quarentenaParaEditar])

  const isDirty = Boolean(form.dataEntradaQuarentena || form.dataSaidaQuarentena || form.observacao?.trim())
  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleDelete = async () => {
    if (!form.id) return
    try {
      setDeleting(true)
      await liberacaoQuarentenaService.delete(form.id)
      toast.success("Liberação de quarentena excluída com sucesso!")
      setShowDeleteConfirm(false)
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir liberação de quarentena")
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!form.dataEntradaQuarentena) {
      toast.error("Informe a data de entrada na quarentena.")
      return
    }
    if (!form.dataSaidaQuarentena) {
      toast.error("Informe a data de saída/liberação.")
      return
    }
    if (form.dataSaidaQuarentena.slice(0, 10) < form.dataEntradaQuarentena.slice(0, 10)) {
      toast.error("A data de saída não pode ser antes da entrada.")
      return
    }
    try {
      setSaving(true)
      const destinoId = form.instalacaoBioterioId ? Number(form.instalacaoBioterioId) : undefined
      const payload = {
        animalId,
        dataEntradaQuarentena: parseDateInput(form.dataEntradaQuarentena),
        dataSaidaQuarentena: parseDateInput(form.dataSaidaQuarentena),
        instalacaoBioterioId: destinoId && !isNaN(destinoId) ? destinoId : undefined,
        localizacaoDestinoId: destinoId && !isNaN(destinoId) ? destinoId : undefined,
        responsavel: form.responsavel.trim() || undefined,
      }
      if (form.id) {
        await liberacaoQuarentenaService.update({ id: form.id, ...payload })
        toast.success("Liberação de quarentena atualizada com sucesso!")
      } else {
        await liberacaoQuarentenaService.create(payload)
        toast.success("Liberação de quarentena registrada com sucesso!")
      }
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar liberação")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <ModalShell
      isOpen={isOpen}
      onClose={handleAttemptClose}
      title="Liberação de Quarentena"
      icon={<BriefcaseMedical className="h-4 w-4" />}
      iconBg="blue"
      showCancelModal={showCancelModal}
      onCancelModalClose={closeCancelModal}
      onCancelModalConfirm={handleConfirmCancel}
      footerProps={{
        align: "between",
        onCancel: handleAttemptClose,
        onSave: canEdit ? handleSave : undefined,
        saveLabel: "Salvar liberação",
        saving,
        leftActions: (
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" onClick={onBack} disabled={saving || deleting} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            )}
            {Boolean(form.id) && canGerenciar && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={saving || deleting}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Excluir
              </Button>
            )}
          </div>
        ),
      }}
    >
      <LiberacaoQuarentena quarentenaData={form} setQuarentenaData={setForm} instalacoes={instalacoes} />
    </ModalShell>
    <DeleteConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
      title="Excluir Liberação de Quarentena"
      description="Deseja realmente excluir este registro de liberação de quarentena? Esta ação é definitiva e não poderá ser desfeita."
      loading={deleting}
    />
  </>
  )
}
