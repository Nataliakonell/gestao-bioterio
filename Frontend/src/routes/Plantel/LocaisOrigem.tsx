import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  localOrigemService,
  type LocalOrigem,
} from "@/services/LocalOrigemService";
import { Pencil, Trash2 } from "lucide-react";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import HeaderGeral from "@/components/header-geral";
import { HeaderContainer } from "@/components/header-container";
import { PageContainer } from "@/components/page-container";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { usePermissions } from "@/contexts/PermissionsContext";

export default function LocaisOrigemList() {
  const { hasPermission } = usePermissions();
  const [locais, setLocais] = useState<LocalOrigem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  

  const fetchLocais = async () => {
    try {
      setLoading(true);
      const data = await localOrigemService.getAll({ page, pageSize, search });
      setLocais(data.items);
      setTotalCount(data.totalCount);
    } catch (error) {
      toast.error("Erro ao carregar locais de origem.");
    } finally {
      setLoading(false);
    }
  }; 

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  useEffect(() => {
    fetchLocais();
  }, [page, pageSize, search]);

  const handleToggleAtivo = async (local: LocalOrigem) => {
    try {
      await localOrigemService.update({
        id: local.id,
        nome: local.nome,
        ativo: !local.ativo,
      });
      toast.success(
        `Local ${local.ativo ? "inativado" : "ativado"} com sucesso!`,
      );
      setLocais(
        locais.map((l) => (l.id === local.id ? { ...l, ativo: !l.ativo } : l)),
      );
    } catch (error) {
      toast.error("Erro ao atualizar status.");
    }
  };

  const confirmDelete = async () => {
    if (deleteId === null) return;

    try {
      setDeleting(true);
      await localOrigemService.delete(deleteId);
      toast.success("Local de origem excluído com sucesso!");
      setLocais(locais.filter((l) => l.id !== deleteId));
      setDeleteId(null);
    } catch (error: any) {
      if (
        error.response?.data?.message ===
        "Este local possui animais vinculados e não pode ser excluído."
      ) {
        toast.error(
          "Este local possui animais vinculados e não pode ser excluído, mas você pode inativá-lo.",
          {
            duration: 5000,
          },
        );
      } else {
        toast.error("Erro ao excluir local.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const startEdit = (local: LocalOrigem) => {
    setEditingId(local.id);
    setEditName(local.nome);
  };

  const saveEdit = async (local: LocalOrigem) => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      toast.error("O nome não pode estar vazio.");
      return;
    }

    const exists = locais.some(
      (l) =>
        l.id !== local.id &&
        l.nome.trim().toLowerCase() === trimmedName.toLowerCase(),
    );

    if (exists) {
      toast.error("Este local já está cadastrado.");
      return;
    }

    try {
      await localOrigemService.update({
        id: local.id,
        nome: trimmedName,
        ativo: local.ativo,
      });
      toast.success("Local atualizado com sucesso!");
      setLocais(
        locais.map((l) =>
          l.id === local.id ? { ...l, nome: trimmedName } : l,
        ),
      );
      setEditingId(null);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.ValidationErrors?.[0] ||
        error.response?.data?.message;
      if (errorMsg === "Este local já está cadastrado.") {
        toast.error("Este local já está cadastrado.");
      } else {
        toast.error("Erro ao atualizar local.");
      }
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral />
          </HeaderContainer>

          <DataTable
            columns={[
              {
                header: "Nome",
                accessorKey: "nome",
                sortable: true,
                cell: (local) =>
                  editingId === local.id ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="h-9 w-64"
                        autoFocus
                      />
                      <Button size="sm" onClick={() => saveEdit(local)}>
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
                    <span className="font-medium text-gray-900">{local.nome}</span>
                  ),
              },
              {
                header: "Status",
                accessorKey: "ativo",
                cell: (local) => (
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={local.ativo !== false}
                      onCheckedChange={() => handleToggleAtivo(local)}
                      disabled={!hasPermission("Locais de origem cadastrados", "Editar")}
                      className="bg-blue-500 data-[state=checked]:bg-blue-600"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {local.ativo !== false ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                ),
              },
              {
                header: "Ações",
                cell: (local) => (
                  <div className="flex justify-end gap-2">
                    {hasPermission("Locais de origem cadastrados", "Editar") && (
                        <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(local)}
                        className="h-8 w-8 p-0"
                        >
                        <Pencil className="w-4 h-4" />
                        </Button>
                    )}
                    {hasPermission("Locais de origem cadastrados", "Gerenciar") && (
                        <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteId(local.id)}
                        className="h-8 w-8 p-0"
                        >
                        <Trash2 className="w-4 h-4" />
                        </Button>
                    )}
                  </div>
                ),
              },
            ]}
            data={locais}
            loading={loading}
            emptyMessage="Nenhum local de origem encontrado."
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

      <DeleteConfirmModal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Excluir Local de Origem"
        description="Deseja realmente excluir este local de origem? Esta ação não poderá ser desfeita."
        loading={deleting}
      />
    </SidebarProvider>
  );
}
