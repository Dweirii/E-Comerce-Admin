import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET: Retrieve a specific size
export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { storeId, sizeId } = await context.params;

    if (!sizeId) {
      return new NextResponse("Size ID is required", { status: 400 });
    }

    const size = await prismadb.size.findUnique({
      where: { id: sizeId, storeId },
    });

    if (!size) {
      return new NextResponse("Size not found", { status: 404 });
    }

    return NextResponse.json(size);
  } catch (error) {
    console.error("[Size_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH: Update a specific size
export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId, sizeId } = await context.params;
    const body = await req.json();
    const { name, value } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name || !value) {
      return new NextResponse("Name and Value are required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const updatedSize = await prismadb.size.update({
      where: { id: sizeId, storeId },
      data: { name, value },
    });

    return NextResponse.json(updatedSize);
  } catch (error) {
    console.error("[Size_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Remove a specific size
export async function DELETE(
  req: Request,
  context: { params: Promise<{ storeId: string; sizeId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId, sizeId } = await context.params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const deletedSize = await prismadb.size.delete({
      where: { id: sizeId, storeId },
    });

    return NextResponse.json(deletedSize);
  } catch (error) {
    console.error("[Size_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
