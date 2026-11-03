import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { AddButton } from "@/components/formulario-registro/AddButton";
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import * as usuarioService from "@/services/UsuarioService";
import * as perfilService from "@/services/PerfilService";
import HeaderGeral from "@/components/header-geral";
import { HeaderContainer } from "@/components/header-container";
import { PageContainer } from "@/components/page-container";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { usePermissions } from "@/contexts/PermissionsContext";

export default function VisaoGeralUsuarios() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const [usuarios, setUsuarios] = useState<usuarioService.Usuario[]>([]);
  const [perfis, setPerfis] = useState<perfilService.Perfil[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedPerfil, setSelectedPerfil] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usuariosResponse, perfisData] = await Promise.all([
        usuarioService.getUsuarios(page, pageSize),
        perfilService.getPerfis()
      ]);

      setUsuarios(usuariosResponse.items ?? []);
      setTotalCount(usuariosResponse.totalCount ?? 0);
      setPerfis(perfisData);
    } catch (error) {
      toast.error("Erro ao carregar usuários e perfis.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleToggleStatus = async (usuario: usuarioService.Usuario) => {
    try {
      await usuarioService.updateUsuario({
        id: usuario.id,
        rf: usuario.rf || "", 
        nome: usuario.nome,
        email: usuario.email,
        status: !usuario.status,
        perfilId: usuario.perfilId,
      });
      toast.success(`Usuário ${usuario.status ? "inativado" : "ativado"} com sucesso!`);
      setUsuarios(
        usuarios.map((u) => (u.id === usuario.id ? { ...u, status: !u.status } : u)),
      );
    } catch (error) {
      toast.error("Erro ao atualizar status do usuário.");
    }
  };

  const filteredUsuarios = useMemo(() => {
    let filtered = usuarios;

    if (search) {
      const lowerSearch = search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.nome.toLowerCase().includes(lowerSearch) ||
          (u.rf && String(u.rf).toLowerCase().includes(lowerSearch))
      );
    }

    if (selectedStatus.length > 0) {
      filtered = filtered.filter(u => {
        const isAtivo = u.status !== false;
        return (selectedStatus.includes("1") && isAtivo) || 
               (selectedStatus.includes("0") && !isAtivo);
      });
    }

    if (selectedPerfil.length > 0) {
      filtered = filtered.filter(u => selectedPerfil.includes(String(u.perfilId)));
    }

    return filtered;
  }, [usuarios, search, selectedStatus, selectedPerfil]);

  const columns: ColumnDef<usuarioService.Usuario>[] = [
    { 
      header: "RF", 
      accessorKey: "rf", 
      sortable: true,
      cell: (usuario) => <span>{usuario.rf || "N/D"}</span>
    },
    { header: "Nome", accessorKey: "nome", sortable: true },
    { 
      header: "Email", 
      accessorKey: "email", 
      cell: (usuario) => <span>{usuario.email || "N/D"}</span>
    },
    { 
      header: "Função", 
      accessorKey: "perfilId",
      cell: (usuario) => {
        const perfil = perfis.find(p => p.id === usuario.perfilId);
        return <span>{perfil ? perfil.nome : "Sem Perfil"}</span>;
      }
    },
    {
      header: "Ações",
      accessorKey: "status",
      cell: (usuario) => (
        <div 
          className="flex items-center space-x-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Switch
            checked={usuario.status !== false}
            onCheckedChange={() => handleToggleStatus(usuario)}
            disabled={!hasPermission("Usuários", "Editar")}
            className="bg-blue-500 data-[state=checked]:bg-blue-600"
          />
          <span className="text-sm font-medium text-gray-700">
            {usuario.status !== false ? "Ativo" : "Inativo"}
          </span>
        </div>
      ),
    },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral breadcrumbTitle="Perfis e Usuários" breadcrumbUrl="/perfis-e-usuarios/usuario" />
            {hasPermission("Usuários", "Gerenciar") && (
              <AddButton 
                text="Cadastrar Usuário" 
                route="/perfis-e-usuarios/usuario/novo" 
              />
            )}
          </HeaderContainer>

          <div className="mb-1 flex flex-col sm:flex-row justify-end items-start sm:items-center gap-4">
            <BarraDeBuscaEFiltro
              search={search}
              onSearchChange={setSearch}
              placeholder="Buscar por nome ou RF..."
              filterSections={[
                {
                  key: "status",
                  label: "Status",
                  type: "checkbox",
                  options: [
                    { value: "1", label: "Ativo" },
                    { value: "0", label: "Inativo" },
                  ],
                  selected: selectedStatus,
                  onChange: setSelectedStatus,
                },
                {
                  key: "perfil",
                  label: "Função (Perfil)",
                  type: "checkbox",
                  options: perfis.map(p => ({ value: String(p.id), label: p.nome })),
                  selected: selectedPerfil,
                  onChange: setSelectedPerfil,
                }
              ]}
            />
          </div>

          <DataTable
            data={filteredUsuarios}
            columns={columns}
            loading={loading}
            emptyMessage="Nenhum usuário encontrado."
            onRowClick={
              hasPermission("Usuários", "Editar")
                ? (usuario) => navigate(`/perfis-e-usuarios/usuario/${usuario.id}`)
                : undefined
            }
            serverPagination={{
              page,
              pageSize,
              totalCount,
              onPageChange: setPage,
              onPageSizeChange: setPageSize,
            }}
          />
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
