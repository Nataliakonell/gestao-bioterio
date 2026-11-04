import { useState, useEffect } from "react"
import { ArrowLeft, BriefcaseMedical, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { DateTimePicker } from "@/components/ui/datetime-picker"
import { FormField } from "@/components/ui/form-field"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { getLocalIso, toLocalIso } from "@/lib/date"
import { localizacaoService, type LocalizacaoListVm } from "@/services/localizacaoService"
import { consultaService, type ConsultaListVm } from "@/services/ConsultaService"
import { animalService } from "@/services/animalService"
import { getUserInfo } from "@/services/api"
import { usePermissions } from "@/contexts/PermissionsContext"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"

interface ConsultaFormModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  onSaved?: () => void
  editingConsulta?: ConsultaListVm | null
  onBack?: () => void
}

export function ConsultaFormModal({ isOpen, onClose, animalId, onSaved, editingConsulta, onBack }: ConsultaFormModalProps) {
  const { hasPermission } = usePermissions()
  const canEdit = hasPermission("Atendimento veterinário", "Editar")
  const canGerenciar = hasPermission("Atendimento veterinário", "Gerenciar")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [instalacoes, setInstalacoes] = useState<LocalizacaoListVm[]>([])
  const [loadingInstalacoes, setLoadingInstalacoes] = useState(true)
  const [form, setForm] = useState({
    anamnese: "",
    exameFisico: "",
    suspeitaDiagnostica: "",
    instalacaoBioterioId: "",
    dataHoraConsulta: getLocalIso(),
    responsavel: "",
  })

  useEffect(() => {
    if (!isOpen) return
    localizacaoService.getAll().then(setInstalacoes).catch(() => toast.error("Erro ao carregar instalações")).finally(() => setLoadingInstalacoes(false))
    const user = getUserInfo()
    setForm((f) => ({ ...f, responsavel: user?.name || f.responsavel }))
  }, [isOpen])

  useEffect(() => {
    if (editingConsulta) {
      setForm({
        anamnese: editingConsulta.anamnese || "",
        exameFisico: editingConsulta.exameFisico || "",
        suspeitaDiagnostica: editingConsulta.suspeitaDiagnostica || "",
        instalacaoBioterioId: editingConsulta.instalacaoBioterioId ? String(editingConsulta.instalacaoBioterioId) : "",
        dataHoraConsulta: editingConsulta.dataHoraConsulta ? toLocalIso(editingConsulta.dataHoraConsulta) : getLocalIso(),
        responsavel: editingConsulta.responsavel || editingConsulta.rf || user?.name || "",
      })
    } else if (isOpen) {
      const localIso = getLocalIso()
      setForm((f) => ({
        anamnese: "",
        exameFisico: "",
        suspeitaDiagnostica: "",
        instalacaoBioterioId: "",
        dataHoraConsulta: localIso,
        responsavel: f.responsavel,
      }))
      if (animalId) {
        animalService
          .getById(animalId)
          .then((res) => {
            if ((res as any)?.localizacaoId || res?.instalacaoBioterioId) setForm((f) => ({ ...f, instalacaoBioterioId: String((res as any)?.localizacaoId || res.instalacaoBioterioId) }))
          })
          .catch(() => { })
      }
    }
  }, [editingConsulta, isOpen, animalId])

  const isDirty = Boolean(form.anamnese.trim() || form.exameFisico.trim() || form.suspeitaDiagnostica.trim())
  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleDelete = async () => {
    if (!editingConsulta?.id) return
    try {
      setDeleting(true)
      await consultaService.delete(editingConsulta.id)
      toast.success("Consulta excluída com sucesso!")
      setShowDeleteConfirm(false)
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir consulta")
    } finally {
      setDeleting(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.dataHoraConsulta) {
      toast.error("Informe a data e hora da consulta.")
      return
    }
    try {
      setSaving(true)
      const payload = {
        animalId,
        anamnese: form.anamnese || undefined,
        exameFisico: form.exameFisico || undefined,
        suspeitaDiagnostica: form.suspeitaDiagnostica || undefined,
        instalacaoBioterioId: form.instalacaoBioterioId ? Number(form.instalacaoBioterioId) : undefined,
        dataHoraConsulta: form.dataHoraConsulta,
        responsavel: form.responsavel || undefined,
      }
      if (editingConsulta) {
        await consultaService.update({ id: editingConsulta.id, ...payload })
        toast.success("Consulta atualizada com sucesso!")
      } else {
        await consultaService.create(payload)
        toast.success("Consulta registrada com sucesso!")
      }
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar consulta")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <ModalShell
        isOpen={isOpen}
        onClose={handleAttemptClose}
        title={editingConsulta ? "Editar Consulta" : "Nova Consulta"}
        icon={<BriefcaseMedical className="h-4 w-4" />}
        iconBg="blue"
        size="lg"
        animated
        showCancelModal={showCancelModal}
        onCancelModalClose={closeCancelModal}
        onCancelModalConfirm={handleConfirmCancel}
        footerProps={{
          align: "between",
          onCancel: handleAttemptClose,
          onSave: canEdit ? handleSubmit : undefined,
          saveLabel: editingConsulta ? "Salvar alterações" : "Registrar consulta",
          saving: saving || deleting,
          leftActions: (
            <div className="flex items-center gap-2">
              {onBack && (
                <Button variant="ghost" onClick={onBack} disabled={saving || deleting} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
              )}
              {editingConsulta?.id && canGerenciar && (
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Data e hora da consulta" required>
            <DateTimePicker
              date={form.dataHoraConsulta ? new Date(form.dataHoraConsulta) : undefined}
              setDate={(date) => {
                if (date) {
                  const pad = (n: number) => n.toString().padStart(2, "0")
                  const localIso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
                  setForm((f) => ({ ...f, dataHoraConsulta: localIso }))
                } else {
                  setForm((f) => ({ ...f, dataHoraConsulta: "" }))
                }
              }}
              disabled={!canEdit}
            />
          </FormField>
          <FormField label="Local / Instalação">
            <SearchableSelect
              options={instalacoes.sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")).map((i) => ({ value: String(i.id), label: i.nome }))}
              value={form.instalacaoBioterioId}
              isDisabled={loadingInstalacoes || !canEdit}
              onChange={(v) => setForm((f) => ({ ...f, instalacaoBioterioId: v }))}
              placeholder={loadingInstalacoes ? "Carregando..." : "Selecione o local"}
              isClearable
            />
          </FormField>
        </div>
        <FormField label="Anamnese">
          <Textarea disabled={!canEdit} value={form.anamnese} onChange={(e) => setForm((f) => ({ ...f, anamnese: e.target.value }))} rows={4} placeholder="História e motivo do atendimento" className="bg-white" />
        </FormField>
        <FormField label="Exame físico">
          <Textarea disabled={!canEdit} value={form.exameFisico} onChange={(e) => setForm((f) => ({ ...f, exameFisico: e.target.value }))} rows={4} placeholder="Achados do exame físico" className="bg-white" />
        </FormField>
        <FormField label="Suspeita diagnóstica">
          <Textarea disabled={!canEdit} value={form.suspeitaDiagnostica} onChange={(e) => setForm((f) => ({ ...f, suspeitaDiagnostica: e.target.value }))} rows={4} placeholder="Diagnóstico / suspeita" className="bg-white" />
        </FormField>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResponsavelSelect
            disabled={!canEdit}
            value={form.responsavel}
            onChange={(nome) => setForm((f) => ({ ...f, responsavel: nome }))}
            required
          />
        </div>
      </ModalShell>
      <DeleteConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Excluir Consulta"
        description="Deseja realmente excluir este registro de consulta? Esta ação é definitiva e não poderá ser desfeita."
        loading={deleting}
      />
    </>
  )
}
