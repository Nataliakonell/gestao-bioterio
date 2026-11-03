import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import HeaderGeral from "@/components/header-geral";
import { HeaderContainer } from "@/components/header-container";
import { PageContainer } from "@/components/page-container";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { BarraDeBuscaEFiltro } from "@/components/barra-de-busca-e-filtro";
import { ModalShell } from "@/components/ui/modal-shell";
import { DeleteConfirmModal } from "@/components/ui/delete-confirm-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getFuncionalidades,
  createFuncionalidade,
  updateFuncionalidade,
  deleteFuncionalidade,
  type Funcionalidade,
} from "@/services/FuncionalidadeService";

export default function VisaoGeralFuncionalidades() {
  const [funcionalidades, setFuncionalidades] = useState<Funcionalidade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal de Criação / Edição
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Funcionalidade | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [saving, setSaving] = useState(false);

  // Dialog de Exclusão
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const carregarFuncionalidades = async () => {
    try {
      setLoading(true);
      const data = await getFuncionalidades();
      setFuncionalidades(data);
    } catch (error) {
      toast.error("Erro ao carregar funcionalidades.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarFuncionalidades();
  }, []);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setNome("");
    setDescricao("");
    setModalOpen(true);
  };

  const startEdit = (funcionalidade: Funcionalidade) => {
    setEditingItem(funcionalidade);
    setNome(funcionalidade.nome);
    setDescricao(funcionalidade.descricao || "");
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!nome.trim()) {
      toast.error("O nome da funcionalidade é obrigatório.");
      return;
    }

    try {
      setSaving(true);
      if (editingItem) {
        const response = await updateFuncionalidade({
          id: editingItem.id,
          nome: nome.trim(),
          descricao: descricao.trim(),
        });
        if (response.success === false) {
          toast.error(response.message || "Erro ao atualizar funcionalidade.");
          return;
        }
        toast.success("Funcionalidade atualizada com sucesso!");
      } else {
        const response = await createFuncionalidade({
          nome: nome.trim(),
          descricao: descricao.trim(),
        });
        if (response.success === false) {
          toast.error(response.message || "Erro ao cadastrar funcionalidade.");
          return;
        }
        toast.success("Funcionalidade cadastrada com sucesso!");
      }

      setModalOpen(false);
      await carregarFuncionalidades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Ocorreu um erro ao salvar a funcionalidade.");
    } finally {
      setSaving(false);
    }
  };

  const itemToDelete = useMemo(() => {
    if (!deleteId) return null;
    return funcionalidades.find((f) => f.id === deleteId) || null;
  }, [deleteId, funcionalidades]);

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setDeleting(true);
      await deleteFuncionalidade(deleteId);
      toast.success("Funcionalidade removida com sucesso!");
      setDeleteId(null);
      await carregarFuncionalidades();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao excluir a funcionalidade. Verifique se ela possui permissões vinculadas.");
    } finally {
      setDeleting(false);
    }
  };

  const filteredFuncionalidades = useMemo(() => {
    if (!search.trim()) return funcionalidades;
    const lower = search.toLowerCase();
    return funcionalidades.filter(
      (f) =>
        f.nome.toLowerCase().includes(lower) ||
        (f.descricao && f.descricao.toLowerCase().includes(lower))
    );
  }, [funcionalidades, search]);

  const columns: ColumnDef<Funcionalidade>[] = [
    {
      header: "Nome da Funcionalidade",
      accessorKey: "nome",
      sortable: true,
      cell: (funcionalidade) => (
        <span className="font-medium text-foreground">{funcionalidade.nome}</span>
      ),
    },
    {
      header: "Descrição",
      accessorKey: "descricao",
      sortable: true,
      cell: (funcionalidade) => (
        <span className="text-muted-foreground">
          {funcionalidade.descricao || <span className="italic text-muted-foreground/60">Sem descrição</span>}
        </span>
      ),
    },
    {
      header: "Ações",
      headerClassName: "text-right justify-end",
      cellClassName: "text-right",
      cell: (funcionalidade) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startEdit(funcionalidade)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteId(funcionalidade.id)}
            className="h-8 w-8 p-0"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
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
            <HeaderGeral
              title="Funcionalidades"
              breadcrumbTitle="Perfis e Usuários"
              breadcrumbUrl="/perfis-e-usuarios/perfil"
            />
            <Button
              onClick={handleOpenCreate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full px-5 py-2.5 h-auto shadow-sm gap-2"
            >
              <Plus className="w-4 h-4" />
              Nova Funcionalidade
            </Button>
          </HeaderContainer>

          <div className="flex flex-col gap-4">
            {/* Barra de Busca */}
            <div className="flex justify-end">
              <BarraDeBuscaEFiltro
                search={search}
                onSearchChange={setSearch}
                placeholder="Buscar funcionalidade..."
              />
            </div>

            {/* Tabela de Funcionalidades */}
            <DataTable
              data={filteredFuncionalidades}
              columns={columns}
              loading={loading}
              emptyMessage="Nenhuma funcionalidade encontrada."
              defaultSortKey="nome"
              defaultSortDirection="asc"
            />
          </div>

          {/* Modal de Criação / Edição */}
          <ModalShell
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={editingItem ? "Editar Funcionalidade" : "Nova Funcionalidade"}
            icon={<Settings2 className="h-4 w-4" />}
            size="sm"
            footerProps={{
              onCancel: () => setModalOpen(false),
              onSave: handleSave,
              saveLabel: editingItem ? "Salvar Alterações" : "Criar Funcionalidade",
              saving,
            }}
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome *</Label>
                <Input
                  id="nome"
                  placeholder="Ex: Histórico Clínico"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  placeholder="Descreva o propósito desta funcionalidade no sistema..."
                  rows={4}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
            </div>
          </ModalShell>

          {/* Alerta de Confirmação de Exclusão */}
          <DeleteConfirmModal
            isOpen={deleteId !== null}
            onClose={() => setDeleteId(null)}
            onConfirm={handleConfirmDelete}
            title="Excluir Funcionalidade"
            description={`Tem certeza que deseja excluir a funcionalidade "${itemToDelete?.nome}"? Essa ação removerá a funcionalidade do sistema.`}
            loading={deleting}
          />
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
