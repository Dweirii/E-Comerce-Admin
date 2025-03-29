import { OrderClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { OrderColumn } from "./_components/columns";
import { formatter } from "@/lib/utils";
import { ShoppingCartIcon, ClipboardListIcon, CalendarIcon } from "lucide-react";

interface PageProps {
    params: Promise<{
        storeId: string;
    }>;
}

const OrdersPage = async ({ params }: PageProps) => {
    const { storeId } = await params;

    const orders = await prismadb.order.findMany({
        where: { storeId },
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
        <div className="flex flex-col min-h-screen bg-gray-100">
            <header className="bg-white shadow-md px-8 py-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <ShoppingCartIcon className="w-6 h-6 text-indigo-600" />
                    Orders Dashboard
                </h1>
            </header>
            <main className="flex-1 p-8">
                <section className="bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <ClipboardListIcon className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-semibold">Order List</h2>
                    </div>
                    <OrderClient data={formattedOrders} />
                    {formattedOrders.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <CalendarIcon className="mx-auto mb-4 w-8 h-8 text-gray-400" />
                            No Orders Available
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default OrdersPage;