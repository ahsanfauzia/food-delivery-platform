import { prisma } from "@/lib/prisma";
import OrderStatusDropdown from "@/components/admin/OrderStatusDropdown";
import DeliveryAssignDropdown from "@/components/admin/DeliveryAssignDropdown";
import { ShoppingCart, MapPin, Calendar, CreditCard } from "lucide-react";

export const revalidate = 0; // Real-time orders tracking

export default async function AdminOrdersPage() {
  // Fetch all orders with associated models
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      restaurant: { select: { name: true } },
      address: { select: { street: true, city: true } },
    },
  });

  // Fetch delivery partners for assignment list
  const deliveryPartnersRaw = await prisma.deliveryPartner.findMany({
    include: {
      user: { select: { name: true } },
    },
  });

  const deliveryPartners = deliveryPartnersRaw.map((p) => ({
    id: p.id,
    name: p.user.name || "Unnamed Driver",
    status: p.status,
  }));

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
          <ShoppingCart className="h-7 w-7 text-orange-500 mr-2" /> Order Administration
        </h1>
        <p className="text-sm text-gray-500 mt-1">Manage, update, and track all customer orders on the platform</p>
      </div>

      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="font-bold text-gray-800 text-sm">All Orders Summary ({orders.length})</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Order ID & Date</th>
                <th className="p-4">Restaurant</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Delivery Address</th>
                <th className="p-4">Bill Summary</th>
                <th className="p-4">Assign Partner</th>
                <th className="p-4">Change Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Order ID & Date */}
                    <td className="p-4 space-y-1">
                      <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-400 font-semibold flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDate(order.createdAt)}
                      </p>
                    </td>

                    {/* Restaurant */}
                    <td className="p-4 font-bold text-gray-900">
                      {order.restaurant.name}
                    </td>

                    {/* Customer Info */}
                    <td className="p-4 space-y-1">
                      <p className="font-bold text-gray-900">{order.user.name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{order.user.email}</p>
                    </td>

                    {/* Delivery Destination */}
                    <td className="p-4 space-y-1 max-w-[180px] truncate">
                      <p className="font-bold text-gray-900 truncate flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400 shrink-0" /> {order.address.street}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">{order.address.city}</p>
                    </td>

                    {/* Bill breakdown */}
                    <td className="p-4 space-y-1">
                      <p className="font-black text-gray-900 text-sm">₹{order.finalAmount}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase flex items-center">
                        <CreditCard className="h-3 w-3 mr-1" /> {order.paymentMethod}
                      </p>
                    </td>

                    {/* Assign Partner */}
                    <td className="p-4">
                      <DeliveryAssignDropdown
                        orderId={order.id}
                        currentPartnerId={order.deliveryPartnerId}
                        partners={deliveryPartners}
                      />
                    </td>

                    {/* Order Status */}
                    <td className="p-4">
                      <OrderStatusDropdown
                        orderId={order.id}
                        currentStatus={order.status}
                      />
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500 font-bold">
                    No orders available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
