
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import HeaderGeral from "@/components/header-geral";
import { HeaderContainer } from "@/components/header-container";
import { PageContainer } from "@/components/page-container";
import { cn } from "@/lib/utils";
import {
  ACCENT_OPTIONS,
  applyAppearance,
  useTheme,
  type AccentKey,
  type ThemeMode,
} from "@/contexts/ThemeContext";

const MODES: {
  key: ThemeMode;
  label: string;
  icon: typeof Sun;
}[] = [
  { key: "light", label: "Claro", icon: Sun },
  { key: "dark", label: "Escuro", icon: Moon },
];

export default function Aparencia() {
  const { appearance, saveAppearance, previewAppearance } = useTheme();

  const [mode, setMode] = useState<ThemeMode>(appearance.mode);
  const [accent, setAccent] = useState<AccentKey>(appearance.accent);

  const dirty =
    mode !== appearance.mode || accent !== appearance.accent;

  // Atualiza a aparência em tempo real durante a seleção.
  useEffect(() => {
    previewAppearance({ mode, accent });
  }, [mode, accent, previewAppearance]);

  // Restaura a aparência salva ao sair da página.
  useEffect(() => {
    return () => applyAppearance(appearance);
  }, [appearance]);

  const handleSave = () => {
    saveAppearance({ mode, accent });
    toast.success("Aparência atualizada com sucesso!");
  };

  const handleDiscard = () => {
    setMode(appearance.mode);
    setAccent(appearance.accent);
    applyAppearance(appearance);
  };

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <PageContainer>
          <HeaderContainer>
            <HeaderGeral
              title="Aparência"
              breadcrumbTitle="Configurações"
              breadcrumbUrl="/configuracoes/aparencia"
            />
          </HeaderContainer>

          <div className="max-w-2xl space-y-6">
            {/* Modo de exibição */}
            <section className="space-y-4 rounded-lg border bg-card p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Modo de exibição
                </h2>

                <p className="text-sm text-muted-foreground">
                  Escolha entre o tema claro ou escuro.
                </p>
              </div>

              <div
                className="grid grid-cols-2 gap-3"
                role="radiogroup"
                aria-label="Modo de exibição"
              >
                {MODES.map(({ key, label, icon: Icon }) => {
                  const selected = mode === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setMode(key)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border-2 p-4 text-left text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                        selected
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="size-5" />

                      {label}

                      {selected && (
                        <Check className="ml-auto size-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Cor de destaque */}
            <section className="space-y-4 rounded-lg border bg-card p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Cor de destaque
                </h2>

                <p className="text-sm text-muted-foreground">
                  Aplicada em botões, links, abas e elementos selecionados.
                  Cores de status (sucesso, alerta e erro) não são alteradas.
                </p>
              </div>

              <div
                className="flex flex-wrap gap-4"
                role="radiogroup"
                aria-label="Cor de destaque"
              >
                {ACCENT_OPTIONS.map(({ key, label, swatch }) => {
                  const selected = accent === key;

                  return (
                    <button
                      key={key}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={label}
                      title={label}
                      onClick={() => setAccent(key)}
                      className="group flex flex-col items-center gap-1.5 focus:outline-none"
                    >
                      <span
                        className={cn(
                          "flex size-10 items-center justify-center rounded-full text-white ring-offset-2 ring-offset-background transition group-focus-visible:ring-2 group-focus-visible:ring-ring",
                          selected
                            ? "ring-2 ring-foreground"
                            : "group-hover:scale-105"
                        )}
                        style={{ backgroundColor: swatch }}
                      >
                        {selected && (
                          <Check className="size-4" />
                        )}
                      </span>

                      <span
                        className={cn(
                          "text-xs",
                          selected
                            ? "font-semibold text-foreground"
                            : "text-muted-foreground"
                        )}
                      >
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Prévia da aparência */}
            <section className="space-y-3 rounded-lg border bg-card p-6">
              <div>
                <h2 className="text-base font-semibold text-foreground">
                  Prévia
                </h2>

                <p className="text-sm text-muted-foreground">
                  Veja como os elementos principais ficam com a aparência
                  selecionada.
                </p>
              </div>

              <div
                className="flex flex-wrap items-center gap-3"
                id="previa"
              >
                <Button type="button">
                  Botão primário
                </Button>

                <a
                  href="#previa"
                  onClick={(event) => event.preventDefault()}
                  className="text-sm text-primary underline underline-offset-4"
                >
                  Link de exemplo
                </a>

                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Selecionado
                </span>

                <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300">
                  Sucesso
                </span>

                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Alerta
                </span>

                <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300">
                  Erro
                </span>
              </div>
            </section>

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={!dirty}
                onClick={handleDiscard}
              >
                Descartar
              </Button>

              <Button
                type="button"
                disabled={!dirty}
                onClick={handleSave}
              >
                Salvar
              </Button>
            </div>
          </div>
        </PageContainer>
      </SidebarInset>
    </SidebarProvider>
  );
}
