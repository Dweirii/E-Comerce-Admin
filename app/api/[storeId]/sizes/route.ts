import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

// POST: Create a size
export async function POST(
    req: Request,
    context: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await context.params;
        const { userId } = await auth();
        const body = await req.json();
        const { name, value } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!value) {
            return new NextResponse("Value is required", { status: 400 });
        }

        if (!storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId,
            },
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        const size = await prismadb.size.create({
            data: {
                name,
                value,
                storeId,
            },
        });

        return NextResponse.json(size);
    } catch (error) {
        console.error("Error in POST--Size:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}

// GET: Fetch all sizes for a store
export async function GET(
    req: Request,
    context: { params: Promise<{ storeId: string }> }
) {
    try {
        const { storeId } = await context.params;

        if (!storeId) {
            return new NextResponse("Store ID is required", { status: 400 });
        }

        const sizes = await prismadb.size.findMany({
            where: {
                storeId,
            },
        });

        return NextResponse.json(sizes);
    } catch (error) {
        console.error("Error in GET--Sizes:", error);
        return new NextResponse("Internal server error", { status: 500 });
    }
}
