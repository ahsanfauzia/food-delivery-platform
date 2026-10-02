"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function validateCoupon(code: string, orderAmount: number) {
  try {
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      return { success: false, error: "Invalid or inactive coupon code." };
    }

    if (new Date() > coupon.expiresAt) {
      return { success: false, error: "Coupon code has expired." };
    }

    if (orderAmount < coupon.minOrderAmount) {
      return {
        success: false,
        error: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon.`,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return {
      success: true,
      discountAmount,
      code: coupon.code,
    };
  } catch (error) {
    console.error("Coupon validation error:", error);
    return { success: false, error: "An error occurred while validating the coupon." };
  }
}

export async function createOrder(formData: {
  restaurantId: string;
  addressId: string;
  paymentMethod: string;
  items: { id: string; price: number; quantity: number }[];
  couponCode?: string;
}) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized. Please login again." };
  }

  try {
    // 1. Fetch restaurant for delivery fee
    const restaurant = await prisma.restaurant.findUnique({
      where: { id: formData.restaurantId },
    });

    if (!restaurant) {
      return { success: false, error: "Restaurant not found." };
    }

    // 2. Calculate subtotal
    const subtotal = formData.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3. Apply discount if coupon exists
    let discountAmount = 0;
    if (formData.couponCode) {
      const couponRes = await validateCoupon(formData.couponCode, subtotal);
      if (couponRes.success && couponRes.discountAmount) {
        discountAmount = couponRes.discountAmount;
      }
    }

    const deliveryFee = restaurant.deliveryFee;
    const finalAmount = Math.max(0, subtotal + deliveryFee - discountAmount);

    // 4. Generate random short human-readable order number
    const orderNumber = `FD-${Math.floor(100000 + Math.random() * 900000)}`;

    // 5. Write to DB
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "PLACED",
        totalAmount: subtotal,
        deliveryFee,
        discountAmount,
        finalAmount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentMethod === "COD" ? "PENDING" : "PENDING",
        userId: session.user.id,
        restaurantId: formData.restaurantId,
        addressId: formData.addressId,
        items: {
          create: formData.items.map((item) => ({
            quantity: item.quantity,
            price: item.price,
            menuItemId: item.id,
          })),
        },
      },
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
    };
  } catch (error) {
    console.error("Order creation error:", error);
    return { success: false, error: "Failed to place order. Please try again." };
  }
}

export async function getRestaurantDeliveryInfo(id: string) {
  try {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      select: { deliveryFee: true, deliveryTime: true },
    });
    return { success: true, data: restaurant };
  } catch (error) {
    return { success: false, error: "Failed to load delivery info." };
  }
}

export async function addUserAddress(formData: {
  title: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}) {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return { success: false, error: "Unauthorized." };
  }

  try {
    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        title: formData.title,
        street: formData.street,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        phone: formData.phone,
      },
    });
    return { success: true, address };
  } catch (error) {
    console.error("Address creation error:", error);
    return { success: false, error: "Failed to add address." };
  }
}

export async function getOrderStatus(id: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        deliveryPartner: {
          include: {
            user: {
              select: { name: true, phone: true },
            },
          },
        },
      },
    });
    if (!order) return { success: false, error: "Order not found." };
    return { success: true, order };
  } catch (error) {
    return { success: false, error: "Failed to fetch order status." };
  }
}
