import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

// POST: Create a category
export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params; // Await params to access storeId
    const { userId } = await auth();
    const body = await req.json();
    const { name, billboardId } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }
    if (!billboardId) {
      return new NextResponse("Billboard ID is required", { status: 400 });
    }

    const store = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const category = await prismadb.category.create({
      data: { name, billboardId, storeId },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("[CATEGORY_POST]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET: Fetch categories
export async function GET(
  _req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params; // Await params to access storeId

    const categories = await prismadb.category.findMany({
      where: { storeId },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORY_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
