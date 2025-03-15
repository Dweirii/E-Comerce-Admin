import { SizesClient } from "./_components/client";
import prismadb from "@/lib/prismadb";
import { format } from "date-fns";
import { SizeColumn } from "./_components/columns";

const SizePage = async ({
                            params,
                        }: {
    params: Promise<{ storeId: string }>;
}) => {
    const { storeId } = await params; // Await params to access storeId

    const sizes = await prismadb.size.findMany({
        where: {
            storeId: storeId,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    const formattedSizes: SizeColumn[] = sizes.map((size) => ({
        id: size.id,
        name: size.name,
        value: size.value,
        createdAt: format(size.createdAt, "MMMM do, yyyy"),
    }));

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SizesClient data={formattedSizes} />
            </div>
        </div>
    );
};

export default SizePage;
