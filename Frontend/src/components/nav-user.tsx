"use client"

import {BadgeCheck, Bell, Palette, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar"
import { useState } from "react"
import { Link } from "react-router-dom"
import { APPEARANCE_STORAGE_KEY } from "@/contexts/ThemeContext"
import { removeCookie, getLoginUrl } from "@/services/api"
import { AparenciaModal } from "@/components/AparenciaModal"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const [aparenciaOpen, setAparenciaOpen] = useState(false)

  const handleLogout = () => {
    removeCookie('bioterio_token');
    
    const appearance = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    localStorage.clear();
    if (appearance) localStorage.setItem(APPEARANCE_STORAGE_KEY, appearance);
    localStorage.setItem('explicit_logout', 'true');

    window.location.href = 'https://accounts.ucdb.br/Logout/Keycloak';
    
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{user.name.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            > 
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-lg">{user.name.split(" ").filter(Boolean).map(n => n[0]).join("").substring(0, 2).toUpperCase() || "CN"}</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>              
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="text-red-600" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      <AparenciaModal
        isOpen={aparenciaOpen}
        onClose={() => setAparenciaOpen(false)}
      />
    </>
  )
}
