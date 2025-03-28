import { BillboardClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { BillboardColumn } from "./_components/columns";
import { LayoutDashboardIcon, CalendarIcon, ListIcon } from "lucide-react";

const BillboardsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;

  const billboards = await prismadb.billboard.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });

  const formattedBillboard: BillboardColumn[] = billboards.map((item) => ({
    id: item.id,
    label: item.label,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutDashboardIcon className="w-6 h-6 text-indigo-600" />
          Billboards Dashboard
        </h1>
      </header>
      <main className="flex-1 p-8">
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <ListIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Billboard List</h2>
          </div>
          <BillboardClient data={formattedBillboard} />
          {formattedBillboard.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <CalendarIcon className="mx-auto mb-4 w-8 h-8 text-gray-400" />
              No Billboards Available
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default BillboardsPage;