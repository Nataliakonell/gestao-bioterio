import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerfilCardProps {
  id: number;
  nome: string;
  descricao?: string;
  usuariosCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function PerfilCard({ id, nome, descricao, usuariosCount, isSelected, onClick }: PerfilCardProps) {
  return (
    <div 
      onClick={onClick}
      className={cn(
        "p-3 rounded-xl border cursor-pointer transition-all hover:shadow-sm flex flex-col gap-1.5",
        isSelected 
          ? "border-blue-600 bg-blue-50/30" 
          : "border-gray-200 bg-white hover:border-blue-300"
      )}
    >
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-semibold text-gray-900">{nome}</h3>
        <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-xs font-medium text-gray-600 whitespace-nowrap">
          <Users className="w-3 h-3" />
          <span>{usuariosCount}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2">
        {descricao || "Sem descrição."}
      </p>
    </div>
  );
}
