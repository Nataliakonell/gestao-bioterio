import { useState, useEffect } from "react"
import { FileText } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { FormField } from "@/components/ui/form-field"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { getLocalIso } from "@/lib/date"
import { evolucaoService } from "@/services/EvolucaoService"
import { getUserInfo } from "@/services/api"
import { usePermissions } from "@/contexts/PermissionsContext"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"

interface EvolucaoModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  onSaved?: () => void
  evolucaoEdit?: any
}

export function EvolucaoModal({ isOpen, onClose, animalId, onSaved, evolucaoEdit }: EvolucaoModalProps) {
  const { hasPermission } = usePermissions()
  const canGerenciar = hasPermission("Atendimento veterinário", "Gerenciar")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canEdit = hasPermission("Atendimento veterinário", "Editar")
  const [form, setForm] = useState({ descricao: "", dataHoraRegistro: getLocalIso(), responsavel: "" })

  useEffect(() => {
    if (!isOpen) return
    if (evolucaoEdit) {
      setForm({
        descricao: evolucaoEdit.descricao || "",
        dataHoraRegistro: evolucaoEdit.dataHoraRegistro || getLocalIso(),
        responsavel: evolucaoEdit.responsavel || evolucaoEdit.rf || getUserInfo()?.name || "",
      })
    } else {
      const user = getUserInfo()
      setForm({ descricao: "", dataHoraRegistro: getLocalIso(), responsavel: user?.name || "" })
    }
  }, [isOpen, evolucaoEdit])

  const isDirty = Boolean(form.descricao.trim())
  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleConfirmCancelWithReset = () => {
    setForm({ descricao: "", dataHoraRegistro: getLocalIso(), responsavel: form.responsavel })
    handleConfirmCancel()
  }

  const handleDelete = async () => {
    if (!evolucaoEdit?.id) return
    try {
      setDeleting(true)
      await evolucaoService.delete(evolucaoEdit.id)
      toast.success("Evolução excluída com sucesso!")
      setShowDeleteConfirm(false)
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir evolução")
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!form.descricao.trim()) {
      toast.error("Informe a descrição da evolução.")
      return
    }
    if (!form.dataHoraRegistro) {
      toast.error("Informe a data e hora do registro.")
      return
    }
    if (!form.responsavel.trim()) {
      toast.error("Informe o responsável.")
      return
    }
    try {
      setSaving(true)
      if (evolucaoEdit) {
        const res = await evolucaoService.update({
          id: evolucaoEdit.id,
          animalId,
          descricao: form.descricao.trim(),
          dataHoraRegistro: form.dataHoraRegistro,
          responsavel: form.responsavel.trim(),
        })
        if (res && res.success === false) {
          toast.error(res.validationErrors?.join(" ") || res.message || "Erro ao atualizar evolução")
          return
        }
        toast.success("Evolução atualizada com sucesso!")
      } else {
        await evolucaoService.create({
          animalId,
          descricao: form.descricao.trim(),
          dataHoraRegistro: form.dataHoraRegistro,
          responsavel: form.responsavel.trim(),
        })
        toast.success("Evolução registrada com sucesso!")
      }
      setForm({ descricao: "", dataHoraRegistro: getLocalIso(), responsavel: form.responsavel })
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar evolução")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <ModalShell
      isOpen={isOpen}
      onClose={handleAttemptClose}
      title={evolucaoEdit ? "Editar Evolução" : "Registrar Evolução"}
      icon={<FileText className="h-4 w-4" />}
      iconBg="violet"
      showCancelModal={showCancelModal}
      onCancelModalClose={closeCancelModal}
      onCancelModalConfirm={handleConfirmCancelWithReset}
      footerProps={{
        onCancel: handleAttemptClose,
        onSave: canEdit ? handleSave : undefined,
        onDelete: evolucaoEdit?.id && canGerenciar ? () => setShowDeleteConfirm(true) : undefined,
        deleteLabel: "Excluir",
        saveLabel: "Salvar evolução",
        saving
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Data e hora do registro" required>
          <DateTimePicker
            date={form.dataHoraRegistro ? new Date(form.dataHoraRegistro) : undefined}
            setDate={(date) => {
              if (date) {
                const pad = (n: number) => n.toString().padStart(2, "0")
                const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
                setForm((f) => ({ ...f, dataHoraRegistro: localIso }))
              } else {
                setForm((f) => ({ ...f, dataHoraRegistro: "" }))
              }
            }}
            disabled={!canEdit}
          />
        </FormField>

        <ResponsavelSelect
          disabled={!canEdit}
          value={form.responsavel}
          onChange={(nome) => setForm((f) => ({ ...f, responsavel: nome }))}
          required
        />
      </div>

      <FormField label="Descrição" required>
        <Textarea
          disabled={!canEdit}
          value={form.descricao}
          onChange={(e) =>
            setForm((f) => ({ ...f, descricao: e.target.value }))
          }
          rows={6}
          placeholder="Descreva a evolução clínica do animal"
          className="bg-white"
        />
      </FormField>
    </ModalShell>
    <DeleteConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
      title="Excluir Evolução"
      description="Deseja realmente excluir este registro de evolução clínica? Esta ação é definitiva e não poderá ser desfeita."
      loading={deleting}
    />
  </>
  )
}
