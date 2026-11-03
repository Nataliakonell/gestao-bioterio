import React, { useState } from "react"
import { createPortal } from "react-dom"
import ReactSelect, { components, type MenuListProps } from "react-select"
import { Plus, X } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { medicacaoService, type MedicacaoLookupVm } from "@/services/MedicacaoService"

interface SeletorMedicacaoProps {
  value: string
  onChange: (medicacaoId: string) => void
  medicacoes: MedicacaoLookupVm[]
  setMedicacoes: React.Dispatch<React.SetStateAction<MedicacaoLookupVm[]>>
  disabled?: boolean
  placeholder?: string
}

interface NovaMedicacaoModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (newMed: MedicacaoLookupVm) => void
}

export function NovaMedicacaoModal({
  isOpen,
  onClose,
  onSuccess,
}: NovaMedicacaoModalProps) {
  const [principioAtivo, setPrincipioAtivo] = useState("")
  const [nomeComercial, setNomeComercial] = useState("")
  const [loading, setLoading] = useState(false)

  React.useEffect(() => {
    if (isOpen) {
      setPrincipioAtivo("")
      setNomeComercial("")
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSave = async (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    const pa = principioAtivo.trim()
    const nc = nomeComercial.trim()

    if (!pa) {
      toast.error("O Princípio Ativo é obrigatório.")
      return
    }
    if (!nc) {
      toast.error("O Nome Comercial é obrigatório.")
      return
    }

    setLoading(true)
    try {
      const response = await medicacaoService.create({
        principioAtivo: pa,
        nomeComercial: nc,
      })

      const newMed: MedicacaoLookupVm = {
        id: response.id || response.medicacao?.id,
        principioAtivo: response.medicacao?.principioAtivo || pa,
        nomeComercial: response.medicacao?.nomeComercial || nc,
      }

      toast.success("Medicação cadastrada com sucesso!")
      onSuccess(newMed)
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Erro ao cadastrar medicação.")
    } finally {
      setLoading(false)
    }
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      />

      {/* Modal Content */}
      <div
        className="relative w-full max-w-md scale-100 rounded-2xl border border-gray-100 bg-white p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
          <h3 className="text-lg font-semibold text-gray-900">Nova Medicação</h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            className="text-gray-400 hover:text-gray-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Princípio Ativo <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={principioAtivo}
              onChange={(e) => setPrincipioAtivo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSave(e)
                }
              }}
              placeholder="Digite o princípio ativo..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white h-10"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Comercial <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nomeComercial}
              onChange={(e) => setNomeComercial(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  e.stopPropagation()
                  handleSave(e)
                }
              }}
              placeholder="Digite o nome comercial..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100 transition bg-white h-10"
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              disabled={loading}
              className="rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50 h-10 px-4"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                handleSave(e)
              }}
              disabled={loading}
              className="rounded-xl bg-blue-800 hover:bg-blue-900 text-white h-10 px-4 shadow-sm"
            >
              {loading ? "Salvar..." : "Salvar"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

export default function SeletorMedicacao({
  value,
  onChange,
  medicacoes,
  setMedicacoes,
  disabled = false,
  placeholder = "Selecione uma medicação...",
}: SeletorMedicacaoProps) {
  const [modalOpen, setModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  const options = medicacoes.map((m) => ({
    value: String(m.id),
    label: `${m.principioAtivo} - ${m.nomeComercial}`,
  }))

  const selectedOption = options.find((opt) => opt.value === value) || null

  const handleOpenModal = () => {
    setModalOpen(true)
  }

  const CustomMenuList = (props: MenuListProps<any>) => {
    return (
      <components.MenuList {...props}>
        {props.children}
        <div className="border-t border-gray-100 p-1">
          <button
            type="button"
            className="flex items-center gap-2 w-full px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
            onMouseDown={(e) => {
              e.preventDefault()
              handleOpenModal()
            }}
          >
            <Plus className="w-4 h-4 text-blue-600" />
            Adicionar nova medicação
          </button>
        </div>
      </components.MenuList>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <ReactSelect
            isDisabled={disabled}
            options={options}
            value={selectedOption}
            onInputChange={(val) => setSearchValue(val)}
            onChange={(selected: any) => onChange(selected ? selected.value : "")}
            placeholder={placeholder}
            noOptionsMessage={() => "Nenhuma medicação encontrada"}
            components={{ MenuList: CustomMenuList }}
            className="react-select-container"
            classNamePrefix="react-select"
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: state.isFocused ? "hsl(var(--ring))" : "hsl(var(--input))",
                borderRadius: "0.5rem",
                minHeight: "2.25rem",
                height: "2.25rem",
                boxShadow: "none",
                backgroundColor: disabled ? "hsl(var(--muted))" : "hsl(var(--card))",
                "&:hover": { borderColor: "hsl(var(--border))" },
              }),
              valueContainer: (base) => ({
                ...base,
                height: "2.25rem",
                padding: "0 0.75rem",
              }),
              input: (base) => ({
                ...base,
                margin: 0,
                padding: 0,
                fontSize: "0.875rem",
                color: "hsl(var(--foreground))",
              }),
              indicatorsContainer: (base) => ({
                ...base,
                height: "2.25rem",
              }),
              singleValue: (base) => ({
                ...base,
                fontSize: "0.875rem",
                color: "hsl(var(--foreground))",
              }),
              placeholder: (base) => ({
                ...base,
                fontSize: "0.875rem",
                color: "hsl(var(--muted-foreground))",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                boxShadow:
                  "0 4px 6px -1px rgba(0,0,0,0.2), 0 2px 4px -1px rgba(0,0,0,0.1)",
                overflow: "hidden",
                zIndex: 9999,
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--border))",
              }),
              menuList: (base) => ({
                ...base,
                backgroundColor: "hsl(var(--popover))",
                padding: "4px",
              }),
              option: (base, state) => ({
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
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                borderRadius: "0.25rem",
              }),
            }}
          />
        </div>

        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            handleOpenModal()
          }}
          title="Cadastrar nova medicação"
          className="h-[2.25rem] px-3 shrink-0 rounded-lg border-gray-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 font-medium text-xs flex items-center gap-1.5 whitespace-nowrap"
        >
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Nova Medicação</span>
        </Button>
      </div>

      <NovaMedicacaoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={(newMed) => {
          setMedicacoes((prev) => {
            if (prev.some((m) => m.id === newMed.id)) return prev
            return [...prev, newMed]
          })
          onChange(String(newMed.id))
        }}
      />
    </>
  )
}
