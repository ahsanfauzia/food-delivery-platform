import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import OrderTracker from "@/components/customer/OrderTracker";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  const { id } = await params;

  // Fetch full details of this specific order
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      address: true,
      deliveryPartner: {
        include: {
          user: {
            select: { name: true, phone: true },
          },
        },
      },
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Security check: Ensure order belongs to logged-in user, unless they are admin or delivery partner
  if (
    order.userId !== session.user.id &&
    (session.user as any).role !== "ADMIN" &&
    (session.user as any).role !== "DELIVERY_PARTNER"
  ) {
    redirect("/");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Track Your Order</h1>
        <p className="text-sm text-gray-500 mt-1">Get real-time updates on your hot meals</p>
      </div>

      <OrderTracker
        initialOrder={{
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.totalAmount,
          deliveryFee: order.deliveryFee,
          discountAmount: order.discountAmount,
          finalAmount: order.finalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          address: order.address,
          deliveryPartner: order.deliveryPartner,
        }}
      />
    </div>
  );
}
