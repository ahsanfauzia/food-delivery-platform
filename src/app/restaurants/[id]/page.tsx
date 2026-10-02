import { prisma } from "@/lib/prisma";
import RestaurantMenu from "@/components/customer/RestaurantMenu";
import { notFound } from "next/navigation";
import { mockRestaurants } from "@/lib/mockData";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RestaurantDetailPage({ params }: PageProps) {
  const { id } = await params;

  let restaurant: any = null;

  try {
    restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        menuItems: {
          where: { available: true },
          include: {
            category: true,
          },
        },
      },
    });
  } catch (err) {
    // Database offline fallback
  }

  if (!restaurant) {
    restaurant = mockRestaurants.find((r) => r.id === id) || mockRestaurants[0];
  }

  if (!restaurant) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <RestaurantMenu
        restaurant={{
          id: restaurant.id,
          name: restaurant.name,
          description: restaurant.description,
          address: restaurant.address,
          image: restaurant.image,
          rating: restaurant.rating,
          deliveryTime: restaurant.deliveryTime,
          deliveryFee: restaurant.deliveryFee,
        }}
        menuItems={(restaurant.menuItems || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          isVeg: item.isVeg,
          isBestseller: item.isBestseller,
          available: item.available ?? true,
          category: {
            name: item.category?.name || "Specialities",
          },
        }))}
      />
    </div>
  );
}
