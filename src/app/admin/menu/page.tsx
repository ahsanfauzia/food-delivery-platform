import { prisma } from "@/lib/prisma";
import MenuItemManager from "@/components/admin/MenuItemManager";

export const revalidate = 0; // Disable cache for CRUD controls

export default async function AdminMenuPage() {
  // Fetch menu items with related restaurant and category names
  const menuItems = await prisma.menuItem.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      restaurant: { select: { name: true } },
      category: { select: { name: true } },
    },
  });

  // Fetch dropdown collections
  const restaurants = await prisma.restaurant.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <MenuItemManager
      initialMenuItems={menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        isVeg: item.isVeg,
        isBestseller: item.isBestseller,
        restaurantName: item.restaurant.name,
        categoryName: item.category.name,
      }))}
      restaurants={restaurants}
      categories={categories}
    />
  );
}
