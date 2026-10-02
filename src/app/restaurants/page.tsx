import { prisma } from "@/lib/prisma";
import RestaurantCard from "@/components/customer/RestaurantCard";
import Link from "next/link";
import { SlidersHorizontal, Search, Star, Clock, Bike } from "lucide-react";
import { mockCategories, mockRestaurants } from "@/lib/mockData";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  category?: string;
  sort?: string;
}

export default async function RestaurantsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const category = params.category || "";
  const sort = params.sort || "rating";

  // Build Prisma query filters
  const where: any = { active: true };
  
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category) {
    where.menuItems = {
      some: {
        category: {
          name: { equals: category, mode: "insensitive" },
        },
      },
    };
  }

  // Build Sorting order
  let orderBy: any = { rating: "desc" };
  if (sort === "time") {
    orderBy = { deliveryTime: "asc" };
  } else if (sort === "fee") {
    orderBy = { deliveryFee: "asc" };
  }

  let restaurants = mockRestaurants;
  let categories = mockCategories;

  try {
    const [dbRestaurants, dbCategories] = await Promise.all([
      prisma.restaurant.findMany({ where, orderBy }),
      prisma.category.findMany(),
    ]);
    if (dbRestaurants.length > 0 || dbCategories.length > 0) {
      restaurants = dbRestaurants;
      categories = dbCategories;
    }
  } catch (error) {
    let filtered = [...mockRestaurants];
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(
        (r) => r.name.toLowerCase().includes(s) || r.description.toLowerCase().includes(s)
      );
    }
    if (category) {
      const c = category.toLowerCase();
      filtered = filtered.filter((r) =>
        r.menuItems?.some((m) => m.category?.name.toLowerCase() === c)
      );
    }
    if (sort === "time") {
      filtered.sort((a, b) => a.deliveryTime - b.deliveryTime);
    } else if (sort === "fee") {
      filtered.sort((a, b) => a.deliveryFee - b.deliveryFee);
    } else {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    restaurants = filtered;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Summary */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          {category ? `${category} Specialities` : "All Restaurants"}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {restaurants.length} {restaurants.length === 1 ? "restaurant" : "restaurants"} available
          {search ? ` matching "${search}"` : ""}
        </p>
      </div>

      {/* Filter and Sort Panels */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        {/* Categories filters */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/restaurants"
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
              !category
                ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100"
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
            }`}
          >
            All
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/restaurants?category=${encodeURIComponent(cat.name)}&sort=${sort}${
                search ? `&search=${search}` : ""
              }`}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all border ${
                category.toLowerCase() === cat.name.toLowerCase()
                  ? "bg-orange-500 text-white border-orange-500 shadow-md shadow-orange-100"
                  : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Sort Panel */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="text-xs font-black text-gray-400 flex items-center">
            <SlidersHorizontal className="h-4 w-4 mr-1 text-gray-400" /> SORT BY:
          </span>
          <div className="inline-flex bg-gray-50 p-1 rounded-xl border border-gray-200">
            <Link
              href={`/restaurants?sort=rating${category ? `&category=${category}` : ""}${
                search ? `&search=${search}` : ""
              }`}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center transition-all ${
                sort === "rating" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Star className="h-3 w-3 mr-1 fill-current" /> Rating
            </Link>
            <Link
              href={`/restaurants?sort=time${category ? `&category=${category}` : ""}${
                search ? `&search=${search}` : ""
              }`}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center transition-all ${
                sort === "time" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Clock className="h-3 w-3 mr-1" /> Delivery Time
            </Link>
            <Link
              href={`/restaurants?sort=fee${category ? `&category=${category}` : ""}${
                search ? `&search=${search}` : ""
              }`}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold flex items-center transition-all ${
                sort === "fee" ? "bg-white text-orange-600 shadow-sm" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Bike className="h-3 w-3 mr-1" /> Delivery Fee
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Restaurants */}
      {restaurants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} restaurant={restaurant} />
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-100 p-24 text-center rounded-3xl shadow-sm">
          <Search className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-800">No Restaurants Found</h3>
          <p className="text-sm text-gray-500 mt-2">
            Try adjusting your search filters or category parameters.
          </p>
          <div className="mt-6">
            <Link
              href="/restaurants"
              className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-bold rounded-full text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-md"
            >
              Clear Filters
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
