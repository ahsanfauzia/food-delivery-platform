import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature") as string;

  let event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.warn("WARNING: STRIPE_WEBHOOK_SECRET is not configured. Webhook signature verification bypassed.");
      // Simulated event parsing for local sandbox testing
      const parsedBody = JSON.parse(body);
      event = parsedBody;
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (error: any) {
    console.error("Stripe Webhook Signature Verification Failed:", error.message);
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  // Handle successful payments fulfillment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      try {
        await prisma.$transaction([
          // Update Order Status
          prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "COMPLETED",
              status: "CONFIRMED", // Order ready to be prepared
            },
          }),
          // Update Payment status
          prisma.payment.update({
            where: { orderId },
            data: {
              status: "COMPLETED",
            },
          }),
        ]);
        console.log(`Fulfillment success: Order ${orderId} marked as COMPLETED.`);
      } catch (dbError) {
        console.error("Database update error during webhook execution:", dbError);
        return NextResponse.json({ error: "Failed to update order database record." }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true });
}
