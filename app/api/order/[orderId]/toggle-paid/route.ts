import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await context.params;
    const order = await prismadb.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const updated = await prismadb.order.update({
      where: { id: orderId },
      data: { isPaid: !order.isPaid },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating paid status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
