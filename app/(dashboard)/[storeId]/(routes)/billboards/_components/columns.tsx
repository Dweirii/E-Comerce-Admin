"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Calendar, ChevronDown } from "lucide-react"
import { CellAction } from "./cell-action"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

// Enhanced type definition with additional fields
export type BillboardColumn = {
  id: string
  label: string
  createdAt: string
  // Added fields for detailed view
  imageUrl?: string
  notes?: string
  pricePaid?: number
  status?: "active" | "inactive" | "scheduled"
  dimensions?: string
}

// Mobile detail view component
const MobileDetailView = ({ data }: { data: BillboardColumn }) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden h-8 w-8 p-0">
          <ChevronDown className="h-4 w-4" />
          <span className="sr-only">View details</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[80vh] rounded-t-[10px]">
        <SheetHeader className="mb-4">
          <SheetTitle>{data.label}</SheetTitle>
          <SheetDescription>Created on {data.createdAt}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4">
          {data.imageUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-md">
              <Image src={data.imageUrl || "/placeholder.svg"} alt={data.label} className="h-full w-full object-cover" />
            </div>
          )}

          <div className="grid gap-2">
            <h3 className="font-semibold text-sm">Status</h3>
            <Badge
              variant={data.status === "active" ? "default" : data.status === "inactive" ? "secondary" : "outline"}
            >
              {data.status || "Unknown"}
            </Badge>
          </div>

          {data.dimensions && (
            <div className="grid gap-2">
              <h3 className="font-semibold text-sm">Dimensions</h3>
              <p className="text-sm text-muted-foreground">{data.dimensions}</p>
            </div>
          )}

          {data.pricePaid !== undefined && (
            <div className="grid gap-2">
              <h3 className="font-semibold text-sm">Price Paid</h3>
              <p className="text-sm text-muted-foreground">${data.pricePaid.toFixed(2)}</p>
            </div>
          )}

          {data.notes && (
            <div className="grid gap-2">
              <h3 className="font-semibold text-sm">Notes</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{data.notes}</p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export const columns: ColumnDef<BillboardColumn>[] = [
  {
    accessorKey: "label",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium"
        >
          Label
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center justify-between">
        <div className="font-medium">{row.getValue("label")}</div>
        <MobileDetailView data={row.original} />
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-transparent p-0 font-medium"
        >
          <Calendar className="mr-2 h-4 w-4" />
          Date Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="text-muted-foreground">{row.getValue("createdAt")}</div>,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]

