import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

// Handle POST: Create or Update Metadata
export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { userId } = await auth();
    const { storeId } = await context.params;
    const { title, description } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const store = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!store) {
      return new NextResponse("Forbidden", { status: 403 });
    }

    const existingMetadata = await prismadb.pageMetadata.findFirst({
      where: { storeId },
    });

    if (existingMetadata) {
      await prismadb.pageMetadata.update({
        where: { id: existingMetadata.id },
        data: { title, description },
      });
    } else {
      await prismadb.pageMetadata.create({
        data: {
          storeId,
          title,
          description,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[METADATA_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Handle GET: Fetch Metadata for a store
export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;
    const metadata = await prismadb.pageMetadata.findFirst({
      where: { storeId },
    });

    return NextResponse.json({
      title: metadata?.title || "Online Store",
      description: metadata?.description || "The best Online Store!",
    });
  } catch (error) {
    console.error("[METADATA_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
