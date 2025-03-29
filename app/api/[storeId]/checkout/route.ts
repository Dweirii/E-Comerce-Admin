import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { Stripe } from "stripe";

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

    const { productIds } = await req.json();

    if (!productIds || productIds.length === 0) {
      return new NextResponse("Product IDs are required.", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const totalPrice = products.reduce((sum, product) => {
      return sum + product.price.toNumber();
    }, 0);

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
      products.map((product) => ({
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: product.name,
          },
          unit_amount: product.price.toNumber() * 100,
        },
      }));

    const order = await prismadb.order.create({
      data: {
        storeId: storeId,
        isPaid: false,
        price: new Prisma.Decimal(totalPrice),
        orderItems: {
          create: productIds.map((productId: string) => {
            const product = products.find((p) => p.id === productId);
            return {
              product: { connect: { id: productId } },
              price: product?.price || new Prisma.Decimal(0),
            };
          }),
        },
      },
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id,
      },
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeaders });
  } catch (error) {
    console.error("Error in POST--Stripe Checkout Session", error);
    return new NextResponse("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}
