import { ProductClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { ProductColumn } from "./_components/columns";
import { formatter } from "@/lib/utils";
import { PackageIcon, BoxesIcon, CalendarIcon } from "lucide-react";

const ProductsPage = async ({ params }: { params: Promise<{ storeId: string }> }) => {
  const { storeId } = await params;

  const products = await prismadb.product.findMany({
    where: { storeId },
    include: {
      category: true,
      size: true,
      color: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured ? "Yes" : "No",
    isArchived: item.isArchived ? "Yes" : "No",
    price: formatter.format(item.price.toNumber()),
    category: item.category.name,
    size: item.size.name,
    color: item.color.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <header className="bg-white shadow-md px-8 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <PackageIcon className="w-6 h-6 text-indigo-600" />
          Products Dashboard
        </h1>
      </header>
      <main className="flex-1 p-8">
        <section className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <BoxesIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Product List</h2>
          </div>
          <ProductClient data={formattedProducts} />
          {formattedProducts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
              <CalendarIcon className="mx-auto mb-4 w-8 h-8 text-gray-400" />
              No Products Available
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ProductsPage;