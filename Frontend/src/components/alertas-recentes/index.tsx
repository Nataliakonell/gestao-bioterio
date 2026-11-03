import { AlertTriangle, Info, AlertCircle } from "lucide-react"
import { StatsCard } from "@/components/stats-card"

export interface AlertaRecente {
  id: string | number
  titulo: string
  descricao?: string
  quantidade: number
  variant?: "danger" | "warning" | "info" | "success"
  tipo?: string
}

export interface AlertasRecentesProps {
  titulo?: string
  alertas: AlertaRecente[]
  onAlertaClick?: (alerta: AlertaRecente) => void
}

export function AlertasRecentes({
  alertas,
  onAlertaClick,
}: AlertasRecentesProps) {
  if (!alertas || alertas.length === 0) return null

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
      {alertas.map((alerta) => {
        const icon =
          alerta.tipo === "erro" ? (
            <AlertCircle className="h-5 w-5 text-red-500" />
          ) : alerta.tipo === "info" ? (
            <Info className="h-5 w-5 text-blue-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )

        return (
          <StatsCard
            key={alerta.id}
            label={alerta.titulo}
            value={alerta.quantidade}
            description={alerta.descricao}
            icon={icon}
            onClick={onAlertaClick ? () => onAlertaClick(alerta) : undefined}
          />
        )
      })}
    </div>
  )
}