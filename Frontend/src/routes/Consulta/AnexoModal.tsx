import { useState, useEffect } from "react"
import { Paperclip } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FormField } from "@/components/ui/form-field"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { anexoService } from "@/services/AnexoService"
import { getUserInfo } from "@/services/api"
import { usePermissions } from "@/contexts/PermissionsContext"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"

interface AnexoModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  onSaved?: () => void
  anexoEdit?: any
}

export function AnexoModal({ isOpen, onClose, animalId, onSaved, anexoEdit }: AnexoModalProps) {
  const { hasPermission } = usePermissions()
  const canGerenciar = hasPermission("Atendimento veterinário", "Gerenciar")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canEdit = hasPermission("Atendimento veterinário", "Editar")
  const [form, setForm] = useState({ nomeArquivoAnexo: "", descricao: "", responsavel: "", arquivo: null as File | null })

  useEffect(() => {
    if (!isOpen) return
    if (anexoEdit) {
      setForm({
        nomeArquivoAnexo: anexoEdit.nomeArquivoAnexo || "",
        descricao: anexoEdit.descricao || "",
        responsavel: anexoEdit.responsavel || anexoEdit.rf || getUserInfo()?.name || "",
        arquivo: null
      })
    } else {
      const user = getUserInfo()
      setForm({ nomeArquivoAnexo: "", descricao: "", responsavel: user?.name || "", arquivo: null })
    }
  }, [isOpen, anexoEdit])

  const isDirty = Boolean(form.nomeArquivoAnexo.trim() || form.descricao.trim() || form.arquivo)
  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleConfirmCancelWithReset = () => {
    setForm({ nomeArquivoAnexo: "", descricao: "", responsavel: "", arquivo: null })
    handleConfirmCancel()
  }

  const handleDelete = async () => {
    if (!anexoEdit?.id) return
    try {
      setDeleting(true)
      await anexoService.delete(anexoEdit.id)
      toast.success("Documento anexado excluído com sucesso!")
      setShowDeleteConfirm(false)
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir anexo")
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!form.nomeArquivoAnexo.trim() && !form.descricao.trim() && !form.arquivo) {
      toast.error("Informe o nome do arquivo ou a descrição.")
      return
    }
    try {
      setSaving(true)
      if (anexoEdit) {
        await anexoService.update({
          id: anexoEdit.id,
          animalId,
          nomeArquivoAnexo: form.nomeArquivoAnexo.trim() || undefined,
          descricao: form.descricao.trim() || undefined,
          responsavel: form.responsavel.trim() || undefined,
        })
        toast.success("Documento anexado atualizado com sucesso!")
      } else {
        await anexoService.create({
          animalId,
          nomeArquivoAnexo: form.nomeArquivoAnexo.trim() || undefined,
          descricao: form.descricao.trim() || undefined,
          responsavel: form.responsavel.trim() || undefined,
          arquivo: form.arquivo,
        })
        toast.success("Documento anexado com sucesso!")
      }
      setForm({ nomeArquivoAnexo: "", descricao: "", responsavel: "", arquivo: null })
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar anexo")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <ModalShell
      isOpen={isOpen}
      onClose={handleAttemptClose}
      title={anexoEdit ? "Editar Anexo" : "Anexar Documento"}
      icon={<Paperclip className="h-4 w-4" />}
      iconBg="slate"
      showCancelModal={showCancelModal}
      onCancelModalClose={closeCancelModal}
      onCancelModalConfirm={handleConfirmCancelWithReset}
      footerProps={{
        onCancel: handleAttemptClose,
        onSave: canEdit ? handleSave : undefined,
        onDelete: anexoEdit?.id && canGerenciar ? () => setShowDeleteConfirm(true) : undefined,
        deleteLabel: "Excluir",
        saveLabel: "Salvar anexo",
        saving,
      }}
    >

      <FormField label="Nome do arquivo / Título">
        <Input
          value={form.nomeArquivoAnexo}
          onChange={(e) => setForm((f) => ({ ...f, nomeArquivoAnexo: e.target.value }))}
          placeholder="Ex: raio-x-torax.pdf, laudo.pdf"
          className="bg-white"
        />
      </FormField>
      <FormField label="Descrição">
        <Textarea
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          rows={4}
          placeholder="Descrição do documento anexado"
          className="bg-white"
        />
      </FormField>
      {!anexoEdit && (
        <FormField label="Arquivo" required>
          <div className="flex items-center w-full border border-input rounded-md bg-background overflow-hidden h-10 shadow-sm focus-within:ring-1 focus-within:ring-ring">
            <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-primary-foreground px-4 h-full flex items-center justify-center text-sm font-medium transition-colors">
              Selecionar o Arquivo
              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;
                  setForm((f) => ({ ...f, arquivo: file, nomeArquivoAnexo: file ? file.name : f.nomeArquivoAnexo }));
                }}
              />
            </label>
            <span className="px-3 text-sm text-muted-foreground truncate flex-1 h-full flex items-center bg-transparent">
              {form.arquivo ? form.arquivo.name : ""}
            </span>
          </div>
        </FormField>
      )}
      <ResponsavelSelect
        disabled={!canEdit}
        value={form.responsavel}
        onChange={(nome) => setForm((f) => ({ ...f, responsavel: nome }))}
        required
      />    
    </ModalShell>
    <DeleteConfirmModal
      isOpen={showDeleteConfirm}
      onClose={() => setShowDeleteConfirm(false)}
      onConfirm={handleDelete}
      title="Excluir Anexo"
      description={`Deseja realmente excluir o anexo "${anexoEdit?.nomeArquivoAnexo || ''}"? Esta ação é definitiva e não poderá ser desfeita.`}
      loading={deleting}
    />
  </>
  )
}
