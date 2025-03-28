import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// GET: Retrieve a specific billboard
export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { storeId, billboardId } = await context.params;

    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: { id: billboardId },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[Billboard_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PATCH: Update a specific billboard
export async function PATCH(
  req: Request,
  context: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { storeId, billboardId } = await context.params;
    const { userId } = await auth();
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }
    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }
    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const billboard = await prismadb.billboard.update({
      where: { id: billboardId },
      data: { label, imageUrl },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[Billboard_PATCH]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// DELETE: Remove a specific billboard
export async function DELETE(
  req: Request,
  context: { params: Promise<{ storeId: string; billboardId: string }> }
) {
  try {
    const { storeId, billboardId } = await context.params;
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const billboard = await prismadb.billboard.delete({
      where: { id: billboardId },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.error("[Billboard_DELETE]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
