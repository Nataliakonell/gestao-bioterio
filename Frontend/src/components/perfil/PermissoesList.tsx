import { cn } from "@/lib/utils";
import { type Funcionalidade } from "@/services/FuncionalidadeService";
import { type Permissao } from "@/services/PerfilService";

const niveis = [
  { label: "Sem acesso", value: 1 },
  { label: "Ver", value: 2 },
  { label: "Editar", value: 3 },
  { label: "Gerenciar", value: 4 },
];

interface PermissoesListProps {
  funcionalidades: Funcionalidade[];
  permissoes: Permissao[];
}

export function PermissoesList({ funcionalidades, permissoes }: PermissoesListProps) {
  if (funcionalidades.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-8">Nenhuma funcionalidade cadastrada.</p>;
  }

  return (
    <div className="flex flex-col">
      {funcionalidades.map((func, index) => {
        const userPerm = permissoes.find(p => p.funcionalidadeId === func.id)?.nivelAcesso || 1;
        
        return (
          <div 
            key={func.id} 
            className={cn(
              "flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2",
              index !== funcionalidades.length - 1 && "border-b border-gray-100"
            )}
          >
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900">{func.nome}</h4>
              <p className="text-xs text-gray-500 truncate mt-0.5">{func.descricao}</p>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto">
              {niveis.map(nivel => {
                const isSelected = userPerm === nivel.value;
                return (
                  <div
                    key={nivel.value}
                    className={cn(
                      "px-3 py-1 rounded-full text-[13px] font-medium transition-colors whitespace-nowrap",
                      isSelected 
                        ? "bg-gray-200 text-gray-800" 
                        : "text-gray-400 bg-transparent"
                    )}
                  >
                    {nivel.label}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
