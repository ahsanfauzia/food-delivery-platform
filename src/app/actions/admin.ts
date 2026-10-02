"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// Helper to verify Admin authorization
async function ensureAdmin() {
  const session = await auth();
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    throw new Error("Unauthorized access. Admin privileges required.");
  }
}

// ==========================================
// Order Management Actions
// ==========================================

export async function updateOrderStatus(orderId: string, status: string) {
  await ensureAdmin();
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update order status." };
  }
}

export async function assignDeliveryPartner(orderId: string, partnerId: string) {
  await ensureAdmin();
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: {
        deliveryPartnerId: partnerId || null,
        status: "CONFIRMED", // Auto-confirm once partner is assigned
      },
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to assign delivery partner." };
  }
}

// ==========================================
// Restaurant CRUD Actions
// ==========================================

export async function createRestaurant(data: {
  name: string;
  description: string;
  address: string;
  image: string;
  deliveryTime: number;
  deliveryFee: number;
}) {
  await ensureAdmin();
  try {
    await prisma.restaurant.create({
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        image: data.image,
        deliveryTime: Number(data.deliveryTime),
        deliveryFee: Number(data.deliveryFee),
      },
    });
    revalidatePath("/admin/restaurants");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create restaurant." };
  }
}

export async function updateRestaurant(id: string, data: {
  name: string;
  description: string;
  address: string;
  image: string;
  deliveryTime: number;
  deliveryFee: number;
  active: boolean;
}) {
  await ensureAdmin();
  try {
    await prisma.restaurant.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        address: data.address,
        image: data.image,
        deliveryTime: Number(data.deliveryTime),
        deliveryFee: Number(data.deliveryFee),
        active: data.active,
      },
    });
    revalidatePath("/admin/restaurants");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update restaurant." };
  }
}

export async function deleteRestaurant(id: string) {
  await ensureAdmin();
  try {
    await prisma.restaurant.delete({
      where: { id },
    });
    revalidatePath("/admin/restaurants");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete restaurant." };
  }
}

// ==========================================
// Category CRUD Actions
// ==========================================

export async function createCategory(data: { name: string; image: string; description?: string }) {
  await ensureAdmin();
  try {
    await prisma.category.create({
      data,
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create category." };
  }
}

export async function deleteCategory(id: string) {
  await ensureAdmin();
  try {
    await prisma.category.delete({
      where: { id },
    });
    revalidatePath("/admin/categories");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    if (error.code === "P2003") {
      return { success: false, error: "Cannot delete category. Menu items are currently mapped to it." };
    }
    return { success: false, error: "Failed to delete category." };
  }
}

// ==========================================
// Menu Item CRUD Actions
// ==========================================

export async function createMenuItem(data: {
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  restaurantId: string;
  categoryId: string;
}) {
  await ensureAdmin();
  try {
    await prisma.menuItem.create({
      data: {
        name: data.name,
        description: data.description,
        price: Number(data.price),
        image: data.image,
        isVeg: data.isVeg,
        isBestseller: data.isBestseller,
        restaurantId: data.restaurantId,
        categoryId: data.categoryId,
      },
    });
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create menu item." };
  }
}

export async function deleteMenuItem(id: string) {
  await ensureAdmin();
  try {
    await prisma.menuItem.delete({
      where: { id },
    });
    revalidatePath("/admin/menu");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete menu item." };
  }
}

// ==========================================
// Coupon Management Actions
// ==========================================

export async function createCoupon(data: {
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  expiresAt: Date;
}) {
  await ensureAdmin();
  try {
    await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase(),
        discountType: data.discountType,
        discountValue: Number(data.discountValue),
        minOrderAmount: Number(data.minOrderAmount),
        maxDiscount: data.maxDiscount ? Number(data.maxDiscount) : null,
        expiresAt: new Date(data.expiresAt),
      },
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to create coupon." };
  }
}

export async function deleteCoupon(id: string) {
  await ensureAdmin();
  try {
    await prisma.coupon.delete({
      where: { id },
    });
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to delete coupon." };
  }
}
