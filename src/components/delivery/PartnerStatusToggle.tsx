"use client";

import React, { useTransition } from "react";
import { updatePartnerStatus } from "@/app/actions/delivery";
import { Loader2, Power } from "lucide-react";

interface PartnerStatusToggleProps {
  currentStatus: "AVAILABLE" | "BUSY" | "OFFLINE";
}

export default function PartnerStatusToggle({ currentStatus }: PartnerStatusToggleProps) {
  const [isPending, startTransition] = useTransition();

  const toggleStatus = () => {
    const nextStatus = currentStatus === "OFFLINE" ? "AVAILABLE" : "OFFLINE";
    startTransition(async () => {
      await updatePartnerStatus(nextStatus);
    });
  };

  const getStatusColor = () => {
    if (currentStatus === "AVAILABLE") return "bg-green-500 hover:bg-green-600 text-white";
    if (currentStatus === "BUSY") return "bg-orange-500 hover:bg-orange-600 text-white";
    return "bg-gray-500 hover:bg-gray-600 text-white";
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
        Duty Status: <span className={currentStatus === "OFFLINE" ? "text-red-500" : "text-green-500 font-extrabold"}>{currentStatus}</span>
      </span>
      <button
        onClick={toggleStatus}
        disabled={isPending}
        className={`inline-flex items-center px-4 py-2 border border-transparent text-xs font-bold rounded-full transition-all shadow-md focus:outline-none ${getStatusColor()}`}
      >
        {isPending ? (
          <Loader2 className="animate-spin h-4 w-4 mr-1.5" />
        ) : (
          <Power className="h-4 w-4 mr-1.5" />
        )}
        {currentStatus === "OFFLINE" ? "Go Online" : "Go Offline"}
      </button>
    </div>
  );
}
