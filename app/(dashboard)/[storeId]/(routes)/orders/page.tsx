// app/(dashboard)/[storeId]/orders/page.tsx
import { OrderClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { OrderColumn } from "./_components/columns";
import { formatter } from "@/lib/utils";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const { storeId } = params;

  const orders = await prismadb.order.findMany({
    where: {
      storeId: storeId,
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => {
    const delivery = JSON.parse(item.deliveryDetails || "{}");
  
    return {
      id: item.id,
      fullName: delivery.fullName || "-",
      phone: delivery.phoneNumber || "-",
      address: `${delivery.city || ""} - ${delivery.address || ""}`,
      notes: delivery.notes || "",
      isPaid: item.isPaid,
      products: item.orderItems.map((orderItem) => orderItem.product.name).join(", "),
      totalPrice: formatter.format(item.price.toNumber()),
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    };
  });
  

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;