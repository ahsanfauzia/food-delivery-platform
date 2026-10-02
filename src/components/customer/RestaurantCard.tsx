import React from "react";
import Link from "next/link";
import { Star, Clock, Bike } from "lucide-react";

export interface RestaurantCardProps {
  restaurant: {
    id: string;
    name: string;
    description: string;
    address: string;
    image: string;
    rating: number;
    deliveryTime: number;
    deliveryFee: number;
  };
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurants/${restaurant.id}`} className="group block">
      <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-orange-100 transition-all duration-300 transform hover:-translate-y-1">
        {/* Restaurant Image */}
        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          {restaurant.deliveryFee === 0 && (
            <span className="absolute top-4 left-4 bg-green-500 text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-md">
              Free Delivery
            </span>
          )}
        </div>

        {/* Restaurant Body */}
        <div className="p-6">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-500 transition-colors truncate pr-2">
              {restaurant.name}
            </h3>
            {/* Rating Badge */}
            <div className="flex items-center space-x-1 bg-green-100 text-green-800 text-xs font-black px-2 py-1 rounded-lg shrink-0">
              <Star className="h-3 w-3 fill-current text-green-700" />
              <span>{restaurant.rating.toFixed(1)}</span>
            </div>
          </div>

          <p className="text-gray-500 text-xs mt-2 line-clamp-2 min-h-[32px]">
            {restaurant.description}
          </p>

          <hr className="border-gray-50 my-4" />

          {/* Delivery & Cost Info */}
          <div className="flex justify-between items-center text-xs text-gray-600 font-medium">
            <div className="flex items-center space-x-1">
              <Clock className="h-4 w-4 text-orange-400" />
              <span>{restaurant.deliveryTime} mins</span>
            </div>

            <div className="flex items-center space-x-1">
              <Bike className="h-4 w-4 text-orange-400" />
              <span>
                {restaurant.deliveryFee === 0 ? "Free" : `₹${restaurant.deliveryFee}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
