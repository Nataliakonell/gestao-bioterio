import { useState, useEffect } from "react"
import { Scissors } from "lucide-react"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import CreatableSelect from "react-select/creatable"
import { FormField } from "@/components/ui/form-field"
import { ModalShell } from "@/components/ui/modal-shell"
import { useModalControls } from "@/hooks/useModalControls"
import { procedimentoService } from "@/services/ProcedimentoService"
import { tipoProcedimentoService, type TipoProcedimentoLookupVm } from "@/services/TipoProcedimentoService"
import { getUserInfo } from "@/services/api"
import { Input } from "@/components/ui/input"
import { usePermissions } from "@/contexts/PermissionsContext"
import { ResponsavelSelect } from "@/components/clinico/ResponsavelSelect"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"
const reactSelectStyles = {
  control: (base: any) => ({
    ...base,
    borderColor: "hsl(var(--input))",
    "&:hover": { borderColor: "hsl(var(--border))" },
    boxShadow: "none",
    minHeight: "36px",
    height: "36px",
    borderRadius: "var(--radius)",
    fontSize: "0.875rem",
    backgroundColor: "hsl(var(--card))",
  }),
  valueContainer: (base: any) => ({ ...base, padding: "0 12px" }),
  placeholder: (base: any) => ({ ...base, color: "hsl(var(--muted-foreground))" }),
  singleValue: (base: any) => ({ ...base, color: "hsl(var(--foreground))" }),
  input: (base: any) => ({ ...base, color: "hsl(var(--foreground))" }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
    backgroundColor: "hsl(var(--popover))",
    border: "1px solid hsl(var(--border))",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)",
  }),
  menuList: (base: any) => ({
    ...base,
    backgroundColor: "hsl(var(--popover))",
    padding: "4px",
  }),
  option: (base: any, state: any) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "var(--brand-blue, #2563eb)"
      : state.isFocused
      ? "hsl(var(--accent))"
      : "transparent",
    color: state.isSelected
      ? "#ffffff"
      : state.isFocused
      ? "hsl(var(--accent-foreground))"
      : "hsl(var(--popover-foreground))",
    cursor: "pointer",
    borderRadius: "0.25rem",
    fontSize: "0.875rem",
  }),
};


interface ProcedimentoModalProps {
  isOpen: boolean
  onClose: () => void
  animalId: number
  onSaved?: () => void
  procedimentoEdit?: any
}

export function ProcedimentoModal({ isOpen, onClose, animalId, onSaved, procedimentoEdit }: ProcedimentoModalProps) {
  const { hasPermission } = usePermissions()
  const canGerenciar = hasPermission("Atendimento veterinário", "Gerenciar")
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const canEdit = hasPermission("Atendimento veterinário", "Editar")
  const [tipos, setTipos] = useState<TipoProcedimentoLookupVm[]>([])
  const [loadingTipos, setLoadingTipos] = useState(true)
  const [form, setForm] = useState({ tipoProcedimentoId: "", descricao: "", responsavel: "" })

  const handleCreateTipoProcedimento = async (inputValue: string) => {
  const trimmed = inputValue.trim()

  if (!trimmed) return

  const jaExiste = tipos.some(
    (tipo) =>
      tipo.nome.trim().toLowerCase() === trimmed.toLowerCase()
  )

  if (jaExiste) {
    toast.error("Este tipo de procedimento já está cadastrado.")
    return
  }

  try {
    const novoTipo = await tipoProcedimentoService.create({
      nome: trimmed,
    })

    setTipos((prev) => [...prev, novoTipo])

    setForm((f) => ({
      ...f,
      tipoProcedimentoId: novoTipo.id.toString(),
    }))

    toast.success("Tipo de procedimento adicionado!")
  } catch (e: any) {
    toast.error(
      e.message || "Erro ao adicionar tipo de procedimento"
    )
  }
}

  useEffect(() => {
    if (!isOpen) return
    setLoadingTipos(true)
    tipoProcedimentoService
      .getLookup()
      .then(setTipos)
      .catch(() => toast.error("Erro ao carregar tipos de procedimento"))
      .finally(() => setLoadingTipos(false))
    if (procedimentoEdit) {
      setForm({
        tipoProcedimentoId: procedimentoEdit.tipoProcedimentoId?.toString() || "",
        descricao: procedimentoEdit.descricao || "",
        responsavel: procedimentoEdit.responsavel || procedimentoEdit.rf || getUserInfo()?.name || "",
      })
    } else {
      const user = getUserInfo()
      setForm({ tipoProcedimentoId: "", descricao: "", responsavel: user?.name || "" })
    }
  }, [isOpen, procedimentoEdit])

  const isDirty = Boolean(form.tipoProcedimentoId || form.descricao.trim())
  const { saving, setSaving, showCancelModal, handleAttemptClose, handleConfirmCancel, closeCancelModal } =
    useModalControls(isDirty, onClose)

  const handleConfirmCancelWithReset = () => {
    setForm({ tipoProcedimentoId: "", descricao: "", responsavel: "" })
    handleConfirmCancel()
  }

  const handleDelete = async () => {
    if (!procedimentoEdit?.id) return
    try {
      setDeleting(true)
      await procedimentoService.delete(procedimentoEdit.id)
      toast.success("Procedimento excluído com sucesso!")
      setShowDeleteConfirm(false)
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao excluir procedimento")
    } finally {
      setDeleting(false)
    }
  }

  const handleSave = async () => {
    if (!form.tipoProcedimentoId) {
      toast.error("Selecione o tipo de procedimento.")
      return
    }
    if (!form.descricao.trim()) {
      toast.error("Informe a descrição do procedimento.")
      return
    }
    try {
      setSaving(true)
      if (procedimentoEdit) {
        await procedimentoService.update({
          id: procedimentoEdit.id,
          animalId,
          tipoProcedimentoId: Number(form.tipoProcedimentoId),
          descricao: form.descricao.trim(),
          responsavel: form.responsavel.trim() || undefined,
        })
        toast.success("Procedimento atualizado com sucesso!")
      } else {
        await procedimentoService.create({
          animalId,
          tipoProcedimentoId: Number(form.tipoProcedimentoId),
          descricao: form.descricao.trim(),
          responsavel: form.responsavel.trim() || undefined,
        })
        toast.success("Procedimento registrado com sucesso!")
      }
      onSaved?.()
      onClose()
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar procedimento")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
    <ModalShell
      isOpen={isOpen}
      onClose={handleAttemptClose}
      title={procedimentoEdit ? "Editar Procedimento" : "Registrar Procedimento"}
      icon={<Scissors className="h-4 w-4" />}
      iconBg="blue"
      showCancelModal={showCancelModal}
      onCancelModalClose={closeCancelModal}
      onCancelModalConfirm={handleConfirmCancelWithReset}
      footerProps={{
        onCancel: handleAttemptClose,
        onSave: canEdit ? handleSave : undefined,
        onDelete: procedimentoEdit?.id && canGerenciar ? () => setShowDeleteConfirm(true) : undefined,
        deleteLabel: "Excluir",
        saveLabel: "Salvar procedimento",
        saving
      }}
    >

      <FormField label="Tipo de procedimento" required>
  <CreatableSelect
    isDisabled={loadingTipos || !canEdit} 
    isLoading={loadingTipos}
    placeholder={loadingTipos ? "Carregando..." : "Selecione ou digite"}
    formatCreateLabel={(value) => `Adicionar "${value}" +`}
    options={tipos
      .slice()
      .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"))
      .map((tipo) => ({
        value: tipo.id.toString(),
        label: tipo.nome,
      }))}
    value={
      tipos
        .map((tipo) => ({
          value: tipo.id.toString(),
          label: tipo.nome,
        }))
        .find(
          (option) => option.value === form.tipoProcedimentoId
        ) || null
    }
    onChange={(value) => 
      setForm((f) => ({
        ...f,
        tipoProcedimentoId: value?.value || "",
      }))
    }
    onCreateOption={handleCreateTipoProcedimento}
    isClearable
    className="react-select-container"
    classNamePrefix="react-select"
    styles={reactSelectStyles}
  />  
      </FormField>
      <FormField label="Descrição" required>
        <Textarea
          disabled={!canEdit}
          value={form.descricao}
          onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
          rows={4}
          placeholder="Descreva o procedimento realizado"
          className="bg-white"
        />
      </FormField>
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
      title="Excluir Procedimento"
      description="Deseja realmente excluir este registro de procedimento? Esta ação é definitiva e não poderá ser desfeita."
      loading={deleting}
    />
  </>
  )
}
