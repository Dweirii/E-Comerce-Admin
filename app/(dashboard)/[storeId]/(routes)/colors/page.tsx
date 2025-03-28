import { ColorClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { ColorColumn } from "./_components/columns";
import { PaletteIcon, DropletIcon, CalendarIcon } from "lucide-react";

const ColorPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;

  const colors = await prismadb.color.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
  });

  const formattedColors: ColorColumn[] = colors.map((color) => ({
    id: color.id,
    name: color.name,
    value: color.value,
    createdAt: format(color.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PaletteIcon className="w-6 h-6 text-indigo-600" />
          Colors Dashboard
        </h1>
      </header>
      <main className="flex-1 p-8">
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <DropletIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Color List</h2>
          </div>
          <ColorClient data={formattedColors} />
          {formattedColors.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <CalendarIcon className="mx-auto mb-4 w-8 h-8 text-gray-400" />
              No Colors Available
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ColorPage;