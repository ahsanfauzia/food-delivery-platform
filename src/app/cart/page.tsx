"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { getRestaurantDeliveryInfo, validateCoupon } from "@/app/actions/orders";
import { Trash2, ShoppingCart, Tag, Ticket, Plus, Minus, ShieldCheck, ArrowRight } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);

  const { items, restaurantId, restaurantName, updateQuantity, removeItem, clearCart, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();

  // Handle Client Hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch delivery fee dynamically when restaurantId changes
  useEffect(() => {
    if (restaurantId) {
      getRestaurantDeliveryInfo(restaurantId).then((res) => {
        if (res.success && res.data) {
          setDeliveryFee(res.data.deliveryFee);
        }
      });
    }
  }, [restaurantId]);

  // Reset coupon if subtotal changes and falls below criteria
  useEffect(() => {
    if (appliedCoupon && subtotal > 0) {
      validateCoupon(appliedCoupon.code, subtotal).then((res) => {
        if (!res.success) {
          setAppliedCoupon(null);
          setCouponSuccess(null);
          setCouponError("Applied coupon became invalid due to cart updates.");
        } else if (res.discountAmount) {
          setAppliedCoupon({ code: res.code!, discountAmount: res.discountAmount });
        }
      });
    }
  }, [subtotal, appliedCoupon]);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-10 w-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-20 px-4">
        <div className="bg-orange-50 h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-orange-100 shadow-inner">
          <ShoppingCart className="h-10 w-10 text-orange-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900">Your Cart is Empty</h2>
        <p className="text-gray-500 text-sm mt-2">
          Good food is always cooking! Go ahead, order some yummy items from the menu.
        </p>
        <div className="mt-8">
          <Link
            href="/restaurants"
            className="inline-flex items-center px-8 py-3.5 border border-transparent text-sm font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-200 transition-all"
          >
            See Restaurants Near You
          </Link>
        </div>
      </div>
    );
  }

  // Cost calculations
  const platformFee = 5; // Flat plat fee
  const gstCharges = Math.round(subtotal * 0.05); // 5% GST
  const discount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + deliveryFee + platformFee + gstCharges - discount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    setCouponSuccess(null);

    if (!couponInput.trim()) return;

    const res = await validateCoupon(couponInput.trim(), subtotal);
    if (!res.success) {
      setCouponError(res.error || "Failed to apply coupon.");
    } else if (res.discountAmount !== undefined) {
      setAppliedCoupon({ code: res.code!, discountAmount: res.discountAmount });
      setCouponSuccess(`Coupon "${res.code}" applied successfully! You saved ₹${res.discountAmount.toFixed(0)}`);
      setCouponInput("");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponSuccess(null);
    setCouponError(null);
  };

  const handleCheckoutRedirect = () => {
    // Save coupon in sessionStorage to retrieve it during order placement in Checkout
    if (appliedCoupon) {
      sessionStorage.setItem("applied_coupon_code", appliedCoupon.code);
    } else {
      sessionStorage.removeItem("applied_coupon_code");
    }
    router.push("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Your Cart</h1>
          <p className="text-sm text-gray-500 mt-1">Ordering from &quot;{restaurantName}&quot;</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors flex items-center"
        >
          <Trash2 className="h-4 w-4 mr-1" /> Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between gap-4"
            >
              {/* Item Info */}
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 shrink-0">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-4.5 w-4.5 border-2 p-0.5 rounded flex items-center justify-center shrink-0 ${
                        item.isVeg ? "border-green-600" : "border-red-600"
                      }`}
                    >
                      <div
                        className={`h-2 w-2 ${item.isVeg ? "bg-green-600 rounded-full" : "bg-red-600"}`}
                        style={
                          !item.isVeg
                            ? { clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }
                            : undefined
                        }
                      ></div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base">{item.name}</h3>
                  </div>
                  <p className="text-xs font-extrabold text-gray-700 mt-1">₹{item.price}</p>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center space-x-4 shrink-0">
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 text-gray-800">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 hover:text-orange-500 transition-colors"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-3 text-xs font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 hover:text-orange-500 transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="text-sm font-extrabold text-gray-900 w-16 text-right">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Bill details */}
        <div className="space-y-6">
          {/* Coupon Code section */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
              <Ticket className="h-5 w-5 text-orange-500 mr-2" /> Apply Coupon
            </h3>

            {appliedCoupon ? (
              <div className="bg-orange-50 border border-orange-200 p-3 rounded-2xl flex justify-between items-center text-orange-900">
                <div className="flex items-center space-x-2">
                  <Tag className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-xs font-black uppercase">{appliedCoupon.code}</p>
                    <p className="text-[10px] text-orange-700">₹{appliedCoupon.discountAmount.toFixed(0)} saved</p>
                  </div>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs font-bold text-orange-600 hover:text-red-500"
                >
                  REMOVE
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Enter code (e.g. WELCOME50)"
                  className="flex-grow px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-xs bg-gray-50 uppercase placeholder:normal-case font-bold"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow transition-colors"
                >
                  APPLY
                </button>
              </form>
            )}

            {couponError && <p className="text-xs text-red-600 mt-1 font-bold">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-green-600 mt-1 font-bold">{couponSuccess}</p>}
          </div>

          {/* Bill summary */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Bill Details</h3>
            
            <div className="space-y-3 text-xs font-semibold text-gray-600">
              <div className="flex justify-between">
                <span>Item Total</span>
                <span className="text-gray-900 font-extrabold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Partner Fee</span>
                <span className="text-gray-900 font-extrabold">
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee</span>
                <span className="text-gray-900 font-extrabold">₹{platformFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST and Restaurant Charges</span>
                <span className="text-gray-900 font-extrabold">₹{gstCharges}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{discount.toFixed(0)}</span>
                </div>
              )}

              <hr className="border-gray-100" />

              <div className="flex justify-between text-sm text-gray-900 font-black pt-1">
                <span>Grand Total</span>
                <span className="text-orange-600">₹{grandTotal.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-200 transition-all font-bold text-sm"
            >
              Proceed to Checkout
              <ArrowRight className="h-4 w-4 ml-2" />
            </button>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-semibold justify-center">
            <ShieldCheck className="h-4 w-4" />
            <span>Secure payments managed by Stripe.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
