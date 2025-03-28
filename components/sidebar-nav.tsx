"use client"

import type React from "react"

import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
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
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

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
      className="h-9 w-9 rounded-full transition-all duration-200 hover:bg-muted"
      aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
    >
      {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
    </Button>
  )
}

export function SidebarNav({ className, storeSwitcher, userButton, ...props }: SidebarNavProps) {
  const pathname = usePathname()
  const params = useParams()
  const { state } = useSidebar()
  const isCollapsed = state === "collapsed"

  const routes = [
    {
      href: `/${params.storeId}`,
      label: "Dashboard",
      icon: BarChart3,
      color: "text-blue-600",
    },
    {
      href: `/${params.storeId}/billboards`,
      label: "Billboards",
      icon: ImageIcon,
      color: "text-purple-600",
    },
    {
      href: `/${params.storeId}/categories`,
      label: "Categories",
      icon: LayoutGrid,
      color: "text-amber-600",
    },
    {
      href: `/${params.storeId}/sizes`,
      label: "Sizes",
      icon: Ruler,
      color: "text-green-600",
    },
    {
      href: `/${params.storeId}/colors`,
      label: "Colors",
      icon: Palette,
      color: "text-pink-600",
    },
    {
      href: `/${params.storeId}/products`,
      label: "Products",
      icon: Package,
      color: "text-indigo-600",
    },
    {
      href: `/${params.storeId}/orders`,
      label: "Orders",
      icon: ShoppingCart,
      color: "text-orange-600",
    },
    {
      href: `/${params.storeId}/settings`,
      label: "Settings",
      icon: Settings,
      color: "text-gray-600",
    },
  ]

  return (
    <Sidebar className={cn("border-r", className)} collapsible="icon" {...props}>
      {/* Header with store switcher + collapse button */}
      <SidebarHeader className="border-b p-4 flex items-center justify-between">
        <div className="flex-1 overflow-hidden truncate">{storeSwitcher}</div>
        <div className="hidden md:block">
          <CollapseButton />
        </div>
        <div className="md:hidden">
          <SidebarTrigger />
        </div>
      </SidebarHeader>

      {/* Navigation Links */}
      <SidebarContent className="py-2">
        <SidebarMenu>
          {routes.map((route) => {
            const isActive = pathname === route.href
            return (
              <SidebarMenuItem key={route.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={route.label}
                  className={cn("transition-all duration-200", isActive ? "font-medium" : "font-normal")}
                >
                  <Link href={route.href} className="flex items-center gap-3">
                    <div
                      className={cn(
                        "flex items-center justify-center",
                        isCollapsed ? "mx-auto" : "",
                        isActive ? route.color : "text-muted-foreground",
                      )}
                    >
                      <route.icon className="h-5 w-5" />
                    </div>
                    <span className="truncate">{route.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>

      {/* Footer (user button) */}
      <SidebarFooter className="border-t p-4">{userButton}</SidebarFooter>
    </Sidebar>
  )
}

