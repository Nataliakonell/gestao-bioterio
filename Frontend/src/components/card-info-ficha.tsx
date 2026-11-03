import type { LucideIcon } from "lucide-react";

type CardInfoProps = {
  titulo: string;
  descricao: string;
  icone: LucideIcon;
};

export default function CardInfoFicha({
  titulo,
  descricao,
  icone: Icone,
}: CardInfoProps) {
  return (
    <div className="flex w-fit items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 px-2 py-2">
      <div className="rounded-md bg-blue-100 p-2">
        <Icone className="h-4 w-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs font-medium leading-tight text-slate-500">
          {titulo}
        </p>

        <p className="text-sm font-semibold leading-tight text-slate-800">
          {descricao}
        </p>
      </div>
    </div>
  );
}