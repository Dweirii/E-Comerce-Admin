import prismadb from "@/lib/prismadb";
import { prepareCheckout, getWidgetScriptUrl } from "@/lib/hyperpay";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

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

    const body = await req.json();
    const productIds = body.productIds;
    const customer = body.customer ?? {};
    const billing = body.billing ?? {};
    console.log("[Checkout] customer keys:", Object.keys(customer), "| billing keys:", Object.keys(billing));

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

    const frontendUrl = (process.env.FRONTEND_STORE_URL || "").replace(/\/?$/, "");
    if (!frontendUrl) {
      console.error("[Checkout] FRONTEND_STORE_URL is not set");
      return new NextResponse(
        JSON.stringify({ error: "Server misconfiguration: FRONTEND_STORE_URL missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const shopperResultUrl = `${frontendUrl}/payment/result?storeId=${encodeURIComponent(storeId)}`;

    const email = typeof customer.email === "string" ? customer.email.trim() : "";
    const givenName = typeof customer.givenName === "string" ? customer.givenName.trim() : "";
    const surname = typeof customer.surname === "string" ? customer.surname.trim() : "";
    const street1 = typeof billing.street1 === "string" ? billing.street1.trim() : "";
    const city = typeof billing.city === "string" ? billing.city.trim() : "";
    const state = typeof billing.state === "string" ? billing.state.trim() : "";
    const country = typeof billing.country === "string" ? billing.country.trim() : "";
    const postcode = typeof billing.postcode === "string" ? billing.postcode.trim() : "";

    const missing: string[] = [];
    if (!email) missing.push("customer.email");
    if (!givenName) missing.push("customer.givenName");
    if (!surname) missing.push("customer.surname");
    if (!street1) missing.push("billing.street1");
    if (!city) missing.push("billing.city");
    if (!country) missing.push("billing.country");
    if (!postcode) missing.push("billing.postcode");
    if (missing.length > 0) {
      console.error("[Checkout] Missing mandatory fields:", missing.join(", "));
      return new NextResponse(
        JSON.stringify({ error: `Missing required fields: ${missing.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amount = totalPrice.toFixed(2);
    // shopperResultUrl is NOT sent in prepareCheckout for synchronous DB (VISA/MASTER) payments.
    // For COPYandPAY, it is only set via the <form action> in the widget.
    // Sending it here AND in the form causes HyperPay error: "shopperResultUrl was already set and cannot be overwritten".
    const hyperpayResponse = await prepareCheckout({
      amount,
      currency: "JOD",
      paymentType: "DB",
      merchantTransactionId: order.id,
      integrity: true,
      "customer.email": email,
      "customer.givenName": givenName,
      "customer.surname": surname,
      "billing.street1": street1,
      "billing.city": city,
      "billing.state": state || undefined,
      "billing.country": country,
      "billing.postcode": postcode,
    });

    return NextResponse.json(
      {
        checkoutId: hyperpayResponse.id,
        orderId: order.id,
        storeId,
        integrity: hyperpayResponse.integrity ?? undefined,
        shopperResultUrl,
        widgetScriptUrl: getWidgetScriptUrl(),
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Internal server error";
    console.error("[Checkout] Error:", msg, error);
    return new NextResponse(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
