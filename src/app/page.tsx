import { prisma } from "@/lib/prisma";
import RestaurantCard from "@/components/customer/RestaurantCard";
import Link from "next/link";
import { ArrowRight, Sparkles, Flame, Tag } from "lucide-react";
import { mockCategories, mockRestaurants, mockCoupons } from "@/lib/mockData";

export const dynamic = "force-dynamic";

export default async function Home() {
  let categories = mockCategories;
  let restaurants = mockRestaurants;
  let coupons = mockCoupons;

  try {
    const [dbCategories, dbRestaurants, dbCoupons] = await Promise.all([
      prisma.category.findMany({ take: 8 }),
      prisma.restaurant.findMany({ where: { active: true }, take: 8 }),
      prisma.coupon.findMany({ where: { active: true }, take: 2 }),
    ]);

    if (dbCategories.length > 0) categories = dbCategories;
    if (dbRestaurants.length > 0) restaurants = dbRestaurants;
    if (dbCoupons.length > 0) coupons = dbCoupons;
  } catch (error) {
    console.warn("Database paused/offline. Serving resilient rich fallback data.");
  }

  return (
    <div className="space-y-16 pb-24">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 text-white py-24 sm:py-32 px-4 rounded-b-[40px] shadow-2xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_50%)]"></div>
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase">
            <Sparkles className="h-4 w-4 animate-spin" />
            <span>Premium Food Delivery</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Craving for Deliciousness? <br />
            We Deliver it <span className="underline decoration-wavy decoration-yellow-300">Hot & Fresh</span>.
          </h1>
          <p className="text-lg sm:text-xl text-orange-50 max-w-2xl mx-auto font-medium">
            Explore the best restaurants, local delicacies, and trending cuisines available for delivery.
          </p>

          {/* Search Button Link */}
          <div className="flex justify-center pt-4">
            <Link
              href="/restaurants"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-extrabold rounded-full text-orange-600 bg-white hover:bg-orange-50 hover:scale-105 transition-all shadow-xl hover:shadow-orange-700/30"
            >
              Order Now
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Categories Section */}
        {categories.length > 0 && (
          <section className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
                  <Flame className="h-6 w-6 text-orange-500 mr-2" /> What&apos;s on your mind?
                </h2>
                <p className="text-sm text-gray-500 mt-1">Explore our curated categories of cuisines</p>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-6">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/restaurants?category=${encodeURIComponent(category.name)}`}
                  className="group text-center space-y-3 block"
                >
                  <div className="relative mx-auto h-24 w-24 sm:h-28 sm:w-28 rounded-full overflow-hidden border-2 border-transparent group-hover:border-orange-500 group-hover:shadow-md transition-all duration-300 bg-white shadow-sm">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-orange-500 transition-colors">
                    {category.name}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Promo Deals Banners */}
        {coupons.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-3xl p-6 shadow-md relative overflow-hidden flex items-center justify-between group hover:shadow-xl transition-shadow"
              >
                <div className="space-y-2 relative z-10">
                  <span className="bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest">
                    Offer Code: {coupon.code}
                  </span>
                  <h3 className="text-2xl font-black">
                    {coupon.discountType === "PERCENTAGE"
                      ? `${coupon.discountValue}% OFF`
                      : `₹${coupon.discountValue} FLAT OFF`}
                  </h3>
                  <p className="text-xs text-orange-50">
                    Min order: ₹{coupon.minOrderAmount}
                    {coupon.maxDiscount ? ` | Max discount: ₹${coupon.maxDiscount}` : ""}
                  </p>
                </div>
                <div className="relative z-10 shrink-0 bg-white/20 backdrop-blur-md p-4 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
                  <Tag className="h-8 w-8 text-white" />
                </div>
                <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 h-32 w-32 rounded-full bg-white/10 blur-2xl"></div>
              </div>
            ))}
          </section>
        )}

        {/* Restaurants Grid Section */}
        <section className="space-y-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Top Rated Restaurants
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Handpicked options for high-quality food delivery
            </p>
          </div>

          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {restaurants.map((restaurant) => (
                <RestaurantCard key={restaurant.id} restaurant={restaurant} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 p-12 text-center rounded-3xl">
              <p className="text-gray-500 font-semibold">No restaurants available right now.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
