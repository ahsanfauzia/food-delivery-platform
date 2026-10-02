"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/useCartStore";
import { logoutUser } from "@/app/actions/auth";
import { ShoppingBag, User, LogOut, Search, MapPin, LayoutDashboard, Bike } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const cartItemsCount = useCartStore((state) => state.getTotalItems());
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Handle hydration mismatch for localstorage persisted Zustand state
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/login";
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo & Location */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-3xl font-black bg-gradient-to-r from-orange-500 to-red-600 bg-clip-text text-transparent tracking-tight">
              FOODIE
            </Link>

            {/* Location Selector (Simulated) */}
            <div className="hidden md:flex items-center space-x-2 text-gray-600 cursor-pointer hover:text-orange-500 transition-colors">
              <MapPin className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-semibold">Green Park, Delhi</span>
              <span className="text-xs text-gray-400">▼</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for restaurants, cuisines, or dishes..."
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 text-sm transition-all"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
            </form>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-6">
            {/* Search Icon (Mobile) */}
            <button className="md:hidden text-gray-600 hover:text-orange-500 p-2">
              <Search className="h-6 w-6" />
            </button>

            {/* Cart Button */}
            <Link href="/cart" className="relative p-2.5 text-gray-600 hover:text-orange-500 transition-colors flex items-center">
              <ShoppingBag className="h-6 w-6" />
              {mounted && cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-gradient-to-r from-orange-500 to-red-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border border-white animate-pulse">
                  {cartItemsCount}
                </span>
              )}
            </Link>

            {/* Auth section */}
            {status === "loading" ? (
              <div className="h-8 w-8 rounded-full bg-gray-100 animate-pulse"></div>
            ) : session ? (
              <div className="flex items-center space-x-4">
                {/* Dashboard Shortcut links depending on role */}
                {(session.user as any).role === "ADMIN" && (
                  <Link
                    href="/admin"
                    title="Admin Dashboard"
                    className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                  </Link>
                )}

                {(session.user as any).role === "DELIVERY_PARTNER" && (
                  <Link
                    href="/delivery"
                    title="Delivery Dashboard"
                    className="p-2 text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <Bike className="h-5 w-5" />
                  </Link>
                )}

                {/* Profile Link */}
                <Link href="/profile" className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors">
                  <div className="h-9 w-9 rounded-full bg-orange-100 flex items-center justify-center border border-orange-200">
                    <User className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="hidden lg:block text-sm font-semibold truncate max-w-[120px]">
                    {session.user?.name || "Profile"}
                  </span>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title="Logout"
                  className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-bold rounded-full text-white bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-md transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
