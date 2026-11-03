
import logo from "../assets/LOGO_VERTICAL.webp";
import ucdb from "../assets/ucdb.webp";
import logoBranca from "../assets/LOGO HORIZONTAL_BRANCO.png";

import { SidebarMenuButton } from "@/components/ui/sidebar";

export default function HeaderSidebar() {
  return (
    <SidebarMenuButton
      asChild
      size="lg"
      className="!p-0 !items-start hover:bg-transparent hover:text-sidebar-foreground active:bg-transparent active:text-sidebar-foreground data-[state=open]:bg-transparent data-[state=open]:text-sidebar-foreground"
    >
      <div className="flex w-full flex-col items-start gap-[3px] px-2">
        <div className="flex items-start gap-[7px] pb-1">
          {/* Símbolo: permanece nos dois temas */}
          <img
            src={logo}
            alt="Símbolo UCDB"
            className="h-auto w-8 min-h-8 min-w-8 shrink-0 object-contain"
          />

          {/* Texto UCDB: tema claro */}
          <img
            src={ucdb}
            alt="UCDB"
            className="h-auto w-16 shrink-0 self-center translate-y-[3px] object-contain dark:hidden"
          />

          {/* Texto UCDB: tema escuro */}
          <img
            src={logoBranca}
            alt="UCDB"
            className="hidden h-auto w-16 shrink-0 self-center translate-y-[3px] object-contain dark:block"
          />
        </div>

        <span className="text-left text-xs font-medium leading-none text-sidebar-foreground">
          Sistema de Gestão do Biotério
        </span>
      </div>
    </SidebarMenuButton>
  );
}
