import { prisma } from "@/lib/prisma";
import RestaurantManager from "@/components/admin/RestaurantManager";

export const revalidate = 0; // Disable cache for CRUD controls

export default async function AdminRestaurantsPage() {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <RestaurantManager
      initialRestaurants={restaurants.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        address: r.address,
        image: r.image,
        rating: r.rating,
        deliveryTime: r.deliveryTime,
        deliveryFee: r.deliveryFee,
        active: r.active,
      }))}
    />
  );
}
