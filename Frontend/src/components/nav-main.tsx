"use client"

import { useState, useEffect } from "react"
import { ChevronRight, type LucideIcon } from "lucide-react"
import { Link, useLocation } from "react-router-dom"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"

export interface NavItem {
  title: string
  url: string
  icon?: LucideIcon
  isActive?: boolean
  items?: {
    title: string
    url: string
  }[]
}

export function NavMain({
  items,
}: {
  items: NavItem[]
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Menus principais</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <NavMainItem key={item.title} item={item} />
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}

export function NavMainItem({ item }: { item: NavItem }) {
  const location = useLocation()
  const hasSubItems = Array.isArray(item.items) && item.items.length > 0

  const isSubItemActive = (subUrl: string) => {
    return location.pathname === subUrl
  }

  const isAnySubItemActive = item.items?.some((subItem) => isSubItemActive(subItem.url)) || false

  const [isOpen, setIsOpen] = useState(isAnySubItemActive || !!item.isActive)

  useEffect(() => {
    if (isAnySubItemActive) {
      setIsOpen(true)
    }
  }, [location.pathname, isAnySubItemActive])

  const buttonContent = (
    <>
      {item.icon && <item.icon />}
      <span>{item.title}</span>
    </>
  )

  if (!hasSubItems) {
    const isUrlActive = item.url.startsWith("/") && (location.pathname === item.url || location.pathname.startsWith(item.url + "/"))
    const isActive = isUrlActive || (item.url === "/" && location.pathname === "/")
    const isLink = item.url && item.url.startsWith("/")

    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip={item.title} isActive={isActive}>
          {isLink ? (
            <Link to={item.url}>
              {buttonContent}
            </Link>
          ) : (
            <a href={item.url}>
              {buttonContent}
            </a>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    )
  }

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      asChild
      className="group/collapsible"
    >
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} isActive={isAnySubItemActive}>
            {item.icon && <item.icon />}
            <span>{item.title}</span>
            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((subItem) => {
              const subActive = isSubItemActive(subItem.url)
              const isSubLink = subItem.url && subItem.url.startsWith("/")
              return (
                <SidebarMenuSubItem key={subItem.title}>
                  <SidebarMenuSubButton asChild isActive={subActive}>
                    {isSubLink ? (
                      <Link to={subItem.url}>
                        <span>{subItem.title}</span>
                      </Link>
                    ) : (
                      <a href={subItem.url}>
                        <span>{subItem.title}</span>
                      </a>
                    )}
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              )
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

