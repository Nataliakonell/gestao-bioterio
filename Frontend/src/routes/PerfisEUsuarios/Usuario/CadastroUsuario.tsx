import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FormLayoutBase } from "@/components/formulario-registro/CadastroRegistroForm"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { getPerfis, type Perfil } from "@/services/PerfilService"
import { createUsuario, getUsuarioById, updateUsuario, getDadosExternosPorRf, deleteUsuario } from "@/services/UsuarioService"
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal"

const RequiredMark = () => <span className="text-red-500"> *</span>

const initialFormData = {
  rf: "",
  nome: "",
  email: "",
  perfilId: "",
  status: true,
}

export default function CadastroUsuario() {
  const navigate = useNavigate()
  const { id } = useParams()
  
  const [formData, setFormData] = useState(initialFormData)
  const [perfis, setPerfis] = useState<Perfil[]>([])
  const [isLoadingRf, setIsLoadingRf] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    getPerfis()
      .then((data) => setPerfis(data))
      .catch((err) => {
        console.error("Erro ao carregar perfis:", err)
        toast.error("Erro ao carregar a lista de perfis.")
      })
      
    if (id) {
      setIsEditing(true)
      getUsuarioById(Number(id))
        .then((user) => {
          setFormData({
            rf: user.rf || "",
            nome: user.nome || "",
            email: user.email || "",
            perfilId: String(user.perfilId),
            status: user.status
          })
        })
        .catch(() => toast.error("Erro ao carregar os dados do usuário."))
    }
  }, [id])

  const checkIsDirty = () => formData.rf !== "" || formData.perfilId !== ""

  const handleCancel = () => {
    navigate(-1)
  }

  const handleDelete = async () => {
    if (!id) return
    setIsDeleting(true)
    try {
      await deleteUsuario(Number(id))
      toast.success("Usuário excluído com sucesso!")
      navigate("/perfis-e-usuarios/usuario")
    } catch (error: any) {
      console.error("Erro ao excluir:", error)
      const errorMessages = error?.response?.data?.validationErrors || [error?.response?.data?.message || "Erro desconhecido ao excluir."]
      errorMessages.forEach((msg: string) => toast.error(msg))
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

  const handleBlurRf = async () => {
    if (!formData.rf || formData.rf.trim() === "") return;

    setIsLoadingRf(true);
    try {
      const dados = await getDadosExternosPorRf(formData.rf.trim());
      setFormData(prev => ({
        ...prev,
        nome: dados.nome,
        email: dados.email
      }));
      toast.success("Dados do funcionário carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar dados do RF:", error);
      setFormData(prev => ({
        ...prev,
        nome: "",
        email: ""
      }));
      toast.error("RF inválido ou funcionário não encontrado.");
    } finally {
      setIsLoadingRf(false);
    }
  }

  const handleSubmit = async () => {
    if (!formData.rf) {
      toast.error("O RF é obrigatório.")
      return false
    }
    if (!formData.perfilId) {
      toast.error("A Função (Perfil) é obrigatória.")
      return false
    }
    if (!formData.nome || !formData.email) {
      toast.error("Os dados do funcionário não foram carregados validamente pelo RF.")
      return false
    }

    const payload = {
      rf: formData.rf.trim(),
      nome: formData.nome, 
      email: formData.email, 
      perfilId: Number(formData.perfilId),
      status: formData.status
    }

    try {
      if (isEditing && id) {
        await updateUsuario({ ...payload, id: Number(id) })
        toast.success("Usuário atualizado com sucesso!")
      } else {
        await createUsuario(payload)
        toast.success("Usuário registrado com sucesso!")
      }
      navigate("/perfis-e-usuarios/usuario") 
    } catch (error: any) {
      console.error("Erro ao salvar:", error)
      const errorMessages = error?.response?.data?.validationErrors || [error?.response?.data?.message || "Erro desconhecido ao salvar."]
      errorMessages.forEach((msg: string) => toast.error(msg))
      return false
    }
  }

  const perfilOptions = perfis.map((p) => ({
    value: String(p.id),
    label: p.nome,
  }))

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title={isEditing ? "Editar Usuário" : "Novo Usuário"}
              breadcrumbTitle="Perfis e Usuários"
              breadcrumbUrl="/perfis-e-usuarios/usuario"
            />
          </HeaderContainer>

          <FormLayoutBase
            titleFirstSection="Dados Gerais"
            submitLabel={isEditing ? "Salvar" : "Cadastrar"}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onDelete={isEditing ? () => setIsDeleteModalOpen(true) : undefined}
            checkIsDirty={checkIsDirty}
            columnsClassName="grid-cols-1 md:grid-cols-2"
          >
            {/* RF */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                RF do funcionário<RequiredMark />
              </label>
              <input
                type="text"
                placeholder="Digite o RF e saia do campo..."
                value={formData.rf}
                onChange={(e) => setFormData((p) => ({ ...p, rf: e.target.value }))}
                onBlur={handleBlurRf}
                disabled={isEditing}
                className={`h-10 w-full rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${isEditing ? "bg-gray-100 cursor-not-allowed" : "bg-background"}`}
              />
              {isLoadingRf && <span className="text-xs text-blue-500 mt-1">Buscando dados...</span>}
            </div>

            {/* Nome (Readonly) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Nome
              </label>
              <input
                type="text"
                placeholder="Preenchido automaticamente"
                value={formData.nome}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>

            {/* Email (Readonly) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                placeholder="Preenchido automaticamente"
                value={formData.email}
                readOnly
                disabled
                className="h-10 w-full rounded-md border border-input bg-gray-100 px-3 py-2 text-sm cursor-not-allowed"
              />
            </div>

            {/* Seletor de Perfil (Função) */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Função (Perfil)<RequiredMark />
              </label>
              <SearchableSelect
                options={perfilOptions}
                value={formData.perfilId}
                onChange={(value) => {
                  setFormData((p) => ({ ...p, perfilId: value }))
                }}
                placeholder="Selecione a função..."
              />
            </div>

          </FormLayoutBase>
          <DeleteConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={() => setIsDeleteModalOpen(false)}
            onConfirm={handleDelete}
            title="Excluir Usuário"
            description="Tem certeza que deseja excluir este usuário? Esta ação não poderá ser desfeita."
            loading={isDeleting}
          />
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
