"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { createOrder, addUserAddress } from "@/app/actions/orders";
import { MapPin, Plus, Loader2, CreditCard, Banknote, ShieldCheck } from "lucide-react";

interface Address {
  id: string;
  title: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

interface CheckoutFormProps {
  initialAddresses: Address[];
}

export default function CheckoutForm({ initialAddresses }: CheckoutFormProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    initialAddresses.length > 0 ? initialAddresses[0].id : ""
  );
  
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [isAddressPending, startAddressTransition] = useTransition();

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isOrderPending, startOrderTransition] = useTransition();

  const { items, restaurantId, restaurantName, getSubtotal, clearCart } = useCartStore();
  const subtotal = getSubtotal();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle adding new address
  const handleAddAddress = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setAddressError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const street = formData.get("street") as string;
    const city = formData.get("city") as string;
    const state = formData.get("state") as string;
    const postalCode = formData.get("postalCode") as string;
    const phone = formData.get("phone") as string;

    if (!title || !street || !city || !state || !postalCode || !phone) {
      setAddressError("All fields are required.");
      return;
    }

    startAddressTransition(async () => {
      const res = await addUserAddress({ title, street, city, state, postalCode, phone });
      if (res.success && res.address) {
        const newAddress = res.address as Address;
        setAddresses([...addresses, newAddress]);
        setSelectedAddressId(newAddress.id);
        setShowAddressForm(false);
      } else {
        setAddressError(res.error || "Failed to add address.");
      }
    });
  };

  // Handle Placing Order
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setOrderError("Please select a delivery address.");
      return;
    }
    if (!restaurantId || items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setOrderError(null);
    const couponCode = sessionStorage.getItem("applied_coupon_code") || undefined;

    startOrderTransition(async () => {
      // 1. If Stripe selected, we will trigger Stripe Checkout in Phase 10
      // For now, we place the order in DB and redirect to a simulated payment handler
      const res = await createOrder({
        restaurantId,
        addressId: selectedAddressId,
        paymentMethod,
        items: items.map(item => ({
          id: item.id,
          price: item.price,
          quantity: item.quantity
        })),
        couponCode
      });

      if (res.success && res.orderId) {
        clearCart();
        sessionStorage.removeItem("applied_coupon_code");
        
        if (paymentMethod === "STRIPE") {
          // In Phase 10 we redirect to Stripe, for now we simulate Stripe Checkout Redirect
          router.push(`/api/stripe/checkout-fallback?orderId=${res.orderId}`);
        } else {
          router.push(`/orders/tracking/${res.orderId}`);
        }
      } else {
        setOrderError(res.error || "Failed to place order.");
      }
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left Columns: Address & Payment */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* Address Selection Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider flex items-center">
              <MapPin className="h-5 w-5 text-orange-500 mr-2" /> Delivery Address
            </h2>
            {!showAddressForm && (
              <button
                onClick={() => setShowAddressForm(true)}
                className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center bg-orange-50 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" /> Add New
              </button>
            )}
          </div>

          {/* Add Address Form */}
          {showAddressForm && (
            <form onSubmit={handleAddAddress} className="bg-gray-50 p-6 rounded-2xl border border-gray-200 space-y-4">
              <h3 className="text-sm font-bold text-gray-800">Add New Address</h3>
              
              {addressError && <p className="text-xs text-red-600 font-bold">{addressError}</p>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Address Title</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="Home, Office, Parents"
                    required
                    className="mt-1 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-950 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="9876543210"
                    required
                    className="mt-1 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-955 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase">Street Address</label>
                <input
                  type="text"
                  name="street"
                  placeholder="Flat no., Street name, Area"
                  required
                  className="mt-1 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-955 text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">City</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="New Delhi"
                    required
                    className="mt-1 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-955 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">State</label>
                  <input
                    type="text"
                    name="state"
                    placeholder="Delhi"
                    required
                    className="mt-1 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-955 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase">Pincode / Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    placeholder="110016"
                    required
                    className="mt-1 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none text-gray-955 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddressForm(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-xl text-xs font-bold hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddressPending}
                  className="px-4 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 flex items-center shadow-md"
                >
                  {isAddressPending && <Loader2 className="animate-spin h-4 w-4 mr-1" />}
                  Save Address
                </button>
              </div>
            </form>
          )}

          {/* List existing addresses */}
          {addresses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  onClick={() => setSelectedAddressId(address.id)}
                  className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedAddressId === address.id
                      ? "border-orange-500 bg-orange-50/30"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-black uppercase text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {address.title}
                    </span>
                    <input
                      type="radio"
                      checked={selectedAddressId === address.id}
                      onChange={() => setSelectedAddressId(address.id)}
                      className="text-orange-500 focus:ring-orange-500 h-4 w-4"
                    />
                  </div>
                  <p className="text-xs text-gray-700 font-medium mt-3 leading-relaxed">
                    {address.street}, {address.city}, {address.state} - {address.postalCode}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold mt-2">Phone: {address.phone}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm font-semibold">No addresses saved. Please add an address to deliver food.</p>
            </div>
          )}
        </div>

        {/* Payment Selection Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider flex items-center">
            <CreditCard className="h-5 w-5 text-orange-500 mr-2" /> Payment Method
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Cash on Delivery */}
            <div
              onClick={() => setPaymentMethod("COD")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === "COD" ? "border-orange-500 bg-orange-50/30" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-green-100 text-green-700 rounded-xl">
                  <Banknote className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Cash on Delivery</h3>
                  <p className="text-[10px] text-gray-500">Pay cash/UPI at delivery</p>
                </div>
              </div>
              <input
                type="radio"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
                className="text-orange-500 focus:ring-orange-500 h-4 w-4"
              />
            </div>

            {/* Credit Card / Stripe */}
            <div
              onClick={() => setPaymentMethod("STRIPE")}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                paymentMethod === "STRIPE" ? "border-orange-500 bg-orange-50/30" : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <CreditCard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Pay Online</h3>
                  <p className="text-[10px] text-gray-500">Credit card, Debit card, Wallet</p>
                </div>
              </div>
              <input
                type="radio"
                checked={paymentMethod === "STRIPE"}
                onChange={() => setPaymentMethod("STRIPE")}
                className="text-orange-500 focus:ring-orange-500 h-4 w-4"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Order Summary & Place Order */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">Order Summary</h3>

          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">{item.name}</p>
                  <p className="text-gray-400 font-bold">Qty: {item.quantity} x ₹{item.price}</p>
                </div>
                <span className="font-extrabold text-gray-900">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>

          <hr className="border-gray-100" />

          {orderError && <p className="text-xs text-red-600 font-bold">{orderError}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={isOrderPending || items.length === 0}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-200 transition-all font-bold text-sm disabled:opacity-50"
          >
            {isOrderPending ? (
              <Loader2 className="animate-spin h-5 w-5 mr-2" />
            ) : (
              <ShieldCheck className="h-5 w-5 mr-2" />
            )}
            {isOrderPending ? "Processing Order..." : paymentMethod === "COD" ? "Place COD Order" : "Pay with Card"}
          </button>
        </div>
      </div>
    </div>
  );
}
