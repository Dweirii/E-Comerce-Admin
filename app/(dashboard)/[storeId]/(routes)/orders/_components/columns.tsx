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

// New component to handle the toggle
const PaidStatusToggle = ({ orderId, isPaid }: { orderId: string, isPaid: boolean }) => {
  const router = useRouter();

  const handleToggle = async () => {
    try {
      await axios.patch(`/api/order/${orderId}/toggle-paid`);
      toast.success("Payment status updated.");
      router.refresh();
    } catch {
      toast.error("Failed to update status.");
    }
  };

  return <Switch checked={isPaid} onCheckedChange={handleToggle} />;
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
      return <PaidStatusToggle orderId={order.id} isPaid={order.isPaid} />;
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
