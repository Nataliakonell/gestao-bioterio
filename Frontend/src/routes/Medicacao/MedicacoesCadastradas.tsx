import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { medicacaoService,type MedicacaoListVm } from "@/services/MedicacaoService";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import HeaderGeral from "@/components/header-geral";
import { HeaderContainer } from "@/components/header-container";
import { PageContainer } from "@/components/page-container";
import { DataTable } from "@/components/data-table";
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro";
import { usePermissions } from "@/contexts/PermissionsContext";

export default function MedicacoesCadastradasList() {
  const { hasPermission } = usePermissions();
  const canEdit = hasPermission("Medicações cadastradas", "Editar");
  const canDelete = hasPermission("Medicações cadastradas", "Gerenciar");

  const [medicacoes, setMedicacoes] = useState<MedicacaoListVm[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrincipioAtivo, setEditPrincipioAtivo] = useState("");
  const [editNomeComercial, setEditNomeComercial] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [search, setSearch] = useState("");

  const fetchMedicacoes = async () => {
    try {
      setLoading(true);
      const data = await medicacaoService.getAll();
      setMedicacoes(data);
    } catch (error) {
      toast.error("Erro ao carregar medicações.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicacoes();
  }, []);

  const filteredMedicacoes = medicacoes.filter(m => 
    m.principioAtivo.toLowerCase().includes(search.toLowerCase()) || 
    m.nomeComercial.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleAtivo = async (medicacao: MedicacaoListVm) => {
    try {
      await medicacaoService.update({
        id: medicacao.id,
        principioAtivo: medicacao.principioAtivo,
        nomeComercial: medicacao.nomeComercial,
        ativo: !medicacao.ativo,
      });
      toast.success(
        `Medicação ${medicacao.ativo ? "inativada" : "ativada"} com sucesso!`,
      );
      setMedicacoes(
        medicacoes.map((m) => (m.id === medicacao.id ? { ...m, ativo: !m.ativo } : m)),
      );
    } catch (error) {
      toast.error("Erro ao atualizar status.");
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      setDeleting(true);
      await medicacaoService.delete(deleteId);
      toast.success("Medicação excluída com sucesso!");
      setMedicacoes(medicacoes.filter((m) => m.id !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "Esta medicação possui registros vinculados e não pode ser excluída."
      ) {
        toast.error(
          "Esta medicação possui registros vinculados e não pode ser excluída, mas você pode inativá-la.",
          {
            duration: 5000,
          },
        );
      } else {
        toast.error("Erro ao excluir medicação.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = (medicacao: MedicacaoListVm) => {
    setEditingId(medicacao.id);
    setEditPrincipioAtivo(medicacao.principioAtivo);
    setEditNomeComercial(medicacao.nomeComercial);
  };

  const saveEdit = async (medicacao: MedicacaoListVm) => {
    const trimmedPA = editPrincipioAtivo.trim();
    const trimmedNC = editNomeComercial.trim();

    if (!trimmedPA || !trimmedNC) {
      toast.error("Princípio Ativo e Nome Comercial são obrigatórios.");
      return;
    }

    const exists = medicacoes.some(
      (m) =>
        m.id !== medicacao.id &&
        m.principioAtivo.trim().toLowerCase() === trimmedPA.toLowerCase() &&
        m.nomeComercial.trim().toLowerCase() === trimmedNC.toLowerCase()
    );

    if (exists) {
      toast.error("Esta medicação já está cadastrada.");
      return;
    }

    try {
      await medicacaoService.update({
        id: medicacao.id,
        principioAtivo: trimmedPA,
        nomeComercial: trimmedNC,
        ativo: medicacao.ativo,
      });
      toast.success("Medicação atualizada com sucesso!");
      setMedicacoes(
        medicacoes.map((m) =>
          m.id === medicacao.id ? { ...m, principioAtivo: trimmedPA, nomeComercial: trimmedNC } : m,
        ),
      );
      setEditingId(null);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.ValidationErrors?.[0] ||
        error.response?.data?.message;
      if (errorMsg === "Esta medicação já está cadastrada." || errorMsg === "Esta medicação (Princípio Ativo + Nome Comercial) já está cadastrada.") {
        toast.error("Esta medicação já está cadastrada.");
      } else {
        toast.error("Erro ao atualizar medicação.");
      }
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral title="Medicações Cadastradas" breadcrumbTitle="Clínico" breadcrumbUrl="/clinico/mapa-execucao" />
          </HeaderContainer>

          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <BarraDeBuscaEFiltro
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar medicação..."
              />
            </div>

            <DataTable
              columns={[
                {
                  header: "Princípio Ativo",
                  accessorKey: "principioAtivo",
                  sortable: true,
                  cell: (medicacao) =>
                    editingId === medicacao.id ? (
                      <Input
                        value={editPrincipioAtivo}
                        onChange={(e) => setEditPrincipioAtivo(e.target.value)}
                        className="h-9 w-48"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium text-gray-900">{medicacao.principioAtivo}</span>
                    ),
                },
                {
                  header: "Nome Comercial",
                  accessorKey: "nomeComercial",
                  sortable: true,
                  cell: (medicacao) =>
                    editingId === medicacao.id ? (
                      <div className="flex gap-2 items-center">
                        <Input
                          value={editNomeComercial}
                          onChange={(e) => setEditNomeComercial(e.target.value)}
                          className="h-9 w-48"
                        />
                        <Button size="sm" onClick={() => saveEdit(medicacao)}>
                           Salvar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                           Cancelar
                        </Button>
                      </div>
                    ) : (
                      <span className="text-gray-900">{medicacao.nomeComercial}</span>
                    ),
                },
                {
                  header: "Status",
                  accessorKey: "ativo",
                  cell: (medicacao) => (
                    <div className="flex items-center space-x-2">
                      <Switch
                        disabled={!canEdit}
                        checked={medicacao.ativo !== false}
                        onCheckedChange={() => handleToggleAtivo(medicacao)}
                        className="bg-blue-500 data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {medicacao.ativo !== false ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                  ),
                },
                {
                  header: "Ações",
                  cell: (medicacao) => (
                    <div className="flex justify-end gap-2">
                      {canEdit && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => startEdit(medicacao)}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                      )}
                      {canDelete && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteId(medicacao.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                      )}
                    </div>
                  ),
                },
              ]}
              data={filteredMedicacoes}
              loading={loading}
              emptyMessage="Nenhuma medicação encontrada."
            />
          </div>
        </PageContainer>
      </SidebarInset>

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Excluir Medicação"
        description="Deseja realmente excluir esta medicação? Esta ação não poderá ser desfeita."
        loading={deleting}
      />
    </SidebarProvider>
  );
}
