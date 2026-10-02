import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, ShieldCheck, ArrowRight, Home, ShoppingBag } from "lucide-react";

interface SuccessPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderSuccessPage({ params }: SuccessPageProps) {
  const { id } = await params;

  // Fetch minimal order details to confirm it exists
  const order = await prisma.order.findUnique({
    where: { id },
    select: { orderNumber: true, finalAmount: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-orange-100 text-center">
        {/* Animated Check Icon */}
        <div className="flex justify-center">
          <div className="bg-green-100 p-4 rounded-full border-4 border-green-50 shadow-inner">
            <CheckCircle className="h-12 w-12 text-green-600 animate-bounce" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment Successful!</h2>
          <p className="text-sm text-gray-500">
            Thank you for ordering. Your food is on its way to the kitchen!
          </p>
        </div>

        {/* Invoice Summary Card */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-150 text-left space-y-4">
          <div className="flex justify-between items-center text-xs font-bold text-gray-400 uppercase">
            <span>Order Reference</span>
            <span>Amount Paid</span>
          </div>
          <div className="flex justify-between items-center text-gray-900">
            <span className="font-black bg-gray-200 text-gray-700 px-3 py-1 rounded-md text-xs">
              #{order.orderNumber}
            </span>
            <span className="text-xl font-black text-orange-500">
              ₹{order.finalAmount}
            </span>
          </div>
        </div>

        {/* Action Triggers */}
        <div className="space-y-3">
          <Link
            href={`/orders/tracking/${id}`}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-200 transition-all font-bold text-sm"
          >
            Track Your Food
            <ArrowRight className="h-4 w-4 ml-2 animate-pulse" />
          </Link>
          
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/"
              className="flex items-center justify-center py-3 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors"
            >
              <Home className="h-4 w-4 mr-1.5" /> Home
            </Link>
            <Link
              href="/profile"
              className="flex items-center justify-center py-3 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors"
            >
              <ShoppingBag className="h-4 w-4 mr-1.5" /> History
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-semibold justify-center">
          <ShieldCheck className="h-4 w-4 text-green-500" />
          <span>Payment secured and processed via Stripe.</span>
        </div>
      </div>
    </div>
  );
}
