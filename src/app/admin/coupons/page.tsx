import { prisma } from "@/lib/prisma";
import CouponManager from "@/components/admin/CouponManager";

export const revalidate = 0; // Disable caching to see realtime updates

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <CouponManager
      initialCoupons={coupons.map((c) => ({
        id: c.id,
        code: c.code,
        discountType: c.discountType,
        discountValue: c.discountValue,
        minOrderAmount: c.minOrderAmount,
        maxDiscount: c.maxDiscount,
        expiresAt: c.expiresAt,
      }))}
    />
  );
}
