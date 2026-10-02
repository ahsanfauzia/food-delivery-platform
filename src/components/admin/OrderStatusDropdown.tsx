"use client";

import React, { useTransition } from "react";
import { updateOrderStatus } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

interface OrderStatusDropdownProps {
  orderId: string;
  currentStatus: string;
}

export default function OrderStatusDropdown({ orderId, currentStatus }: OrderStatusDropdownProps) {
  const [isPending, startTransition] = useTransition();

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus);
    });
  };

  const statuses = [
    { label: "Placed", value: "PLACED" },
    { label: "Confirmed", value: "CONFIRMED" },
    { label: "Preparing", value: "PREPARING" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="relative inline-flex items-center">
      {isPending && <Loader2 className="animate-spin h-3.5 w-3.5 text-orange-500 mr-2 absolute -left-6" />}
      <select
        value={currentStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="px-2.5 py-1.5 bg-white border border-gray-250 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
      >
        {statuses.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </div>
  );
}
