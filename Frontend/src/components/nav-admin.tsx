import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar"
import { type NavItem, NavMainItem } from "./nav-main"

export function NavAdmin({
  menus,
}: {
  menus: NavItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Administração</SidebarGroupLabel>
      <SidebarMenu>
        {menus.map((item) => (
          <NavMainItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

