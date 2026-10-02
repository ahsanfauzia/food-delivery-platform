"use client";

import React, { useState, useTransition } from "react";
import { createCoupon, deleteCoupon } from "@/app/actions/admin";
import { Plus, Trash2, Loader2, Ticket, X } from "lucide-react";

interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  expiresAt: Date;
}

interface CouponManagerProps {
  initialCoupons: Coupon[];
}

export default function CouponManager({ initialCoupons }: CouponManagerProps) {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(e.currentTarget);
    const code = formData.get("code") as string;
    const discountType = formData.get("discountType") as "PERCENTAGE" | "FLAT";
    const discountValue = Number(formData.get("discountValue"));
    const minOrderAmount = Number(formData.get("minOrderAmount"));
    const maxDiscountVal = formData.get("maxDiscount");
    const maxDiscount = maxDiscountVal ? Number(maxDiscountVal) : undefined;
    const expiresAtStr = formData.get("expiresAt") as string;

    if (!code || !expiresAtStr || discountValue <= 0) {
      setError("Code, Expiry Date, and valid Discount Value are required.");
      return;
    }

    const expiresAt = new Date(expiresAtStr);

    startTransition(async () => {
      const res = await createCoupon({
        code,
        discountType,
        discountValue,
        minOrderAmount,
        maxDiscount,
        expiresAt,
      });

      if (res.success) {
        setSuccess("Coupon code created successfully!");
        setCoupons([
          ...coupons,
          {
            id: Math.random().toString(),
            code: code.toUpperCase(),
            discountType,
            discountValue,
            minOrderAmount,
            maxDiscount: maxDiscount || null,
            expiresAt,
          },
        ]);
        setShowForm(false);
      } else {
        setError(res.error || "Failed to create coupon.");
      }
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    setError(null);
    setSuccess(null);

    const res = await deleteCoupon(id);
    if (res.success) {
      setSuccess("Coupon deleted successfully!");
      setCoupons(coupons.filter((c) => c.id !== id));
    } else {
      setError(res.error || "Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-black text-gray-900 uppercase tracking-wider flex items-center">
          <Ticket className="h-5 w-5 text-orange-500 mr-2" /> Coupon Management
        </h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-orange-500 hover:bg-orange-600 shadow-md"
          >
            <Plus className="h-4 w-4 mr-1" /> Add Coupon
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-600 font-bold bg-red-50 p-4 rounded-xl border border-red-200">{error}</p>}
      {success && <p className="text-sm text-green-600 font-bold bg-green-50 p-4 rounded-xl border border-green-200">{success}</p>}

      {/* Create Coupon Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm space-y-4 max-w-xl">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-800">Add New Coupon</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Coupon Code</label>
              <input
                type="text"
                name="code"
                required
                placeholder="e.g. EXTRA50"
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955 uppercase font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Discount Type</label>
              <select
                name="discountType"
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Rate (₹)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Discount Value</label>
              <input
                type="number"
                name="discountValue"
                required
                placeholder="e.g. 50"
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Min Order Amount (₹)</label>
              <input
                type="number"
                name="minOrderAmount"
                defaultValue={100}
                required
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase">Max Discount (%, optional)</label>
              <input
                type="number"
                name="maxDiscount"
                placeholder="e.g. 150"
                className="mt-1 w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-xs text-gray-955"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase">Expires At</label>
            <input
              type="date"
              name="expiresAt"
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
              Save Coupon
            </button>
          </div>
        </form>
      )}

      {/* Coupons Table List */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
              <th className="p-4">Code</th>
              <th className="p-4">Type</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Criteria</th>
              <th className="p-4">Expiry</th>
              <th className="p-4 text-center w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {coupons.length > 0 ? (
              coupons.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50/50">
                  <td className="p-4 font-black text-gray-900 uppercase">{c.code}</td>
                  <td className="p-4 font-bold text-gray-600">{c.discountType}</td>
                  <td className="p-4 font-black text-gray-900">
                    {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                  </td>
                  <td className="p-4 text-gray-500 font-medium">
                    Min order: ₹{c.minOrderAmount}
                    {c.maxDiscount ? ` | Max: ₹${c.maxDiscount}` : ""}
                  </td>
                  <td className="p-4 text-gray-400 font-semibold">
                    {new Date(c.expiresAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-500 rounded-xl transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                  No coupons created yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
