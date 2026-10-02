"use client";

import React, { useState, useTransition } from "react";
import { createRestaurant, updateRestaurant, deleteRestaurant } from "@/app/actions/admin";
import { Plus, Trash2, Edit2, Loader2, Store, X } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  active: boolean;
}

interface RestaurantManagerProps {
  initialRestaurants: Restaurant[];
}

export default function RestaurantManager({ initialRestaurants }: RestaurantManagerProps) {
  const [restaurants, setRestaurants] = useState<Restaurant[]>(initialRestaurants);
  const [showForm, setShowForm] = useState(false);
  const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [imageUrl, setImageUrl] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");

  const handleEditClick = (res: Restaurant) => {
    setEditingRestaurant(res);
    setEditImageUrl(res.image);
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const image = formData.get("image") as string;
    const deliveryTime = Number(formData.get("deliveryTime"));
    const deliveryFee = Number(formData.get("deliveryFee"));

    if (!name || !image || !address) {
      setError("Name, Image URL, and Address are required.");
      return;
    }

    startTransition(async () => {
      const res = await createRestaurant({ name, description, address, image, deliveryTime, deliveryFee });
      if (res.success) {
        setSuccess("Restaurant created successfully!");
        setRestaurants([
          ...restaurants,
          { id: Math.random().toString(), name, description, address, image, rating: 0, deliveryTime, deliveryFee, active: true },
        ]);
        setShowForm(false);
      } else {
        setError(res.error || "Failed to create restaurant.");
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingRestaurant) return;
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const address = formData.get("address") as string;
    const image = formData.get("image") as string;
    const deliveryTime = Number(formData.get("deliveryTime"));
    const deliveryFee = Number(formData.get("deliveryFee"));
    const active = formData.get("active") === "true";

    startTransition(async () => {
      const res = await updateRestaurant(editingRestaurant.id, { name, description, address, image, deliveryTime, deliveryFee, active });
      if (res.success) {
        setSuccess("Restaurant updated successfully!");
        setRestaurants(
          restaurants.map((r) =>
            r.id === editingRestaurant.id
              ? { ...r, name, description, address, image, deliveryTime, deliveryFee, active }
              : r
          )
        );
        setEditingRestaurant(null);
      } else {
        setError(res.error || "Failed to update restaurant.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this restaurant? This will delete all its menu items.")) return;
    setError(null);
    setSuccess(null);

    const res = await deleteRestaurant(id);
    if (res.success) {
      setSuccess("Restaurant deleted successfully!");
      setRestaurants(restaurants.filter((r) => r.id !== id));
    } else {
      setError(res.error || "Failed to delete restaurant.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center">
          <Store className="h-5 w-5 text-orange-500 mr-2" /> Restaurant Management
        </h2>
        {!showForm && !editingRestaurant && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Restaurant
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">{error}</p>}
      {success && <p className="text-sm text-green-600 font-bold bg-green-50 p-4 rounded-xl border border-green-200">{success}</p>}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4 max-w-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Add New Restaurant</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Restaurant Name</label>
              <input
                type="text"
                name="name"
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Restaurant Image</label>
              <ImageUploader onUploadComplete={setImageUrl} />
              <input type="hidden" name="image" value={imageUrl} />
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

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Address</label>
            <input
              type="text"
              name="address"
              required
              className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Delivery Time (mins)</label>
              <input
                type="number"
                name="deliveryTime"
                defaultValue={30}
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Delivery Fee (₹)</label>
              <input
                type="number"
                name="deliveryFee"
                defaultValue={30}
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
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
              Save Restaurant
            </button>
          </div>
        </form>
      )}

      {/* Edit Form */}
      {editingRestaurant && (
        <form onSubmit={handleUpdate} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4 max-w-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Edit Restaurant</h3>
            <button type="button" onClick={() => setEditingRestaurant(null)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Restaurant Name</label>
              <input
                type="text"
                name="name"
                defaultValue={editingRestaurant.name}
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Restaurant Image</label>
              <ImageUploader onUploadComplete={setEditImageUrl} defaultValue={editImageUrl} />
              <input type="hidden" name="image" value={editImageUrl} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Description</label>
            <input
              type="text"
              name="description"
              defaultValue={editingRestaurant.description}
              required
              className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Address</label>
            <input
              type="text"
              name="address"
              defaultValue={editingRestaurant.address}
              required
              className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Delivery Time</label>
              <input
                type="number"
                name="deliveryTime"
                defaultValue={editingRestaurant.deliveryTime}
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Delivery Fee (₹)</label>
              <input
                type="number"
                name="deliveryFee"
                defaultValue={editingRestaurant.deliveryFee}
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Active Status</label>
              <select
                name="active"
                defaultValue={editingRestaurant.active ? "true" : "false"}
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={() => setEditingRestaurant(null)}
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
              Save Changes
            </button>
          </div>
        </form>
      )}

      {/* Grid List */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4 w-20">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Delivery Details</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center w-36">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {restaurants.map((res) => (
              <tr key={res.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="h-10 w-14 rounded-lg overflow-hidden border border-gray-100">
                    <img src={res.image} alt={res.name} className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-900">{res.name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{res.address}</p>
                </td>
                <td className="p-4">
                  <p className="font-bold text-gray-800">{res.deliveryTime} mins</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Fee: ₹{res.deliveryFee}</p>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    res.active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}>
                    {res.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-4 text-center space-x-2">
                  <button
                    onClick={() => handleEditClick(res)}
                    className="p-2 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-xl transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id)}
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
