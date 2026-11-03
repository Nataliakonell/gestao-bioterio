import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddButton } from "@/components/formulario-registro/AddButton";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import * as perfilService from "@/services/PerfilService";
import * as usuarioService from "@/services/UsuarioService";
import { getFuncionalidades, type Funcionalidade } from "@/services/FuncionalidadeService";
import HeaderGeral from "@/components/header-geral";
import { HeaderContainer } from "@/components/header-container";
import { PageContainer } from "@/components/page-container";
import { usePermissions } from "@/contexts/PermissionsContext";
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro";
import { PerfilCard } from "@/components/perfil/PerfilCard";
import { PermissoesList } from "@/components/perfil/PermissoesList";

export default function VisaoGeralPerfis() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  
  const [perfis, setPerfis] = useState<perfilService.Perfil[]>([]);
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidade[]>([]);
  const [usuariosCount, setUsuariosCount] = useState<Record<number, number>>({});
  
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  
  const [selectedPerfilId, setSelectedPerfilId] = useState<number | null>(null);
  const [perfilDetail, setPerfilDetail] = useState<perfilService.PerfilDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [perfisData, funcsData, usuariosData] = await Promise.all([
        perfilService.getPerfis(),
        getFuncionalidades(),
        usuarioService.getUsuarios(1, 10000)
      ]);
      
      setPerfis(perfisData);
      setFuncionalidades(funcsData);
      
      const counts: Record<number, number> = {};
      if (usuariosData?.items) {
        usuariosData.items.forEach(u => {
          counts[u.perfilId] = (counts[u.perfilId] || 0) + 1;
        });
      }
      setUsuariosCount(counts);

      if (perfisData.length > 0 && !selectedPerfilId) {
        setSelectedPerfilId(perfisData[0].id);
      }
    } catch (error) {
      toast.error("Erro ao carregar dados.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedPerfilId) {
      loadPerfilDetail(selectedPerfilId);
    } else {
      setPerfilDetail(null);
    }
  }, [selectedPerfilId]);

  const loadPerfilDetail = async (id: number) => {
    try {
      setLoadingDetail(true);
      const detail = await perfilService.getPerfilById(id);
      setPerfilDetail(detail);
    } catch (error) {
      toast.error("Erro ao carregar detalhes do perfil.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredPerfis = useMemo(() => {
    if (!search) return perfis;
    const lowerSearch = search.toLowerCase();
    return perfis.filter((p) => p.nome.toLowerCase().includes(lowerSearch));
  }, [perfis, search]);

  

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral title="Perfis" breadcrumbTitle="Perfis e Usuários" breadcrumbUrl="/perfis-e-usuarios/perfil" />
            {hasPermission("Gerenciamento de perfis", "Gerenciar") && (
              <AddButton 
                text="Novo Perfil" 
                route="/perfis-e-usuarios/perfil/novo" 
              />
            )}
          </HeaderContainer>

          <div className="mb-1 flex justify-end">
            <BarraDeBuscaEFiltro
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar Perfil"
              filterSections={[
                {
                  key: "modulos",
                  label: "Módulo (Filtro Visual)",
                  type: "checkbox",
                  options: funcionalidades.map(f => ({ label: f.nome, value: f.id.toString() })),
                  selected: selectedModules,
                  onChange: setSelectedModules
                }
              ]}
            />
          </div>

          <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-190px)] overflow-hidden">
            {/* LEFT PANE - Lista de Perfis */}
            <div className="w-full md:w-1/3 flex flex-col gap-4 overflow-y-auto pr-2 pb-8">

              <div className="flex flex-col gap-3">
                {loading ? (
                  <p className="text-sm text-gray-500">Carregando...</p>
                ) : filteredPerfis.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhum perfil encontrado.</p>
                ) : (
                  filteredPerfis.map(perfil => (
                    <PerfilCard
                      key={perfil.id}
                      id={perfil.id}
                      nome={perfil.nome}
                      descricao={perfil.descricao}
                      usuariosCount={usuariosCount[perfil.id] || 0}
                      isSelected={selectedPerfilId === perfil.id}
                      onClick={() => setSelectedPerfilId(perfil.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* RIGHT PANE - Detalhes do Perfil */}
            <div className="w-full md:w-2/3 flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden h-full">
              {!selectedPerfilId ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Selecione um perfil para ver os detalhes
                </div>
              ) : loadingDetail || !perfilDetail ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  Carregando detalhes...
                </div>
              ) : (
                <>
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900">{perfilDetail.nome}</h2>
                        <p className="text-gray-500 text-sm">{perfilDetail.descricao}</p>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
                            <span>{usuariosCount[perfilDetail.id] || 0} usuários</span>
                          </div>
                          <div className="flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full text-xs font-medium text-gray-700">
                            <span>
                              {perfilDetail.permissoes?.filter(p => p.nivelAcesso > 1).length || 0} / {funcionalidades.length} Módulos liberados
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {hasPermission("Gerenciamento de perfis", "Editar") && (
                        <Button 
                          variant="outline" 
                          className="gap-2 shrink-0 rounded-full font-semibold"
                          onClick={() => navigate(`/perfis-e-usuarios/perfil/editar/${perfilDetail.id}`)}
                        >
                          <Pencil className="w-4 h-4" />
                          Editar
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 pb-4 pt-1">
                    <PermissoesList
                      funcionalidades={funcionalidades}
                      permissoes={perfilDetail.permissoes || []}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
