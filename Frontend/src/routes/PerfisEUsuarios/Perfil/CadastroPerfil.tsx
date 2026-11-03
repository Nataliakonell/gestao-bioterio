import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { FormLayoutBase, FormSection } from "@/components/formulario-registro/CadastroRegistroForm"
import HeaderGeral from "@/components/header-geral"
import { PageContainer } from "@/components/page-container"
import { HeaderContainer } from "@/components/header-container"
import { getFuncionalidades, type Funcionalidade } from "@/services/FuncionalidadeService"
import { createPerfil, assignPermissao, getPerfilById, updatePerfil } from "@/services/PerfilService"
import { usePermissions } from "@/contexts/PermissionsContext"

const RequiredMark = () => <span className="text-red-500"> *</span>

const initialFormData = {
  nome: "",
  descricao: "",
}

const niveis = [
  { label: "Sem Acesso", value: 1 },
  { label: "Ver", value: 2 },
  { label: "Usar/Editar", value: 3 },
  { label: "Gerenciar", value: 4 },
]

export default function CadastroPerfil() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id
  
  const [formData, setFormData] = useState(initialFormData)
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidade[]>([])
  
  const { hasPermission } = usePermissions()

  const [permissoesSelecionadas, setPermissoesSelecionadas] = useState<Record<number, number>>({})
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    getFuncionalidades()
      .then(async (data) => {
        setFuncionalidades(data)
        const initialPerms: Record<number, number> = {}
        
        if (isEditing) {
          try {
            const perfil = await getPerfilById(Number(id));
            setFormData({
              nome: perfil.nome || "",
              descricao: perfil.descricao || ""
            });
            
            perfil.permissoes?.forEach(p => {
              initialPerms[p.funcionalidadeId] = p.nivelAcesso;
            });
            
            // For any functionality not present in the DB, set to default 1
            data.forEach(f => {
              if (initialPerms[f.id] === undefined) {
                initialPerms[f.id] = 1;
              }
            });
          } catch (error) {
            toast.error("Erro ao carregar dados do perfil.");
          }
        } else {
          data.forEach(f => {
            initialPerms[f.id] = 1
          })
        }
        
        setPermissoesSelecionadas(initialPerms)
      })
      .catch((err) => {
        console.error("Erro ao carregar funcionalidades:", err)
        toast.error("Erro ao carregar os módulos do sistema.")
      })
  }, [id, isEditing])

  const checkIsDirty = () => formData.nome !== "" || formData.descricao !== ""

  const handleCancel = () => {
    navigate(-1)
  }

  const handlePermissionChange = (funcionalidadeId: number, nivelAcesso: number) => {
    setPermissoesSelecionadas(prev => ({
      ...prev,
      [funcionalidadeId]: nivelAcesso
    }))
  }

  const handleSubmit = async () => {
    if (isSaving) return false;

    if (!formData.nome.trim()) {
      toast.error("O Nome do perfil é obrigatório.")
      return false
    }

    if (!formData.descricao.trim()) {
      toast.error("A Descrição do perfil é obrigatória.")
      return false
    }

    setIsSaving(true)
    try {
      let savedPerfilId = Number(id);

      if (isEditing) {
        const res = await updatePerfil({
          id: savedPerfilId,
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim()
        });
        if (res && res.success === false) throw { response: { data: res } };
      } else {
        const perfilResponse = await createPerfil({
          nome: formData.nome.trim(),
          descricao: formData.descricao.trim()
        });
        if (perfilResponse && perfilResponse.success === false) throw { response: { data: perfilResponse } };
        savedPerfilId = perfilResponse.id;
      }

      const funcionalidadesUnicas = Array.from(new Map(funcionalidades.map(f => [f.id, f])).values());

      const promessas = funcionalidadesUnicas.map(funcionalidade => {
        const nivelAcesso = permissoesSelecionadas[funcionalidade.id] || 1
        return assignPermissao(savedPerfilId, {
          funcionalidadeId: funcionalidade.id,
          nivelAcesso: nivelAcesso
        }).then(res => {
            if (res && res.success === false) throw { response: { data: res } };
            return res;
        }).catch(err => {
            console.error(`Erro ao salvar permissão ${funcionalidade.id}:`, err);
            throw err;
        })
      })

      await Promise.all(promessas)

      toast.success("Perfil e permissões registrados com sucesso!")
      navigate(-1)
    } catch (error: any) {
      console.error("Erro ao salvar:", error)
      const errorMessages = error?.response?.data?.validationErrors || [error?.response?.data?.message || "Erro desconhecido ao salvar."]
      errorMessages.forEach((msg: string) => toast.error(msg))
      return false
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title={isEditing ? "Editar Perfil" : "Cadastrar Perfil"}
              breadcrumbTitle="Perfis de Usuário"
              breadcrumbUrl="/perfis-e-usuarios/perfil"
            />
          </HeaderContainer>

          <FormLayoutBase
            titleFirstSection="Dados Gerais"
            submitLabel={isSaving ? "Salvando..." : "Salvar"}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            checkIsDirty={checkIsDirty}
            hideSubmit={!hasPermission("Gerenciamento de perfis", isEditing ? "Editar" : "Gerenciar")}
            columnsClassName="grid-cols-1"
            extraSections={
              <FormSection
                title="Permissões por Módulo"
                description="Selecione o nível de acesso de cada perfil"
              >
                <div className="overflow-x-auto rounded-md border border-gray-200">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-medium text-gray-700">Módulo</th>
                        {niveis.map(n => (
                          <th key={n.value} className="px-6 py-3 font-medium text-gray-700 text-center">
                            {n.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {funcionalidades.map(func => (
                        <tr key={func.id} className="bg-white hover:bg-gray-50">
                          <td className="px-6 py-4 font-medium text-gray-600">
                            {func.nome}
                          </td>
                          {niveis.map(n => (
                            <td key={n.value} className="px-6 py-4 text-center">
                              <input
                                disabled={!hasPermission("Gerenciamento de perfis", isEditing ? "Editar" : "Gerenciar")}
                                type="radio"
                                name={`funcionalidade-${func.id}`}
                                value={n.value}
                                checked={permissoesSelecionadas[func.id] === n.value}
                                onChange={() => handlePermissionChange(func.id, n.value)}
                                className="h-4 w-4 text-brand focus:ring-brand border-gray-300 disabled:opacity-50"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                      {funcionalidades.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                            Carregando módulos...
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </FormSection>
            }
          >
            {/* Nome do perfil */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">
                Nome do perfil<RequiredMark />
              </label>
              <input
                disabled={!hasPermission("Gerenciamento de perfis", isEditing ? "Editar" : "Gerenciar")}
                type="text"
                placeholder="Ex: Estagiário"
                value={formData.nome}
                onChange={(e) => setFormData((p) => ({ ...p, nome: e.target.value }))}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              />
            </div>

            {/* Descrição */}
            <div className="flex flex-col gap-1 mt-4">
              <label className="text-sm font-medium text-gray-700">
                Descrição<RequiredMark />
              </label>
              <textarea
                disabled={!hasPermission("Gerenciamento de perfis", isEditing ? "Editar" : "Gerenciar")}
                placeholder="Resumo das atribuições do perfil"
                value={formData.descricao}
                onChange={(e) => setFormData((p) => ({ ...p, descricao: e.target.value }))}
                className="min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50"
              />
            </div>
          </FormLayoutBase>
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  )
}
