import * as React from "react"
import {
  Rat,
  FileChartColumn,
  UserKey,
  LayoutDashboard,
  Book,
  Stethoscope,
  CalendarClock,
  Ruler,
  FileText,
  Palette,
  Building2,
  CalendarDays,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavAdmin } from "@/components/nav-admin"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ScrollArea } from "@/components/ui/scroll-area"

import HeaderSidebar from "./header-sidebar"
import { getUserInfo, isBioterioAdmin } from "@/services/api"
import { AparenciaModal } from "@/components/AparenciaModal"

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      isActive: true
    },
    {
      title: "Plantel",
      url: "#",
      icon: Book,
      items: [
        { title: "Visão geral", url: "/plantel/visao-geral" },
        { title: "Locais de origem", url: "/plantel/locais-origem" },
        { title: "Espécies cadastradas", url: "/plantel/especies" },
      ],
    },
    {
      title: "Alimentações",
      url: "#",
      icon: Rat,
      items: [
        { title: "Registros de alimentação", url: "/alimentacao" },
        { title: "Escala de alimentação", url: "/alimentacao/rotina-alimentar" },
      ],
    },
    {
      title: "Biometrias",
      url: "#",
      icon: Ruler,
      items: [
        { title: "Registros de biometria", url: "/biometria" },
        { title: "Escala de biometria", url: "/biometria/rotina-biometrica" },
      ],
    },
    {
      title: "Clinico",
      url: "#",
      icon: Stethoscope,
      items: [
        { title: "Atendimentos clínicos", url: "/clinico/atendimentos" },
        { title: "Desverminação", url: "/desverminacao/visao-geral" },
        { title: "Mapa de execução", url: "/clinico/mapa-execucao" },
        { title: "Medicamentos cadastrados", url: "/clinico/medicacoes" },
      ],
    },
    {
      title: "Instalações",
      url: "/instalacoes",
      icon: Building2
    },
    {
      title: "Eventos",
      url: "/eventos",
      icon: CalendarDays
    },
  ],
  menus: [
    { title: "Relatórios", url: "/relatorios", icon: FileChartColumn },
    { 
      title: "Perfis e usuários", 
      url: "#", 
      icon: UserKey,
      items: [
        { title: "Usuários", url: "/perfis-e-usuarios/usuario" },
        { title: "Gerenciamento de perfis", url: "/perfis-e-usuarios/perfil" }
      ]
    },
    { title: "Rotinas", url: "/rotina/visao-geral", icon: CalendarClock },
    { title: "Templates de Documento", url: "/admin/modelos", icon: FileText },
  ],
  user: {
    name: "",
    email: "",
    avatar: ""
  }
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [aparenciaOpen, setAparenciaOpen] = React.useState(false)
  const isAdmin = isBioterioAdmin()
  const userInfo = getUserInfo();
  const userName = userInfo?.name || "Usuário";
  data.user = {
    name: userName || "Usuário",
    email: userInfo?.email || "",
    avatar: userInfo?.avatar || `https://ui-avatars.com/api/?name=${userName}&background=random`
  };

  const adminMenus = React.useMemo(() => {
    return data.menus.map((menu) => {
      if (menu.title === "Perfis e usuários") {
        const items = [
          { title: "Usuários", url: "/perfis-e-usuarios/usuario" },
          { title: "Gerenciamento de perfis", url: "/perfis-e-usuarios/perfil" },
        ];
        if (isAdmin) {
          items.push({ title: "Funcionalidades", url: "/perfis-e-usuarios/funcionalidades" });
        }
        return { ...menu, items };
      }
      return menu;
    });
  }, [isAdmin]);

  return (
    <>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader className="shrink-0">
          <HeaderSidebar />
        </SidebarHeader>

        <SidebarContent className="p-0 overflow-hidden">
          <ScrollArea className="h-full w-full">
            <div className="flex flex-col gap-2 p-2">
              <NavMain items={data.navMain} />
              <NavAdmin menus={adminMenus} />
            </div>
          </ScrollArea>
        </SidebarContent>

        <SidebarFooter className="shrink-0">
            <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => setAparenciaOpen(true)}
                tooltip="Mudar aparência (tema e cor)"
                className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer"
              >
                <Palette className="size-4 text-primary" />
                <span className="font-medium">Temas</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <NavUser user={data.user} />
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <AparenciaModal
        isOpen={aparenciaOpen}
        onClose={() => setAparenciaOpen(false)}
      />
    </>
  )
}

