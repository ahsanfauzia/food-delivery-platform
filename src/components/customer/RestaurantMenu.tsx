"use client";

import React, { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Search, Star, Clock, Bike, Check, X, ShieldAlert } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  available: boolean;
  category: {
    name: string;
  };
}

interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
}

interface RestaurantMenuProps {
  restaurant: Restaurant;
  menuItems: MenuItem[];
}

export default function RestaurantMenu({ restaurant, menuItems }: RestaurantMenuProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [cartError, setCartError] = useState<string | null>(null);

  const cartItems = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  // Group items by category after applying search & veg filters
  const filteredItems = menuItems.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVeg = !vegOnly || item.isVeg;
    return matchesSearch && matchesVeg;
  });

  // Group filtered items by category name
  const categoriesMap: Record<string, MenuItem[]> = {};
  filteredItems.forEach((item) => {
    const catName = item.category.name;
    if (!categoriesMap[catName]) {
      categoriesMap[catName] = [];
    }
    categoriesMap[catName].push(item);
  });

  const handleAddToCart = (item: MenuItem) => {
    setCartError(null);
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.isVeg,
    };
    
    const result = addItem(cartItem, restaurant.id, restaurant.name);
    if (!result.success && result.error) {
      setCartError(result.error);
    }
  };

  const getQuantityInCart = (itemId: string) => {
    const item = cartItems.find((i) => i.id === itemId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-8">
      {/* Restaurant Header Banner Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="h-32 w-32 rounded-2xl overflow-hidden shrink-0 shadow-sm bg-gray-50 border border-gray-100">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              {restaurant.name}
            </h1>
            <p className="text-gray-500 text-sm">{restaurant.description}</p>
            <p className="text-gray-400 text-xs">{restaurant.address}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-600 pt-2">
              <div className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded-md">
                <Star className="h-4 w-4 fill-current text-green-600" />
                <span>{restaurant.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center space-x-1 bg-orange-50 text-orange-700 px-2 py-1 rounded-md">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>{restaurant.deliveryTime} mins</span>
              </div>
              <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md">
                <Bike className="h-4 w-4 text-blue-600" />
                <span>
                  {restaurant.deliveryFee === 0 ? "Free Delivery" : `₹${restaurant.deliveryFee} Delivery`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cart Conflict Modal / Alert */}
      {cartError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-2xl flex items-start space-x-3 text-red-800 shadow-sm animate-bounce">
          <ShieldAlert className="h-6 w-6 text-red-600 shrink-0" />
          <div className="flex-grow">
            <p className="text-sm font-bold">Cart Conflict</p>
            <p className="text-xs text-red-700 mt-1">{cartError}</p>
          </div>
          <button onClick={() => setCartError(null)} className="text-red-500 hover:text-red-700">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Menu Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        {/* Search menu items */}
        <div className="w-full md:max-w-xs relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search within menu..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-sm bg-gray-50"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Veg filter toggle */}
        <div className="flex items-center space-x-2 shrink-0">
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider">
            Veg Only
          </label>
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`w-12 h-6 rounded-full p-1 transition-all duration-300 ${
              vegOnly ? "bg-green-500" : "bg-gray-200"
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                vegOnly ? "translate-x-6" : "translate-x-0"
              }`}
            ></div>
          </button>
        </div>
      </div>

      {/* Menu Categories List */}
      <div className="space-y-12">
        {Object.keys(categoriesMap).length > 0 ? (
          Object.keys(categoriesMap).map((catName) => (
            <div key={catName} className="space-y-6">
              <h2 className="text-xl font-extrabold text-gray-900 border-b border-gray-100 pb-3 flex items-center">
                {catName}
                <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">
                  {categoriesMap[catName].length}
                </span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {categoriesMap[catName].map((item) => {
                  const qty = getQuantityInCart(item.id);

                  return (
                    <div
                      key={item.id}
                      className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex justify-between gap-4 hover:shadow-md transition-shadow relative overflow-hidden"
                    >
                      {/* Left: Info */}
                      <div className="space-y-3 flex-grow">
                        <div className="flex items-center space-x-2">
                          {/* Veg/Non-Veg standard Indian Icon */}
                          <div
                            className={`h-5 w-5 border-2 p-0.5 rounded flex items-center justify-center shrink-0 ${
                              item.isVeg ? "border-green-600" : "border-red-600"
                            }`}
                          >
                            <div
                              className={`h-2.5 w-2.5 ${
                                item.isVeg
                                  ? "bg-green-600 rounded-full"
                                  : "bg-red-600"
                              }`}
                              style={
                                !item.isVeg
                                  ? {
                                      clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
                                    }
                                  : undefined
                              }
                            ></div>
                          </div>

                          {item.isBestseller && (
                            <span className="bg-orange-100 text-orange-800 text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded">
                              Bestseller
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="font-bold text-gray-900">{item.name}</h3>
                          <p className="text-sm font-extrabold text-gray-700 mt-1">₹{item.price}</p>
                        </div>

                        <p className="text-gray-500 text-xs line-clamp-2 max-w-sm">
                          {item.description}
                        </p>
                      </div>

                      {/* Right: Image and Add Button */}
                      <div className="flex flex-col items-center shrink-0 w-28 space-y-3">
                        <div className="h-24 w-28 rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        {qty > 0 ? (
                          <div className="flex items-center justify-between w-24 bg-orange-500 text-white rounded-xl py-1.5 px-3 shadow-md">
                            <button
                              onClick={() => updateQuantity(item.id, qty - 1)}
                              className="font-black text-sm hover:scale-110 transition-transform"
                            >
                              -
                            </button>
                            <span className="text-xs font-black">{qty}</span>
                            <button
                              onClick={() => updateQuantity(item.id, qty + 1)}
                              className="font-black text-sm hover:scale-110 transition-transform"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(item)}
                            className="w-24 bg-white border border-orange-500 hover:bg-orange-50 text-orange-600 font-extrabold py-1.5 rounded-xl shadow-sm text-xs transition-colors hover:shadow"
                          >
                            ADD
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-gray-100 p-12 text-center rounded-3xl">
            <p className="text-gray-500 font-semibold">No menu items match your filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
