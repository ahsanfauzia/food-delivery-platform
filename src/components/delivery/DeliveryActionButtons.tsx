"use client";

import React, { useTransition } from "react";
import { updateDeliveryStatus } from "@/app/actions/delivery";
import { Loader2, Bike, CheckSquare } from "lucide-react";

interface DeliveryActionButtonsProps {
  orderId: string;
  status: "PLACED" | "CONFIRMED" | "PREPARING" | "PICKED_UP" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";
}

export default function DeliveryActionButtons({ orderId, status }: DeliveryActionButtonsProps) {
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (nextStatus: "OUT_FOR_DELIVERY" | "DELIVERED") => {
    startTransition(async () => {
      await updateDeliveryStatus(orderId, nextStatus);
    });
  };

  if (status === "DELIVERED" || status === "CANCELLED" || status === "PLACED") {
    return null;
  }

  return (
    <div className="pt-2">
      {status === "CONFIRMED" || status === "PREPARING" || status === "PICKED_UP" ? (
        <button
          onClick={() => handleUpdate("OUT_FOR_DELIVERY")}
          disabled={isPending}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
          ) : (
            <Bike className="h-4 w-4 mr-1.5" />
          )}
          Pick Up Order
        </button>
      ) : (
        <button
          onClick={() => handleUpdate("DELIVERED")}
          disabled={isPending}
          className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow transition-all disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
          ) : (
            <CheckSquare className="h-4 w-4 mr-1.5" />
          )}
          Mark Delivered
        </button>
      )}
    </div>
  );
}
