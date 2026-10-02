"use client";

import React, { useState, useTransition } from "react";
import { createCategory, deleteCategory } from "@/app/actions/admin";
import { Plus, Trash2, Loader2, FolderHeart, X } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";

interface Category {
  id: string;
  name: string;
  image: string;
  description: string | null;
}

interface CategoryManagerProps {
  initialCategories: Category[];
}

export default function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
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
    const image = formData.get("image") as string;
    const description = formData.get("description") as string;

    if (!name || !image) {
      setError("Name and Image URL are required.");
      return;
    }

    startTransition(async () => {
      const res = await createCategory({ name, image, description });
      if (res.success) {
        setSuccess("Category created successfully!");
        // Reload local categories list
        setCategories([
          ...categories,
          { id: Math.random().toString(), name, image, description },
        ]);
        setShowForm(false);
      } else {
        setError(res.error || "Failed to create category.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    setError(null);
    setSuccess(null);

    const res = await deleteCategory(id);
    if (res.success) {
      setSuccess("Category deleted successfully!");
      setCategories(categories.filter((c) => c.id !== id));
    } else {
      setError(res.error || "Failed to delete category.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center">
          <FolderHeart className="h-5 w-5 text-orange-500 mr-2" /> Category Management
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">{error}</p>}
      {success && <p className="text-sm text-green-600 font-bold bg-green-50 p-4 rounded-xl border border-green-200">{success}</p>}

      {/* Add Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4 max-w-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Add New Category</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Category Name</label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Italian, Desserts"
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1.5">Category Image</label>
              <ImageUploader onUploadComplete={setImageUrl} />
              <input type="hidden" name="image" value={imageUrl} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Description (Optional)</label>
            <input
              type="text"
              name="description"
              placeholder="Fresh Italian cuisines and pizzas..."
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
              Save Category
            </button>
          </div>
        </form>
      )}

      {/* Categories Grid Table */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4 w-20">Image</th>
              <th className="p-4">Name</th>
              <th className="p-4">Description</th>
              <th className="p-4 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50/50">
                <td className="p-4">
                  <div className="h-10 w-10 rounded-full overflow-hidden border border-gray-100">
                    <img src={cat.image} alt={cat.name} className="h-full w-full object-cover" />
                  </div>
                </td>
                <td className="p-4 font-bold text-gray-900">{cat.name}</td>
                <td className="p-4 text-gray-500 font-medium">{cat.description || "N/A"}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDelete(cat.id)}
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
