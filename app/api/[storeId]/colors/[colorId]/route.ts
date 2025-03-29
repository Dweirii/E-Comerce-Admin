import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";


export async function GET (
    req: Request,
    context: { params: Promise<{ storeId: string, colorId: string }> }
) {
    try {
        const { colorId } = await context.params;

        if(!colorId) {
            return new NextResponse("color id is required", {status: 400});
        }

        const color = await prismadb.color.findUnique({
            where: {
                id: colorId,
            }
        });

        return NextResponse.json(color);
        
    } catch (error) {
        console.log("color_GET]",error);
        return new NextResponse("Internal Server Error", {status: 500});
    }
};

export async function PATCH (
    req: Request,
    context: { params: Promise<{ storeId: string, colorId: string }> }
) {
    try {
        const { userId } = await auth();
        const body = await req.json();
        const { storeId, colorId } = await context.params;

        const { name, value } = body;

        if(!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", {status: 400});
        }

        if (!value) {
            return new NextResponse("Value is required", {status: 400});
        }


        if(!colorId) {
            return new NextResponse("color id is required", {status: 400});
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if(!storeByUserId) {
            return new NextResponse("Unauthorize" , {status: 403});
        }

        const color = await prismadb.color.updateMany({
            where: {
                id: colorId,
            },
            data: {
                name,
                value
            }
        });

        return NextResponse.json(color);

    } catch (error) {
        console.log("[color_patch]",error);
        return new NextResponse("Internal Server Error", {status: 500});
    }

};

export async function DELETE (
    req: Request,
    context: { params: Promise<{ storeId: string, colorId: string }> }
) {
    try {
        const { userId } = await auth();
        const { storeId, colorId } = await context.params;

        if(!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: storeId,
                userId
            }
        });

        if(!storeByUserId) {
            return new NextResponse("Unauthorize" , {status: 403});
        }

        if(!colorId) {
            return new NextResponse("color id is required", {status: 400});
        }

        const color = await prismadb.color.deleteMany({
            where: {
                id: colorId,
            }
        });

        return NextResponse.json(color);
        
    } catch (error) {
        console.log("[color_DELETE]",error);
        return new NextResponse("Internal Server Error", {status: 500});
    }
}