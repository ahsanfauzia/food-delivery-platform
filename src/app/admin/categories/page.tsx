import { prisma } from "@/lib/prisma";
import CategoryManager from "@/components/admin/CategoryManager";

export const revalidate = 0; // Disable cache for CRUD controls

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <CategoryManager
      initialCategories={categories.map((c) => ({
        id: c.id,
        name: c.name,
        image: c.image,
        description: c.description,
      }))}
    />
  );
}
