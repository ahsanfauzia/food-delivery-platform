"use client";

import React, { useState, useTransition } from "react";
import { createMenuItem, deleteMenuItem } from "@/app/actions/admin";
import { Plus, Trash2, Loader2, Utensils, X } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  restaurantName: string;
  categoryName: string;
}

interface DropdownItem {
  id: string;
  name: string;
}

interface MenuItemManagerProps {
  initialMenuItems: MenuItem[];
  restaurants: DropdownItem[];
  categories: DropdownItem[];
}

export default function MenuItemManager({
  initialMenuItems,
  restaurants,
  categories,
}: MenuItemManagerProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems);
  const [showForm, setShowForm] = useState(false);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const price = Number(formData.get("price"));
    const image = formData.get("image") as string;
    const isVeg = formData.get("isVeg") === "true";
    const isBestseller = formData.get("isBestseller") === "true";
    const restaurantId = formData.get("restaurantId") as string;
    const categoryId = formData.get("categoryId") as string;

    if (!name || !image || !restaurantId || !categoryId || price <= 0) {
      setError("Name, Image, Restaurant, Category, and valid Price are required.");
      return;
    }

    const rName = restaurants.find((r) => r.id === restaurantId)?.name || "";
    const cName = categories.find((c) => c.id === categoryId)?.name || "";

    startTransition(async () => {
      const res = await createMenuItem({
        name,
        description,
        price,
        image,
        isVeg,
        isBestseller,
        restaurantId,
        categoryId,
      });

      if (res.success) {
        setSuccess("Menu item created successfully!");
        setMenuItems([
          ...menuItems,
          {
            id: Math.random().toString(),
            name,
            price,
            image,
            isVeg,
            isBestseller,
            restaurantName: rName,
            categoryName: cName,
          },
        ]);
        setShowForm(false);
      } else {
        setError(res.error || "Failed to create menu item.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this menu item?")) return;
    setError(null);
    setSuccess(null);

    const res = await deleteMenuItem(id);
    if (res.success) {
      setSuccess("Menu item deleted successfully!");
      setMenuItems(menuItems.filter((i) => i.id !== id));
    } else {
      setError(res.error || "Failed to delete menu item.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center">
          <Utensils className="h-5 w-5 text-orange-500 mr-2" /> Menu Management
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Dish / Item
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">{error}</p>}
      {success && <p className="text-sm text-green-600 font-bold bg-green-50 p-4 rounded-xl border border-green-200">{success}</p>}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4 max-w-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Add New Menu Item</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Item Name</label>
              <input
                type="text"
                name="name"
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Price (₹)</label>
              <input
                type="number"
                name="price"
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Restaurant</label>
              <select
                name="restaurantId"
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              >
                <option value="">Select Restaurant</option>
                {restaurants.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Category</label>
              <select
                name="categoryId"
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Dish Image</label>
              <ImageUploader onUploadComplete={setImageUrl} />
              <input type="hidden" name="image" value={imageUrl} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">Type</label>
                <select
                  name="isVeg"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
                >
                  <option value="true">Veg</option>
                  <option value="false">Non-Veg</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase">Bestseller</label>
                <select
                  name="isBestseller"
                  className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
                >
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </select>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Description</label>
            <input
              type="text"
              name="description"
              required
              className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 flex items-center shadow-md"
            >
              {isPending && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
              Save Dish
            </button>
          </div>
        </form>
      )}

      {/* Grid Table */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4 w-20">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Restaurant / Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Tags</th>
              <th className="p-4 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {menuItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="h-10 w-10 rounded-lg overflow-hidden border border-gray-100">
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-900">{item.name}</td>
                <td className="p-4">
                  <p className="font-bold text-gray-800">{item.restaurantName}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.categoryName}</p>
                </td>
                <td className="p-4 font-black text-gray-900 text-sm">₹{item.price}</td>
                <td className="p-4 space-x-1">
                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
                    item.isVeg ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {item.isVeg ? "Veg" : "Non-Veg"}
                  </span>
                  {item.isBestseller && (
                    <span className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-orange-100 text-orange-850">
                      Bestseller
                    </span>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
