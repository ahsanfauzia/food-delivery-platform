import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Store, FolderHeart, Utensils, ShoppingCart, Ticket, Home, LogOut } from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const sidebarLinks = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Restaurants", href: "/admin/restaurants", icon: Store },
    { label: "Categories", href: "/admin/categories", icon: FolderHeart },
    { label: "Menu Items", href: "/admin/menu", icon: Utensils },
    { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { label: "Coupons", href: "/admin/coupons", icon: Ticket },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100 text-gray-900 font-sans">
      {/* Sidebar Panel */}
      <aside className="w-64 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        {/* Brand header */}
        <div className="h-20 flex items-center justify-center border-b border-gray-800 bg-gray-950">
          <Link href="/admin" className="text-2xl font-black bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent tracking-tight">
            FOODIE ADMIN
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-gray-800 hover:text-white transition-colors text-sm font-bold"
              >
                <Icon className="h-5 w-5 text-orange-500" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <Link
            href="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-gray-850 hover:text-white text-xs font-bold text-gray-400 transition-colors"
          >
            <Home className="h-4 w-4" />
            <span>Go to Shop</span>
          </Link>
        </div>
      </aside>

      {/* Main Panel Content */}
      <main className="flex-grow flex flex-col overflow-x-hidden">
        {/* Main Dashboard body */}
        <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
