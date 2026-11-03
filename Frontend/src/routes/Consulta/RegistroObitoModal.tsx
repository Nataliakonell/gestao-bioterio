import { useState, useEffect } from "react"
import { ArrowLeft, Skull, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { parseDateInput } from "@/lib/date"
import { registroObitoService, type RegistroObitoDetailVm } from "@/services/RegistroObitoService"
import { RegistroObitoForm, type RegistroObitoFormData } from "./RegistroObitoForm"
import { usePermissions } from "@/contexts/PermissionsContext"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"

interface RegistroObitoModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  registroObitoParaEditar?: RegistroObitoDetailVm | null
  onSaved?: () => void
  onBack?: () => void
}

export function RegistroObitoModal({
  isOpen,
  onClose,
  animalId,
  registroObitoParaEditar,
  onSaved,
  onBack,
}: RegistroObitoModalProps) {
  const { hasPermission } = usePermissions()
  const canGerenciar = hasPermission("Atendimento veterinário", "Gerenciar")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [data, setData] = useState<RegistroObitoFormData>({
    dataObito: new Date().toISOString(),
    houveNecropsia: false,
    observacoes: "",
  })

  useEffect(() => {
    if (!isOpen) return
    if (registroObitoParaEditar) {
      setData({
        id: registroObitoParaEditar.id,
        dataObito: registroObitoParaEditar.dataObito ? registroObitoParaEditar.dataObito.split("T")[0] : new Date().toISOString(),
        houveNecropsia: Boolean(registroObitoParaEditar.houveNecropsia),
        observacoes: registroObitoParaEditar.observacoes || "",
      })
    } else {
      setData({
        dataObito: new Date().toISOString(),
        houveNecropsia: false,
        observacoes: "",
      })
    }
  }, [isOpen, registroObitoParaEditar])

  const isDirty = Boolean(data.observacoes.trim() || data.houveNecropsia)
  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleDelete = async () => {
    if (!data.id) return
    try {
      setDeleting(true)
      await registroObitoService.delete(data.id)
      toast.success("Registro de óbito excluído com sucesso!")
      setShowDeleteConfirm(false)
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || "Erro ao excluir registro de óbito")
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!data.dataObito) {
      toast.error("Informe a data do óbito.")
      return
    }

    try {
      setSaving(true)
      const base = {
        animalId,
        dataObito: parseDateInput(data.dataObito),
        houveNecropsia: data.houveNecropsia,
        observacoes: data.observacoes.trim() || undefined,
      }

      if (data.id) {
        await registroObitoService.update({ id: data.id, ...base })
        toast.success("Registro de óbito atualizado com sucesso!")
      } else {
        await registroObitoService.create(base)
        toast.success("Óbito registrado com sucesso e situação do animal atualizada!")
      }
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.response?.data?.message || e.message || "Erro ao registrar óbito")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={handleAttemptClose}
        title="Registro de Óbito"
        icon={<Skull className="h-5 w-5" />}
        iconBg="red"
        showCancelModal={showCancelModal}
        onCancelModalClose={closeCancelModal}
        onCancelModalConfirm={handleConfirmCancel}
        footerProps={{
          align: "between",
          onCancel: handleAttemptClose,
          onSave: canGerenciar ? handleSave : undefined,
          saveLabel: "Confirmar Óbito",
          saving,
          leftActions: (
            <div className="flex items-center gap-2">
              {onBack && (
                <Button variant="ghost" onClick={onBack} disabled={saving || deleting} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
              )}
              {Boolean(data.id) && canGerenciar && (
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
        <RegistroObitoForm data={data} setData={setData} />
      </ModalShell>

      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir Registro de Óbito"
        description="Deseja realmente excluir este registro de óbito? Esta ação é definitiva."
        loading={deleting}
      />
    </>
  )
}
