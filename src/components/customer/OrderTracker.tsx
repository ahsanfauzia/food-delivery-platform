"use client";

import React, { useEffect, useState } from "react";
import { getOrderStatus } from "@/app/actions/orders";
import { CheckCircle2, Clock, Phone, MapPin, Bike, ShoppingBag, XCircle } from "lucide-react";

interface OrderTrackerProps {
  initialOrder: any;
}

export default function OrderTracker({ initialOrder }: OrderTrackerProps) {
  const [order, setOrder] = useState<any>(initialOrder);
  const [loading, setLoading] = useState(false);

  const statusSteps = [
    { label: "Order Placed", key: "PLACED", desc: "We have received your order" },
    { label: "Confirmed", key: "CONFIRMED", desc: "Restaurant has accepted your order" },
    { label: "Preparing", key: "PREPARING", desc: "Your food is being freshly prepared" },
    { label: "Out for Delivery", key: "OUT_FOR_DELIVERY", desc: "Delivery partner is on the way" },
    { label: "Delivered", key: "DELIVERED", desc: "Enjoy your fresh hot food!" },
  ];

  const getStepIndex = (status: string) => {
    if (status === "CANCELLED") return -1;
    if (status === "PLACED") return 0;
    if (status === "CONFIRMED") return 1;
    if (status === "PREPARING") return 2;
    if (status === "PICKED_UP" || status === "OUT_FOR_DELIVERY") return 3;
    if (status === "DELIVERED") return 4;
    return 0;
  };

  const currentStepIndex = getStepIndex(order.status);

  // Poll database every 5 seconds for order status updates
  useEffect(() => {
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      return; // Stop polling if final state reached
    }

    const interval = setInterval(async () => {
      const res = await getOrderStatus(order.id);
      if (res.success && res.order) {
        setOrder(res.order);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [order.id, order.status]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left: Stepper & Delivery Progress */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Status Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden flex items-center justify-between">
          <div className="space-y-2 relative z-10">
            <span className="text-[10px] font-black uppercase text-orange-500 bg-orange-50 px-2.5 py-1 rounded-md tracking-wider">
              Order ID: {order.orderNumber}
            </span>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">
              {order.status === "CANCELLED"
                ? "This order was cancelled"
                : order.status === "DELIVERED"
                ? "Food has been delivered!"
                : "Tracking your hot food..."}
            </h2>
            {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
              <p className="text-xs text-gray-500 flex items-center">
                <Clock className="h-4 w-4 text-orange-500 mr-1.5 animate-pulse" /> Estimated arrival in 25-35 mins
              </p>
            )}
          </div>
          <div className="absolute right-0 bottom-0 translate-y-1/4 translate-x-1/4 h-32 w-32 rounded-full bg-orange-50 blur-2xl"></div>
        </div>

        {/* Stepper Card */}
        {order.status === "CANCELLED" ? (
          <div className="bg-red-50 border border-red-200 p-8 rounded-3xl text-center space-y-3">
            <XCircle className="h-12 w-12 text-red-500 mx-auto" />
            <h3 className="text-lg font-bold text-red-900">Order Cancelled</h3>
            <p className="text-xs text-red-700">This order has been cancelled by the restaurant or customer.</p>
          </div>
        ) : (
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
            <div className="relative pl-8 border-l-2 border-gray-100 space-y-8 ml-4">
              {statusSteps.map((step, idx) => {
                const isCompleted = idx < currentStepIndex;
                const isCurrent = idx === currentStepIndex;
                const isUpcoming = idx > currentStepIndex;

                return (
                  <div key={step.key} className="relative">
                    {/* Stepper Dot Indicator */}
                    <div
                      className={`absolute -left-12 top-0 h-8 w-8 rounded-full border-4 flex items-center justify-center transition-all ${
                        isCompleted
                          ? "bg-green-500 border-green-200 text-white"
                          : isCurrent
                          ? "bg-orange-500 border-orange-200 text-white ring-4 ring-orange-500/10"
                          : "bg-white border-gray-200 text-gray-400"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <div className={`h-2 w-2 rounded-full ${isCurrent ? "bg-white" : "bg-gray-300"}`}></div>
                      )}
                    </div>

                    {/* Step Label Info */}
                    <div className="pl-4 space-y-1">
                      <h3
                        className={`text-sm font-bold transition-colors ${
                          isCompleted
                            ? "text-green-600"
                            : isCurrent
                            ? "text-orange-600"
                            : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </h3>
                      <p className="text-xs text-gray-400 leading-normal">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Assigned Driver Details Card */}
        {order.deliveryPartner && (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">
              Assigned Delivery Executive
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
                  <Bike className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">
                    {order.deliveryPartner.user.name}
                  </h4>
                  <p className="text-[10px] text-gray-500 flex items-center mt-1">
                    <span className="font-black bg-gray-100 text-gray-600 px-2 py-0.5 rounded mr-2">
                      {order.deliveryPartner.vehicleNumber || "BIKE"}
                    </span>
                    {order.deliveryPartner.vehicleType}
                  </p>
                </div>
              </div>

              {order.deliveryPartner.user.phone && (
                <a
                  href={`tel:${order.deliveryPartner.user.phone}`}
                  className="p-3 bg-orange-50 hover:bg-orange-100 text-orange-600 rounded-full transition-colors"
                >
                  <Phone className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Right Column: Bill Details and Shipping */}
      <div className="space-y-6">
        
        {/* Delivery Destination Address */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center">
            <MapPin className="h-4 w-4 text-orange-500 mr-1.5" /> Delivery Destination
          </h3>
          <p className="text-xs text-gray-700 font-bold leading-relaxed">
            {order.address?.street}, {order.address?.city}, {order.address?.state} - {order.address?.postalCode}
          </p>
        </div>

        {/* Bill Breakdown summary */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider flex items-center">
            <ShoppingBag className="h-4 w-4 text-orange-500 mr-1.5" /> Items Summary
          </h3>
          
          <div className="space-y-2 text-xs font-semibold text-gray-600">
            <div className="flex justify-between">
              <span>Items Total</span>
              <span className="text-gray-900 font-extrabold">₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-gray-900 font-extrabold">₹{order.deliveryFee}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-green-600 font-bold">
                <span>Coupon Applied</span>
                <span>-₹{order.discountAmount}</span>
              </div>
            )}
            <hr className="border-gray-100" />
            <div className="flex justify-between text-sm font-black text-gray-900 pt-1">
              <span>Grand Total</span>
              <span className="text-orange-600">₹{order.finalAmount}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 pt-2 font-bold uppercase">
              <span>Payment Type</span>
              <span>{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase">
              <span>Payment Status</span>
              <span className={order.paymentStatus === "COMPLETED" ? "text-green-600 font-black" : "text-orange-500 font-black"}>
                {order.paymentStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
