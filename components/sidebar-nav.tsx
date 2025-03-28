"use client"

import type React from "react"
import Link from "next/link"
import { useParams, usePathname } from "next/navigation"
import {
  BarChart3,
  ImageIcon,
  LayoutGrid,
  Package,
  Ruler,
  Settings,
  ShoppingCart,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  storeSwitcher?: React.ReactNode
  userButton?: React.ReactNode
}

function CollapseButton() {
  const { open, setOpen } = useSidebar()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setOpen(!open)}
      className="h-8 w-8"
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
    </Button>
  )
}

export function SidebarNav({
  className,
  storeSwitcher,
  userButton,
  ...props
}: SidebarNavProps) {
  const pathname = usePathname()
  const params = useParams()

  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Dashboard",
      icon: BarChart3,
    },
    {
      href: `/${params.storeId}/billboards`,
      label: "Billboards",
      icon: ImageIcon,
    },
    {
      href: `/${params.storeId}/categories`,
      label: "Categories",
      icon: LayoutGrid,
    },
    {
      href: `/${params.storeId}/sizes`,
      label: "Sizes",
      icon: Ruler,
    },
    {
      href: `/${params.storeId}/colors`,
      label: "Colors",
      icon: Palette,
    },
    {
      href: `/${params.storeId}/products`,
      label: "Products",
      icon: Package,
    },
    {
      href: `/${params.storeId}/orders`,
      label: "Orders",
      icon: ShoppingCart,
    },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      icon: Settings,
    },
  ]

  return (
    <Sidebar className={className} collapsible="icon" {...props}>
      {/* Header with store switcher + collapse button */}
      <SidebarHeader className="border-b p-4 flex items-center justify-between">
        <div className="flex-1 overflow-hidden truncate">{storeSwitcher}</div>
        <CollapseButton />
      </SidebarHeader>

      {/* Navigation Links */}
      <SidebarContent >
        <SidebarMenu>
          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={route.label}
                >
                  <Link href={route.href} className="flex items-center gap-2">
                    <route.icon className="h-4 w-4" />
                    <span className="truncate">{route.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer (user button) */}
      <SidebarFooter className="border-t p-4">
        {userButton}
      </SidebarFooter>
    </Sidebar>
  )
}
