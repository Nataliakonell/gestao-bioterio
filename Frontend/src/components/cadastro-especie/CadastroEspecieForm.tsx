import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { especieService } from "@/services/EspecieService"
import api from "@/services/api"
import { Loader2 } from "lucide-react"
import { CancelConfirmModal } from "@/components/ui/cancel-confirm-modal"

export interface Grupo {
  id: number;
  nome: string;
}

export interface CadastroEspecieFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export function CadastroEspecieForm({
  onSuccess,
  onCancel,
}: CadastroEspecieFormProps) {
  const [nome, setNome] = useState("")
  const [nomePopular, setNomePopular] = useState("")
  const [grupoId, setGrupoId] = useState<number | "">("")
  const [grupos, setGrupos] = useState<Grupo[]>([])
  const [loading, setLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)

useEffect(() => {
    api.get<Grupo[]>("/Grupo")
      .then(res => setGrupos(res.data))
      .catch(() => setGrupos([]))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (grupoId === "") {
      toast.error("Selecione um grupo")
      return
    }
    setLoading(true)

    try {
      await especieService.create({ nome, nomePopular, grupoId: Number(grupoId) })
      toast.success("Espécie cadastrada com sucesso!")
      setIsRedirecting(true)
      setLoading(false)
      setNome("")
      setNomePopular("")
      setGrupoId("")
      setTimeout(() => {
        onSuccess()
      }, 1500)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro ao cadastrar espécie"
      toast.error(errorMessage)
      setLoading(false)
    }
  }

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const handleCancelClick = () => {
    const isDirty = nome !== "" || nomePopular !== "" || grupoId !== ""
    if (isDirty) {
      setIsCancelModalOpen(true)
    } else {
      onCancel()
    }
  }

  const confirmCancel = () => {
    setIsCancelModalOpen(false)
    onCancel()
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome Científico *
        </label>
        <Input
          type="text"
          placeholder="Ex: Bothrops jararaca"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome Popular *
        </label>
        <Input
          type="text"
          placeholder="Ex: Jararaca"
          value={nomePopular}
          onChange={(e) => setNomePopular(e.target.value)}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Grupo *
        </label>
        <select
          className="block w-full border border-gray-300 rounded px-3 py-2"
          value={grupoId}
          onChange={e => setGrupoId(e.target.value === "" ? "" : Number(e.target.value))}
          required
        >
          <option value="">Selecione o grupo da espécie</option>
          {grupos.map(g => (
            <option key={g.id} value={g.id}>{g.nome}</option>
          ))}
        </select>    
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelClick}
          disabled={loading || isRedirecting}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={loading || isRedirecting}
          className="bg-blue-600 hover:bg-blue-700 gap-2 flex items-center justify-center"
        >
          {isRedirecting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Espécie"
          )}
        </Button>
      </div>
    </form>
    
    <CancelConfirmModal
      isOpen={isCancelModalOpen}
      onClose={() => setIsCancelModalOpen(false)}
      onConfirm={confirmCancel}
    />
    </>
  )
}
