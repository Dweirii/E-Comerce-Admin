import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { Prisma } from "@prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;

    if (!storeId) {
      return new NextResponse("Store ID is required.", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const { productsIds, deliveryDetails } = await req.json();

    if (!productsIds || productsIds.length === 0) {
      return new NextResponse("Product IDs are required.", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productsIds,
        },
      },
    });

    // Calculate the total price
    const totalPrice = products.reduce((sum, product) => {
      return sum + product.price.toNumber();
    }, 0);

    // Create the order
    const order = await prismadb.order.create({
      data: {
        storeId: storeId,
        isPaid: false,
        price: new Prisma.Decimal(totalPrice),
        deliveryDetails: JSON.stringify(deliveryDetails),
        orderItems: {
          create: productsIds.map((productId: string) => {
            const product = products.find((p) => p.id === productId);
            return {
              product: { connect: { id: productId } },
              price: product?.price || new Prisma.Decimal(0),
            };
          }),
        },
      },
    });

    return NextResponse.json({ success: true, orderId: order.id }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error in cash checkout", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
