import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { orderId: string } }
) {
  try {
    const order = await prismadb.order.findUnique({
      where: { id: params.orderId },
    });

    if (!order) {
      return new NextResponse("Order not found", { status: 404 });
    }

    const updated = await prismadb.order.update({
      where: { id: params.orderId },
      data: { isPaid: !order.isPaid },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating paid status:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
