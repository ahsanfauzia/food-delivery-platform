import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  if (!orderId) {
    return NextResponse.json({ error: "Missing order ID" }, { status: 400 });
  }

  try {
    // Update order status to CONFIRMED and payment to COMPLETED to simulate successful card payment
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "COMPLETED",
        status: "CONFIRMED",
      },
    });

    // Create a mock payment record linked to this order
    await prisma.payment.create({
      data: {
        orderId: updatedOrder.id,
        amount: updatedOrder.finalAmount,
        status: "COMPLETED",
        method: "STRIPE_MOCK",
        stripeSessionId: `mock_session_${Math.random().toString(36).substring(7)}`,
      },
    });

    // Redirect to the Order Tracking page
    return NextResponse.redirect(new URL(`/orders/tracking/${orderId}`, req.url));
  } catch (error) {
    console.error("Payment fallback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
