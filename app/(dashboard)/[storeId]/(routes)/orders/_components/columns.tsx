"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Switch } from "@/components/ui/switch"
import axios from "axios"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"



export type OrderColumn = {
  id: string;
  fullName: string;
  phone: string;
  address: string;
  notes?: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
};


export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "fullName",
    header: "Customer Name",
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => row.original.notes || "-",
  },
  
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
    cell: ({ row }) => {
      const order = row.original;
      const router = useRouter();

      const handleToggle = async () => {
        try {
          await axios.patch(`/api/order/${order.id}/toggle-paid`);
          toast.success("Payment status updated.");
          router.refresh();
        } catch (err) {
          toast.error("Failed to update status.");
        }
      };

      return (
        <Switch
          checked={order.isPaid}
          onCheckedChange={handleToggle}
        />
      );
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
];
