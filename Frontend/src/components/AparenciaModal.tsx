import { Check, Moon, Sun, Palette } from "lucide-react"
import { toast } from "sonner"
import { ModalShell } from "@/components/ui/modal-shell"
import {
  ACCENT_OPTIONS,
  useTheme,
  type AccentKey,
  type ThemeMode,
} from "@/contexts/ThemeContext"
import { cn } from "@/lib/utils"

const MODES: {
  key: ThemeMode
  label: string
  icon: typeof Sun
  description: string
}[] = [
  { key: "light", label: "Claro", icon: Sun, description: "Fundo branco clássico" },
  { key: "dark", label: "Escuro", icon: Moon, description: "Tons escuros confortáveis" },
]

interface AparenciaModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AparenciaModal({ isOpen, onClose }: AparenciaModalProps) {
  const { appearance, saveAppearance } = useTheme()

  const handleSelectMode = (newMode: ThemeMode) => {
    if (newMode === appearance.mode) return
    saveAppearance({ mode: newMode, accent: appearance.accent })
    toast.success(`Tema ${newMode === "dark" ? "Escuro" : "Claro"} ativado!`)
  }

  const handleSelectAccent = (newAccent: AccentKey) => {
    if (newAccent === appearance.accent) return
    saveAppearance({ mode: appearance.mode, accent: newAccent })
    const opt = ACCENT_OPTIONS.find((a) => a.key === newAccent)
    toast.success(`Destaque ${opt?.label ?? newAccent} ativado!`)
  }

  return (
    <ModalShell
      isOpen={isOpen}
      onClose={onClose}
      title="Aparência do Sistema"
      icon={<Palette className="h-4 w-4" />}
      iconBg="blue"
      size="sm"
      animated
      footerProps={{
      hideCancel: true,
      hideSave: true,
      }}
    >
      <div className="space-y-5">
        <p className="text-xs text-muted-foreground">
          Clique para alternar instantaneamente o tema ou a cor de destaque. As alterações são aplicadas e salvas na hora.
        </p>

        {/* Modo de exibição (Tema) */}
        <section className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Tema
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {MODES.map(({ key, label, icon: Icon, description }) => {
              const selected = appearance.mode === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectMode(key)}
                  className={cn(
                    "flex flex-col items-start gap-1 p-3 rounded-xl border-2 text-left transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-primary bg-primary/10 text-primary shadow-sm"
                      : "border-border text-foreground hover:bg-muted hover:border-muted-foreground/30"
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <Icon className="size-4 shrink-0" />
                    {selected && <Check className="size-4 text-primary shrink-0" />}
                  </div>
                  <span className="font-semibold text-sm leading-tight mt-1">{label}</span>
                  <span className="text-[11px] text-muted-foreground leading-tight">{description}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Cores de destaque */}
        <section className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wider">
            Cor de destaque
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {ACCENT_OPTIONS.map(({ key, label, swatch }) => {
              const selected = appearance.accent === key
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelectAccent(key)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected
                      ? "border-primary bg-primary/10 shadow-sm"
                      : "border-border hover:bg-muted hover:border-muted-foreground/30"
                  )}
                >
                  <span
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full text-white transition-transform shadow-sm",
                      selected && "scale-110 ring-2 ring-foreground ring-offset-2 ring-offset-background"
                    )}
                    style={{ backgroundColor: swatch }}
                  >
                    {selected && <Check className="size-3.5 stroke-[3]" />}
                  </span>
                  <span
                    className={cn(
                      "text-xs leading-none",
                      selected ? "font-bold text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </div>
    </ModalShell>
  )
}
