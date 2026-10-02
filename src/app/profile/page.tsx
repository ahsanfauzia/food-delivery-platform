import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Mail, Phone, Shield, MapPin, ShoppingBag, Eye, Calendar } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/profile");
  }

  // Fetch complete user profile including addresses and past orders (with restaurant & item info)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      addresses: {
        orderBy: { createdAt: "desc" },
      },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          restaurant: true,
          items: {
            include: {
              menuItem: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    redirect("/login");
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    if (status === "DELIVERED") return "bg-green-100 text-green-800 border-green-200";
    if (status === "CANCELLED") return "bg-red-100 text-red-800 border-red-200";
    return "bg-orange-100 text-orange-800 border-orange-200 animate-pulse";
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your details, addresses, and order history</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: User details & Addresses */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-gradient-to-r from-orange-500 to-red-600 flex items-center justify-center border-4 border-orange-100 text-white font-extrabold text-2xl shadow-inner">
                {user.name ? user.name[0].toUpperCase() : "U"}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900 leading-tight">{user.name}</h2>
                <span className="text-[10px] font-black uppercase bg-orange-100 text-orange-800 px-2 py-0.5 rounded mt-1 inline-block">
                  {user.role}
                </span>
              </div>
            </div>

            <hr className="border-gray-100" />

            <div className="space-y-4 text-xs text-gray-600 font-semibold">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-orange-500 shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-orange-500 shrink-0" />
                <span>{user.phone || "No phone added"}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Shield className="h-4 w-4 text-orange-500 shrink-0" />
                <span>Joined {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</span>
              </div>
            </div>
          </div>

          {/* Addresses list */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
              <MapPin className="h-5 w-5 text-orange-500 mr-2" /> Saved Addresses
            </h3>
            
            {user.addresses.length > 0 ? (
              <div className="space-y-3">
                {user.addresses.map((address) => (
                  <div key={address.id} className="p-4 bg-gray-50 border border-gray-150 rounded-2xl">
                    <span className="text-[9px] font-black uppercase text-gray-700 bg-gray-200 px-1.5 py-0.5 rounded">
                      {address.title}
                    </span>
                    <p className="text-xs text-gray-600 mt-2 font-medium leading-relaxed">
                      {address.street}, {address.city}, {address.state} - {address.postalCode}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400 font-semibold text-center py-4">No saved addresses found.</p>
            )}
          </div>
        </div>

        {/* Right Column: Order History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center">
              <ShoppingBag className="h-5 w-5 text-orange-500 mr-2" /> Order History
            </h3>

            {user.orders.length > 0 ? (
              <div className="space-y-6">
                {user.orders.map((order) => (
                  <div key={order.id} className="border border-gray-100 rounded-2xl p-5 hover:border-orange-100 transition-colors">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-4 border-b border-gray-100">
                      <div>
                        <h4 className="font-extrabold text-sm text-gray-900">{order.restaurant.name}</h4>
                        <p className="text-[10px] text-gray-400 font-semibold flex items-center mt-1">
                          <Calendar className="h-3.5 w-3.5 mr-1" /> {formatDate(order.createdAt)}
                        </p>
                      </div>

                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <p className="text-xs font-bold text-gray-400">Items Ordered:</p>
                        <ul className="text-xs font-bold text-gray-800 space-y-1 mt-1.5">
                          {order.items.map((item) => (
                            <li key={item.id}>
                              {item.menuItem.name} <span className="text-gray-400 font-semibold">x {item.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <p className="text-xs font-bold text-gray-400">Total Paid:</p>
                        <p className="text-base font-black text-orange-500 mt-1">₹{order.finalAmount}</p>
                      </div>
                    </div>

                    {/* Footer / Track */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 text-xs">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">
                        Order #{order.orderNumber}
                      </span>

                      <Link
                        href={`/orders/tracking/${order.id}`}
                        className="inline-flex items-center text-orange-600 hover:text-orange-700 font-black"
                      >
                        <Eye className="h-4 w-4 mr-1" /> View Tracking
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-500 font-semibold">You haven&apos;t placed any orders yet.</p>
                <Link
                  href="/restaurants"
                  className="mt-4 inline-block text-xs font-bold text-orange-500 hover:text-orange-600"
                >
                  Order yummy food now →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
