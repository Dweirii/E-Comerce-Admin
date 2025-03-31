"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Switch } from "@/components/ui/switch"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useSidebarState } from "@/hooks/use-sidebar"

export type OrderColumn = {
  id: string
  fullName: string
  phone: string
  address: string
  notes?: string
  isPaid: boolean
  totalPrice: string
  products: string
  createdAt: string
}

// New component to handle the toggle
const PaidStatusToggle = ({ orderId, isPaid }: { orderId: string; isPaid: boolean }) => {
  const router = useRouter()

  const handleToggle = async () => {
    try {
      await axios.patch(`/api/order/${orderId}/toggle-paid`)
      toast.success("Payment status updated.")
      router.refresh()
    } catch {
      toast.error("Failed to update status.")
    }
  }

  return <Switch checked={isPaid} onCheckedChange={handleToggle} />
}

// Cell component with truncation and tooltip for overflow text
const TruncatedCell = ({ value }: { value: string }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="max-w-[200px] truncate">{value || "-"}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs break-words">{value || "-"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export const useColumns = () => {
  // Get sidebar state from a custom hook
  const { isOpen } = useSidebarState()
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== "undefined" ? window.innerWidth : 1200)

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Determine which columns to show based on sidebar state and window width
  const getColumnVisibility = () => {
    const isMobile = windowWidth < 768
    const isTablet = windowWidth >= 768 && windowWidth < 1024
    const isDesktop = windowWidth >= 1024

    // When sidebar is open, we have less space
    if (isOpen) {
      if (isMobile) {
        return {
          products: true,
          fullName: true,
          isPaid: true,
          totalPrice: true,
          notes: false,
          phone: false,
          address: false,
          createdAt: false,
        }
      } else if (isTablet) {
        return {
          products: true,
          fullName: true,
          isPaid: true,
          totalPrice: true,
          notes: false,
          phone: true,
          address: false,
          createdAt: true,
        }
      }
    }

    // Default visibility for desktop or when sidebar is closed
    return {
      products: true,
      fullName: true,
      isPaid: true,
      totalPrice: true,
      notes: isDesktop,
      phone: true,
      address: isDesktop || (isTablet && !isOpen),
      createdAt: true,
    }
  }

  const columnVisibility = getColumnVisibility()

  const columns: ColumnDef<OrderColumn>[] = [
    {
      accessorKey: "products",
      header: "Products",
      cell: ({ row }) => <TruncatedCell value={row.original.products} />,
    },
    {
      accessorKey: "fullName",
      header: "Customer Name",
      cell: ({ row }) => <TruncatedCell value={row.original.fullName} />,
    },
    {
      accessorKey: "notes",
      header: "Notes",
      cell: ({ row }) => <TruncatedCell value={row.original.notes || "-"} />,
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <TruncatedCell value={row.original.phone} />,
    },
    {
      accessorKey: "address",
      header: "Address",
      cell: ({ row }) => <TruncatedCell value={row.original.address} />,
    },
    {
      accessorKey: "isPaid",
      header: "Paid",
      cell: ({ row }) => {
        const order = row.original
        return <PaidStatusToggle orderId={order.id} isPaid={order.isPaid} />
      },
    },
    {
      accessorKey: "totalPrice",
      header: "Total Price",
    },
    {
      accessorKey: "createdAt",
      header: "Date",
    },
  ]

  return { columns, columnVisibility }
}

