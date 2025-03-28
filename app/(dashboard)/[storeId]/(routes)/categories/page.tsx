import { CategoyClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { CategoryColumn } from "./_components/columns";
import { LayoutGridIcon, TagIcon, CalendarIcon } from "lucide-react";

const CategoriesPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;

  const categories = await prismadb.category.findMany({
    where: { storeId },
    include: { billboard: true },
    orderBy: { createdAt: "desc" },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <LayoutGridIcon className="w-6 h-6 text-indigo-600" />
          Categories Dashboard
        </h1>
      </header>
      <main className="flex-1 p-8">
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <TagIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Categories List</h2>
          </div>
          <CategoyClient data={formattedCategories} />
          {formattedCategories.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <CalendarIcon className="mx-auto mb-4 w-8 h-8 text-gray-400" />
              No Categories Available
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CategoriesPage;