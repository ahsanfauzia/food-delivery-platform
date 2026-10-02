import { prisma } from "@/lib/prisma";
import OrderStatusDropdown from "@/components/admin/OrderStatusDropdown";
import DeliveryAssignDropdown from "@/components/admin/DeliveryAssignDropdown";
import { Banknote, ShoppingBag, Store, Users, Clock, MapPin } from "lucide-react";

export const revalidate = 0; // Disable cache for admin panel to keep it realtime

export default async function AdminDashboardPage() {
  // 1. Gather stats
  const totalOrders = await prisma.order.count();
  
  const deliveredOrders = await prisma.order.findMany({
    where: { status: "DELIVERED" },
    select: { finalAmount: true },
  });
  const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.finalAmount, 0);

  const activeRestaurants = await prisma.restaurant.count({
    where: { active: true },
  });

  const totalCustomers = await prisma.user.count({
    where: { role: "CUSTOMER" },
  });

  // 2. Fetch recent orders
  const recentOrders = await prisma.order.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      restaurant: { select: { name: true } },
      address: { select: { street: true, city: true } },
    },
  });

  // 3. Fetch delivery partners for assigning dropdown
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

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, icon: Banknote, color: "text-green-600 bg-green-100" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-100" },
    { label: "Active Restaurants", value: activeRestaurants, icon: Store, color: "text-orange-600 bg-orange-100" },
    { label: "Total Customers", value: totalCustomers, icon: Users, color: "text-purple-600 bg-purple-100" },
  ];

  return (
    <div className="space-y-10">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time platform metrics and order oversight</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm flex items-center space-x-4">
              <div className={`p-4 rounded-2xl ${stat.color} shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Overview Table */}
      <div className="bg-white rounded-3xl border border-gray-150 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-900">Recent Orders (Last 10)</h3>
          <p className="text-xs text-gray-500 mt-1">Manage food status transitions and assign delivery agents</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-bold border-b border-gray-100">
                <th className="p-4">Order Info</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Destination</th>
                <th className="p-4">Bill Amount</th>
                <th className="p-4">Assign Partner</th>
                <th className="p-4">Status Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.length > 0 ? (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Order Details */}
                    <td className="p-4 space-y-1">
                      <p className="font-bold text-gray-900">#{order.orderNumber}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{order.restaurant.name}</p>
                    </td>

                    {/* Customer */}
                    <td className="p-4 space-y-1">
                      <p className="font-bold text-gray-900">{order.user.name}</p>
                      <p className="text-[10px] text-gray-400 font-semibold">{order.user.email}</p>
                    </td>

                    {/* Address */}
                    <td className="p-4 space-y-1 max-w-[200px] truncate">
                      <p className="font-bold text-gray-900 truncate flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-gray-400 shrink-0" /> {order.address.street}
                      </p>
                      <p className="text-[10px] text-gray-400 font-semibold">{order.address.city}</p>
                    </td>

                    {/* Bill */}
                    <td className="p-4 font-black text-gray-900 text-sm">
                      ₹{order.finalAmount}
                    </td>

                    {/* Assign Partner */}
                    <td className="p-4">
                      <DeliveryAssignDropdown
                        orderId={order.id}
                        currentPartnerId={order.deliveryPartnerId}
                        partners={deliveryPartners}
                      />
                    </td>

                    {/* Status Override */}
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
                  <td colSpan={6} className="p-8 text-center text-gray-500 font-bold">
                    No orders placed yet.
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
