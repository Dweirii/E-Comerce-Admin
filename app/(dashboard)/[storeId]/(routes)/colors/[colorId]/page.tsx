import prismadb from "@/lib/prismadb";
import { ColorsForm } from "./_components/color-form";

const ColorsPage = async ({
                              params,
                          }: {
    params: Promise<{ colorId: string }>;
}) => {
    const { colorId } = await params; // Await params to access colorId

    const color = await prismadb.color.findUnique({
        where: {
            id: colorId,
        },
    });

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <ColorsForm initialData={color} />
            </div>
        </div>
    );
};

export default ColorsPage;
