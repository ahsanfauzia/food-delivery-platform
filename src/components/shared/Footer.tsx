import React from "react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent tracking-tight">
              FOODIE
            </span>
            <p className="text-sm text-gray-400">
              Delivering happiness, one bite at a time. Order from the best restaurants near you.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/restaurants" className="hover:text-orange-400 transition-colors">
                  All Restaurants
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-orange-400 transition-colors">
                  View Cart
                </Link>
              </li>
              <li>
                <Link href="/profile" className="hover:text-orange-400 transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Join Us */}
          <div>
            <h3 className="text-white font-bold mb-4">Partner with Us</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/register?role=DELIVERY_PARTNER" className="hover:text-orange-400 transition-colors">
                  Sign up as Delivery Partner
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-orange-400 transition-colors">
                  Merchant / Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold mb-4">Contact</h3>
            <p className="text-sm text-gray-400">
              Email: support@foodie.com
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Phone: +91 98765 43210
            </p>
          </div>
        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Foodie Technologies. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-orange-400 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-orange-400 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
