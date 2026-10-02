"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function ensureDeliveryPartner() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    throw new Error("Unauthorized access. Logged-in session required.");
  }

  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
  });

  if (!partner) {
    throw new Error("Unauthorized access. Delivery profile not found.");
  }

  return partner;
}

export async function updatePartnerStatus(status: "AVAILABLE" | "BUSY" | "OFFLINE") {
  try {
    const partner = await ensureDeliveryPartner();
    await prisma.deliveryPartner.update({
      where: { id: partner.id },
      data: { status },
    });
    revalidatePath("/delivery");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update availability status." };
  }
}

export async function updateDeliveryStatus(orderId: string, status: "OUT_FOR_DELIVERY" | "DELIVERED") {
  try {
    const partner = await ensureDeliveryPartner();

    // Verify order is assigned to this partner
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.deliveryPartnerId !== partner.id) {
      return { success: false, error: "Order not found or not assigned to you." };
    }

    const updateData: any = { status };

    // If order is delivered, check if we need to auto-complete payment (like for Cash on Delivery)
    if (status === "DELIVERED") {
      updateData.paymentStatus = "COMPLETED";
    }

    await prisma.order.update({
      where: { id: orderId },
      data: updateData,
    });

    revalidatePath("/delivery");
    revalidatePath(`/orders/tracking/${orderId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update delivery status." };
  }
}
