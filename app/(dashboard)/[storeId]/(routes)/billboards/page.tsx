import { BillboardClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { BillboardColumn } from "./_components/columns";

const BillboardsPage = async ({params,}:{
    children: React.ReactNode;
    params: Promise<{ storeId: string }>;
}) => {
    const { storeId } = await params; // Await params to access storeId

    const billboards = await prismadb.billboard.findMany({
        where: {
            storeId: storeId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const formattedBillboard: BillboardColumn[] = billboards.map((item) => ({
        id: item.id,
        label: item.label,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <BillboardClient data={formattedBillboard} />
            </div>
        </div>
    );
};

export default BillboardsPage;
