import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string; orderId: string }> }
) {
  try {
    const { storeId, orderId } = await context.params;

    const order = await prismadb.order.findFirst({
      where: { id: orderId, storeId },
      include: {
        orderItems: {
          include: {
            product: {
              select: { name: true, id: true },
            },
          },
        },
      },
    });

    if (!order) {
      return new NextResponse("Order not found", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const orderItems = order.orderItems.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.product.name,
      storeId: order.storeId,
    }));

    return NextResponse.json(
      { orderId: order.id, storeId: order.storeId, orderItems },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error("Error in GET order", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
