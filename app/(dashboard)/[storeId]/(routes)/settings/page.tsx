import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import { SettingsForm } from "./_components/settings-form";
import { ModeToggle } from "@/components/theme-toggle";

interface SettingsPageProps {
    params: Promise<{ storeId: string }>;
}

const SettingsPage = async ({ params }: SettingsPageProps) => {
    const { storeId } = await params; // Await params to access storeId

    const { userId } = await auth();

    if (!userId) {
        redirect("/sign-in");
    }

    const store = await prismadb.store.findFirst({
        where: {
            id: storeId,
            userId,
        },
    });

    if (!store) {
        redirect("/");
    }

    return (
        <div className="flex-col">
            <div className="flex-1 space-y-4 p-8 pt-6">
                <SettingsForm initialData={store} />
                <ModeToggle/>
            </div>
        </div>
    );
};

export default SettingsPage;
