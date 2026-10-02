import Link from "next/link";
import { AlertCircle, ArrowLeft, HelpCircle } from "lucide-react";

interface CancelPageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function OrderCancelPage({ searchParams }: CancelPageProps) {
  const params = await searchParams;
  const orderId = params.orderId;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 px-4 py-12">
      <div className="max-w-md w-full space-y-8 bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-orange-100 text-center">
        {/* Animated Error/Warning Icon */}
        <div className="flex justify-center">
          <div className="bg-red-100 p-4 rounded-full border-4 border-red-50 shadow-inner">
            <AlertCircle className="h-12 w-12 text-red-600 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Payment Cancelled</h2>
          <p className="text-sm text-gray-500">
            The transaction was cancelled or could not be processed. Don&apos;t worry, no money was charged from your account.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="space-y-3 pt-4">
          <Link
            href="/cart"
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-lg hover:shadow-orange-200 transition-all font-bold text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Cart & Retry
          </Link>
          
          <Link
            href="/"
            className="w-full flex items-center justify-center py-3 border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-600 transition-colors"
          >
            <HelpCircle className="h-4 w-4 mr-1.5" /> Need help? Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
