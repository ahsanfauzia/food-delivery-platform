import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import PartnerStatusToggle from "@/components/delivery/PartnerStatusToggle";
import DeliveryActionButtons from "@/components/delivery/DeliveryActionButtons";
import { redirect } from "next/navigation";
import { Bike, ShieldAlert, DollarSign, Award, Calendar, MapPin, Phone } from "lucide-react";

export const revalidate = 0; // Keeping delivery feeds realtime

export default async function DeliveryDashboardPage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login");
  }

  // Fetch delivery partner profile linked to user
  const partner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    include: { user: true },
  });

  if (!partner) {
    redirect("/"); // Redirect back if they don't have a delivery profile
  }

  // Fetch active assigned orders
  const activeOrders = await prisma.order.findMany({
    where: {
      deliveryPartnerId: partner.id,
      status: {
        in: ["CONFIRMED", "PREPARING", "PICKED_UP", "OUT_FOR_DELIVERY"],
      },
    },
    include: {
      restaurant: { select: { name: true, address: true } },
      address: { select: { street: true, city: true, phone: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch delivery history
  const completedOrders = await prisma.order.findMany({
    where: {
      deliveryPartnerId: partner.id,
      status: "DELIVERED",
    },
    include: {
      restaurant: { select: { name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Earnings calculation: ₹40 flat commission per delivery
  const deliveryPayoutRate = 40;
  const totalEarnings = completedOrders.length * deliveryPayoutRate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header and status switch panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
            <Bike className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">
              Welcome Back, {partner.user.name}
            </h1>
            <p className="text-xs text-gray-400 font-semibold mt-0.5">
              Delivery Partner | Vehicle No: {partner.vehicleNumber || "N/A"}
            </p>
          </div>
        </div>

        <PartnerStatusToggle currentStatus={partner.status} />
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-green-100 text-green-700 rounded-2xl">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Earnings</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">₹{totalEarnings}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-blue-100 text-blue-700 rounded-2xl">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Completed Rides</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{completedOrders.length}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center space-x-4">
          <div className="p-4 bg-orange-100 text-orange-700 rounded-2xl">
            <Bike className="h-6 w-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Active Deliveries</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{activeOrders.length}</p>
          </div>
        </div>
      </div>

      {/* Active Orders Section */}
      <section className="space-y-6">
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Active Task Orders</h2>
        
        {activeOrders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* ID & Cost banner */}
                <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                  <span className="text-xs font-black uppercase text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                    Order #{order.orderNumber}
                  </span>
                  <span className="text-xs font-extrabold text-orange-500">
                    Payout: +₹{deliveryPayoutRate}
                  </span>
                </div>

                {/* Pickup details */}
                <div className="space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">1. Pick Up From</p>
                  <h4 className="font-extrabold text-sm text-gray-900">{order.restaurant.name}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed flex items-start">
                    <MapPin className="h-4 w-4 text-orange-500 mr-1.5 shrink-0" />
                    {order.restaurant.address}
                  </p>
                </div>

                {/* Destination Details */}
                <div className="space-y-2 pt-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">2. Deliver To</p>
                  <p className="text-xs text-gray-700 font-bold leading-relaxed flex items-start">
                    <MapPin className="h-4 w-4 text-green-600 mr-1.5 shrink-0" />
                    {order.address.street}, {order.address.city}
                  </p>
                </div>

                {/* Payment and Call */}
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 pt-2 border-t border-gray-50">
                  <span className="uppercase">
                    Billing: ₹{order.finalAmount} ({order.paymentMethod})
                  </span>
                  {order.address.phone && (
                    <a
                      href={`tel:${order.address.phone}`}
                      className="inline-flex items-center text-orange-600 hover:text-orange-700 bg-orange-50 px-2.5 py-1 rounded-md"
                    >
                      <Phone className="h-3 w-3 mr-1" /> Call Customer
                    </a>
                  )}
                </div>

                {/* Transitions Trigger */}
                <DeliveryActionButtons orderId={order.id} status={order.status} />
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 p-10 text-center rounded-3xl shadow-inner">
            <ShieldAlert className="h-10 w-10 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm font-semibold">
              {partner.status === "OFFLINE"
                ? "You are currently OFFLINE. Change status to Go Online to view task allocations."
                : "No active delivery tasks allocated. Enjoy your rest!"}
            </p>
          </div>
        )}
      </section>

      {/* Completed History List */}
      <section className="space-y-6">
        <h2 className="text-lg font-black text-gray-900 uppercase tracking-wider">Delivery History Logs</h2>
        
        <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Date</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Earnings</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {completedOrders.length > 0 ? (
                completedOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/50">
                    <td className="p-4 text-gray-400 font-semibold flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5" />
                      {new Date(o.updatedAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="p-4 font-bold text-gray-900">#{o.orderNumber}</td>
                    <td className="p-4 text-gray-600 font-bold">{o.restaurant.name}</td>
                    <td className="p-4 font-black text-green-600">+₹{deliveryPayoutRate}</td>
                    <td className="p-4">
                      <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase px-2 py-0.5 rounded">
                        DELIVERED
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-bold">
                    No completed deliveries logged yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
