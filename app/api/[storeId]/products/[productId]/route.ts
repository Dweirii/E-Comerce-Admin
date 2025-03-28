import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function GET(
    req: Request,
    context: { params: Promise<{ productId: string }> }
) {
    try {
        const { productId } = await context.params;

        if (!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const product = await prismadb.product.findUnique({
            where: { id: productId },
            include: {
                image: true,
                category: true,
                size: true,
                color: true,
            },
        });

        if (!product) {
            return new NextResponse("Product not found", { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("[Product_GET]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    context: { params: Promise<{ storeId: string; productId: string }> }
) {
    try {
        const { storeId, productId } = await context.params;
        const { userId } = await auth();
        const body = await req.json();

        const {
            name,
            price,
            colorId,
            categoryId,
            sizeId,
            image,
            isFeatured,
            isArchived,
        } = body;

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        if (!name) {
            return new NextResponse("Name is required", { status: 400 });
        }

        if (!image || !image.length) {
            return new NextResponse("Image URL is required", { status: 400 });
        }

        if (!price) {
            return new NextResponse("Price is required", { status: 400 });
        }

        if (!categoryId) {
            return new NextResponse("Category is required", { status: 400 });
        }

        if (!sizeId) {
            return new NextResponse("Size is required", { status: 400 });
        }

        if (!colorId) {
            return new NextResponse("Color is required", { status: 400 });
        }

        if (!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: { id: storeId, userId },
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        await prismadb.product.update({
            where: { id: productId },
            data: {
                name,
                price,
                categoryId,
                colorId,
                sizeId,
                image: {
                    deleteMany: {},
                },
                isFeatured,
                isArchived,
            },
        });

        const product = await prismadb.product.update({
            where: { id: productId },
            data: {
                image: {
                    createMany: {
                        data: image.map((img: { url: string }) => ({ url: img.url })),
                    },
                },
            },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[Product_PATCH]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    context: { params: Promise<{ storeId: string; productId: string }> }
) {
    try {
        const { storeId, productId } = await context.params;
        const { userId } = await auth();

        if (!userId) {
            return new NextResponse("Unauthenticated", { status: 401 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: { id: storeId, userId },
        });

        if (!storeByUserId) {
            return new NextResponse("Unauthorized", { status: 403 });
        }

        if (!productId) {
            return new NextResponse("Product id is required", { status: 400 });
        }

        const product = await prismadb.product.delete({
            where: { id: productId },
        });

        return NextResponse.json(product);
    } catch (error) {
        console.error("[Product_DELETE]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
