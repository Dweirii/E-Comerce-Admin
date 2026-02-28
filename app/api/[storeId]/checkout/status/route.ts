import prismadb from "@/lib/prismadb";
import { getPaymentStatus } from "@/lib/hyperpay";
import { NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

/** HyperPay success: 000.000.000 = Transaction succeeded */
function isSuccessfulResultCode(code: string): boolean {
  return code.startsWith("000.") || code === "000.000.000";
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;
    const { searchParams } = new URL(req.url);
    const resourcePath = searchParams.get("resourcePath");
    console.log("[Checkout/status] GET storeId:", storeId, "resourcePath:", resourcePath ? "present" : "missing");

    if (!resourcePath) {
      return new NextResponse(
        JSON.stringify({ success: false, error: "resourcePath is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusResponse = await getPaymentStatus(resourcePath);
    const orderId =
      statusResponse["merchantTransactionId"] ??
      statusResponse.merchantTransactionId ??
      statusResponse.customParameters?.merchantTransactionId;

    if (!orderId) {
      console.error("HyperPay status response missing order ref:", JSON.stringify(statusResponse));
      return NextResponse.json(
        { success: false, error: "No order reference in payment" },
        { status: 400, headers: corsHeaders }
      );
    }

    const order = await prismadb.order.findFirst({
      where: { id: orderId, storeId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const resultCode = statusResponse.result?.code ?? "";
    const success = isSuccessfulResultCode(resultCode);

    if (success) {
      await prismadb.order.update({
        where: { id: orderId },
        data: { isPaid: true },
      });
    }

    return NextResponse.json(
      { success, orderId, storeId },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in GET checkout status:", message, error);
    return new NextResponse(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}

export async function POST(
  req: Request,
  context: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await context.params;
    const body = await req.json().catch(() => ({}));
    const resourcePath = body.resourcePath;

    if (!resourcePath || typeof resourcePath !== "string") {
      return new NextResponse(
        JSON.stringify({ success: false, error: "resourcePath is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const statusResponse = await getPaymentStatus(resourcePath);
    const orderId =
      statusResponse["merchantTransactionId"] ??
      statusResponse.merchantTransactionId ??
      statusResponse.customParameters?.merchantTransactionId;

    if (!orderId) {
      console.error("HyperPay status response missing order ref (POST):", JSON.stringify(statusResponse));
      return NextResponse.json(
        { success: false, error: "No order reference in payment" },
        { status: 400, headers: corsHeaders }
      );
    }

    const order = await prismadb.order.findFirst({
      where: { id: orderId, storeId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    const resultCode = statusResponse.result?.code ?? "";
    const success = isSuccessfulResultCode(resultCode);

    if (success) {
      await prismadb.order.update({
        where: { id: orderId },
        data: { isPaid: true },
      });
    }

    return NextResponse.json(
      { success, orderId, storeId },
      { headers: corsHeaders }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    console.error("Error in POST checkout status:", message, error);
    return new NextResponse(
      JSON.stringify({ success: false, error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
