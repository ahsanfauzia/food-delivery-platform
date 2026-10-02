import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ error: "Missing order ID." }, { status: 400 });
    }

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { restaurant: true },
    });

    if (!order || order.userId !== session.user.id) {
      return NextResponse.json({ error: "Order not found or access denied." }, { status: 404 });
    }

    // Build absolute redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create Stripe Checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Food Order from ${order.restaurant.name}`,
              description: `Order Ref: #${order.orderNumber}`,
            },
            unit_amount: Math.round(order.finalAmount * 100), // Stripe expects amounts in cents/paise
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${origin}/orders/success/${order.id}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/orders/cancel?orderId=${order.id}`,
      metadata: {
        orderId: order.id,
      },
    });

    // Save Stripe session id in Payment record
    await prisma.payment.upsert({
      where: { orderId: order.id },
      update: {
        stripeSessionId: stripeSession.id,
      },
      create: {
        orderId: order.id,
        amount: order.finalAmount,
        status: "PENDING",
        method: "STRIPE",
        stripeSessionId: stripeSession.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: any) {
    console.error("Stripe checkout session error:", error);
    return NextResponse.json({ error: error.message || "Stripe checkout initialization failed." }, { status: 500 });
  }
}
