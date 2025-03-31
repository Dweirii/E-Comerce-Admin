"use client"

import type React from "react"

import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { type OrderColumn, useColumns } from "./columns"
import { DataTable } from "@/components/data-table"
import { useEffect } from "react"
import { useSidebarState } from "@/hooks/use-sidebar"

interface OrderClientProps {
  data: OrderColumn[]
  isSidebarOpen?: boolean // Optional prop to control sidebar state externally
}

export const OrderClient: React.FC<OrderClientProps> = ({ data, isSidebarOpen }) => {
  const sidebarState = useSidebarState()
  const { columns } = useColumns()

  // Sync sidebar state if provided as a prop
  useEffect(() => {
    if (isSidebarOpen !== undefined) {
      if (isSidebarOpen) {
        sidebarState.open()
      } else {
        sidebarState.close()
      }
    }
  }, [isSidebarOpen, sidebarState])

  return (
    <>
      <div className="flex items-center justify-between pb-5">
        <Heading title={`Orders (${data.length})`} description="Manage Orders for your store" />
      </div>
      <Separator />
      <DataTable searchKey="products" columns={columns} data={data}  />
    </>
  )
}

