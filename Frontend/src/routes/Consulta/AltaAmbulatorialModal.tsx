import { useState, useEffect } from "react"
import { ArrowLeft, BriefcaseMedical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { parseDateInput } from "@/lib/date"
import { altaAmbulatoriaService } from "@/services/AltaAmbulatoriaService"
import { getUserInfo } from "@/services/api"
import { AltaAmbulatorial, type AltaData } from "./AltaAmbulatorial"
import { localizacaoService, type LocalizacaoListVm } from "@/services/localizacaoService"
import { usePermissions } from "@/contexts/PermissionsContext"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"

interface AltaAmbulatorialModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  altaParaEditar?: import("@/services/AltaAmbulatoriaService").AltaAmbulatoriaDetailVm | null
  onSaved?: () => void
  onBack?: () => void
}

export function AltaAmbulatorialModal({ isOpen, onClose, animalId, altaParaEditar, onSaved, onBack }: AltaAmbulatorialModalProps) {
  const { hasPermission } = usePermissions()
  const canGerenciar = hasPermission("Atendimento veterinário", "Gerenciar")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [instalacoes, setInstalacoes] = useState<LocalizacaoListVm[]>([])
  const [altaData, setAltaData] = useState<AltaData>({
    dataEntradaAmbulatorio: "",
    dataAltaClinica: "",
    procedimentosMedicacoes: "",
    observacoesClinicas: "",
    instalacaoBioterioRetornoId: "",
    responsavel: "",
  })

  useEffect(() => {
    if (!isOpen) return
    localizacaoService.getAll().then(setInstalacoes).catch(() => {})
    const user = getUserInfo()
    if (altaParaEditar) {
      setAltaData({
        id: altaParaEditar.id,
        dataEntradaAmbulatorio: altaParaEditar.dataEntradaAmbulatorio ? altaParaEditar.dataEntradaAmbulatorio.split("T")[0] : "",
        dataAltaClinica: altaParaEditar.dataAltaClinica ? altaParaEditar.dataAltaClinica.split("T")[0] : "",
        procedimentosMedicacoes: altaParaEditar.procedimentosMedicacoes || "",
        observacoesClinicas: altaParaEditar.observacoesClinicas || "",
        instalacaoBioterioRetornoId: altaParaEditar.instalacaoBioterioRetornoId ? String(altaParaEditar.instalacaoBioterioRetornoId) : "",
        responsavel: (altaParaEditar as any).responsavel || altaParaEditar.rf || user?.name || "",
      })
    } else {
      setAltaData({ dataEntradaAmbulatorio: "", dataAltaClinica: "", procedimentosMedicacoes: "", observacoesClinicas: "", instalacaoBioterioRetornoId: "", responsavel: user?.name || "" })
    }
  }, [isOpen, altaParaEditar])

  const isDirty = Boolean(
    altaData.dataEntradaAmbulatorio || altaData.dataAltaClinica || altaData.procedimentosMedicacoes.trim() || altaData.observacoesClinicas.trim()
  )
  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleDelete = async () => {
    if (!altaData.id) return
    try {
      setDeleting(true)
      await altaAmbulatoriaService.delete(altaData.id)
      toast.success("Alta ambulatorial excluída com sucesso!")
      setShowDeleteConfirm(false)
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir alta ambulatorial")
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!altaData.dataEntradaAmbulatorio) {
      toast.error("Informe a data de entrada no ambulatório.")
      return
    }
    if (!altaData.dataAltaClinica) {
      toast.error("Informe a data da alta clínica.")
      return
    }
    if (altaData.dataAltaClinica && altaData.dataEntradaAmbulatorio) {
      const dEntrada = altaData.dataEntradaAmbulatorio.slice(0, 10)
      const dAlta = altaData.dataAltaClinica.slice(0, 10)
      if (dAlta < dEntrada) {
        toast.error("A data da alta não pode ser antes da entrada.")
        return
      }
    }
    try {
      setSaving(true)
      const retornoId = altaData.instalacaoBioterioRetornoId ? Number(altaData.instalacaoBioterioRetornoId) : undefined
      const base = {
        animalId,
        dataEntradaAmbulatorio: parseDateInput(altaData.dataEntradaAmbulatorio),
        dataAltaClinica: parseDateInput(altaData.dataAltaClinica),
        procedimentosMedicacoes: altaData.procedimentosMedicacoes || undefined,
        observacoesClinicas: altaData.observacoesClinicas || undefined,
        instalacaoBioterioRetornoId: retornoId && !isNaN(retornoId) ? retornoId : undefined,
        localizacaoDestinoId: retornoId && !isNaN(retornoId) ? retornoId : undefined,
        responsavel: altaData.responsavel.trim() || undefined,
      }
      if (altaData.id) {
        await altaAmbulatoriaService.update({ id: altaData.id, ...base })
        toast.success("Alta ambulatorial atualizada com sucesso!")
      } else {
        await altaAmbulatoriaService.create(base)
        toast.success("Alta ambulatorial registrada com sucesso!")
      }
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar alta")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <ModalShell
      isOpen={isOpen}
      onClose={handleAttemptClose}
      title="Alta Ambulatorial"
      icon={<BriefcaseMedical className="h-4 w-4" />}
      iconBg="blue"
      showCancelModal={showCancelModal}
      onCancelModalClose={closeCancelModal}
      onCancelModalConfirm={handleConfirmCancel}
      footerProps={{
        align: "between",
        onCancel: handleAttemptClose,
        onSave: hasPermission("Atendimento veterinário", "Gerenciar") ? handleSave : undefined,
        saveLabel: "Salvar alta",
        saving,
        leftActions: (
          <div className="flex items-center gap-2">
            {onBack && (
              <Button variant="ghost" onClick={onBack} disabled={saving || deleting} className="gap-2">
                <ArrowLeft className="h-4 w-4" /> Voltar
              </Button>
            )}
            {Boolean(altaData.id) && canGerenciar && (
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
      <AltaAmbulatorial altaData={altaData} setAltaData={setAltaData} instalacoes={instalacoes} />
    </ModalShell>
    <DeleteConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
      title="Excluir Alta Ambulatorial"
      description="Deseja realmente excluir este registro de alta ambulatorial? Esta ação é definitiva e não poderá ser desfeita."
      loading={deleting}
    />
  </>
  )
}
