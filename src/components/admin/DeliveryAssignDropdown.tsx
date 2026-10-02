"use client";

import React, { useTransition } from "react";
import { assignDeliveryPartner } from "@/app/actions/admin";
import { Loader2 } from "lucide-react";

interface Partner {
  id: string;
  name: string;
  status: string;
}

interface DeliveryAssignDropdownProps {
  orderId: string;
  currentPartnerId: string | null;
  partners: Partner[];
}

export default function DeliveryAssignDropdown({
  orderId,
  currentPartnerId,
  partners,
}: DeliveryAssignDropdownProps) {
  const [isPending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    startTransition(async () => {
      await assignDeliveryPartner(orderId, val);
    });
  };

  return (
    <div className="relative inline-flex items-center">
      {isPending && <Loader2 className="animate-spin h-3.5 w-3.5 text-orange-500 mr-2 absolute -left-6" />}
      <select
        value={currentPartnerId || ""}
        onChange={handleChange}
        disabled={isPending}
        className="px-2.5 py-1.5 bg-white border border-gray-250 rounded-xl text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 max-w-[150px] truncate"
      >
        <option value="">Unassigned</option>
        {partners.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name} ({p.status})
          </option>
        ))}
      </select>
    </div>
  );
}
