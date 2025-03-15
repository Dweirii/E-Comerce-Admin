import { CategoyClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { CategoryColumn } from "./_components/columns";

const CategoriesPage = async ({
                                  params,
                              }: {
    params: Promise<{ storeId: string }>;
}) => {
    const { storeId } = await params; // Await params to access storeId

    const categories = await prismadb.category.findMany({
        where: {
            storeId: storeId,
        },
        include: {
            billboard: true,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const formattedCategories: CategoryColumn[] = categories.map((item) => ({
        id: item.id,
        name: item.name,
        billboardLabel: item.billboard.label,
        createdAt: format(item.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <CategoyClient data={formattedCategories} />
            </div>
        </div>
    );
};

export default CategoriesPage;
