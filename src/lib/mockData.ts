export interface MockCategory {
  id: string;
  name: string;
  image: string;
  description: string;
}

export interface MockMenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isVeg: boolean;
  isBestseller: boolean;
  restaurantId: string;
  categoryId: string;
  category?: MockCategory;
}

export interface MockRestaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  image: string;
  rating: number;
  deliveryTime: number;
  deliveryFee: number;
  active: boolean;
  menuItems?: MockMenuItem[];
}

export interface MockCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FLAT";
  discountValue: number;
  minOrderAmount: number;
  maxDiscount: number | null;
  active: boolean;
}

export const mockCategories: MockCategory[] = [
  {
    id: "cat-1",
    name: "Pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop",
    description: "Handcrafted oven-baked pizzas",
  },
  {
    id: "cat-2",
    name: "Burgers",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop",
    description: "Juicy flame-grilled burgers",
  },
  {
    id: "cat-3",
    name: "North Indian",
    image: "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=400&auto=format&fit=crop",
    description: "Rich curries & tandoori delights",
  },
  {
    id: "cat-4",
    name: "Chinese",
    image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop",
    description: "Wok tossed noodles & dim sums",
  },
  {
    id: "cat-5",
    name: "Biryani",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop",
    description: "Slow-cooked dum biryani specials",
  },
  {
    id: "cat-6",
    name: "South Indian",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=400&auto=format&fit=crop",
    description: "Crispy dosas, idlis & filter coffee",
  },
  {
    id: "cat-7",
    name: "Desserts",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop",
    description: "Decadent cakes, waffles & brownies",
  },
  {
    id: "cat-8",
    name: "Beverages",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=400&auto=format&fit=crop",
    description: "Cold brews, thick shakes & smoothies",
  },
];

export const mockCoupons: MockCoupon[] = [
  {
    id: "coup-1",
    code: "WELCOME50",
    discountType: "PERCENTAGE",
    discountValue: 50,
    minOrderAmount: 200,
    maxDiscount: 150,
    active: true,
  },
  {
    id: "coup-2",
    code: "FLAT100",
    discountType: "FLAT",
    discountValue: 100,
    minOrderAmount: 500,
    maxDiscount: null,
    active: true,
  },
];

export const mockRestaurants: MockRestaurant[] = [
  {
    id: "rest-1",
    name: "The Burger Club",
    description: "Juicy flame-grilled premium burgers, peri-peri fries & thick shakes.",
    address: "Central Food Boulevard, Block B",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop",
    rating: 4.6,
    deliveryTime: 25,
    deliveryFee: 30,
    active: true,
    menuItems: [
      {
        id: "m-101",
        name: "Classic Veg Burger",
        description: "Crispy potato-peas patty, fresh veggies, lettuce, and house mayo.",
        price: 129,
        image: "https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-1",
        categoryId: "cat-2",
        category: mockCategories[1],
      },
      {
        id: "m-102",
        name: "Cheese Volcano Chicken Burger",
        description: "Crispy chicken patty stuffed with molten cheese and spicy dressing.",
        price: 219,
        image: "https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=400&auto=format&fit=crop",
        isVeg: false,
        isBestseller: true,
        restaurantId: "rest-1",
        categoryId: "cat-2",
        category: mockCategories[1],
      },
      {
        id: "m-103",
        name: "Nutella Thick Shake",
        description: "Creamy blend of vanilla ice cream, Nutella chocolate, and fresh milk.",
        price: 149,
        image: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-1",
        categoryId: "cat-8",
        category: mockCategories[7],
      },
    ],
  },
  {
    id: "rest-2",
    name: "Pizza Fusion",
    description: "Hand-tossed sourdough pizzas, garlic breads & molten choco lava cakes.",
    address: "Avenue Mall, Ground Floor",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop",
    rating: 4.7,
    deliveryTime: 30,
    deliveryFee: 40,
    active: true,
    menuItems: [
      {
        id: "m-201",
        name: "Margherita Basil Pizza",
        description: "Fresh basil, extra virgin olive oil, and mozzarella on house marinara.",
        price: 249,
        image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-2",
        categoryId: "cat-1",
        category: mockCategories[0],
      },
      {
        id: "m-202",
        name: "Fiery Paneer & Paprika Pizza",
        description: "Spicy marinated paneer cubes, crisp capsicum, red paprika, and cheese.",
        price: 329,
        image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-2",
        categoryId: "cat-1",
        category: mockCategories[0],
      },
      {
        id: "m-203",
        name: "Choco Lava Cake",
        description: "Warm chocolate cake with a rich molten liquid chocolate center.",
        price: 99,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-2",
        categoryId: "cat-7",
        category: mockCategories[6],
      },
    ],
  },
  {
    id: "rest-3",
    name: "Dragon Wok",
    description: "Authentic pan-Asian street noodles, dim sums, and refreshing iced teas.",
    address: "Food Junction, Central Market",
    image: "https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600&auto=format&fit=crop",
    rating: 4.4,
    deliveryTime: 28,
    deliveryFee: 35,
    active: true,
    menuItems: [
      {
        id: "m-301",
        name: "Veg Hakka Noodles",
        description: "Wok-tossed noodles with crunchy vegetables and light soy seasoning.",
        price: 169,
        image: "https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-3",
        categoryId: "cat-4",
        category: mockCategories[3],
      },
      {
        id: "m-302",
        name: "Steamed Chicken Dimsums",
        description: "Delicate wrappers stuffed with juicy minced chicken and hot dip.",
        price: 199,
        image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&auto=format&fit=crop",
        isVeg: false,
        isBestseller: true,
        restaurantId: "rest-3",
        categoryId: "cat-4",
        category: mockCategories[3],
      },
      {
        id: "m-303",
        name: "Lemon Mint Iced Tea",
        description: "Brewed black tea infused with fresh citrus lemon and mint leaves.",
        price: 89,
        image: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-3",
        categoryId: "cat-8",
        category: mockCategories[7],
      },
    ],
  },
  {
    id: "rest-4",
    name: "Royal Shanti Dhaba",
    description: "North Indian clay-oven breads, overnight dal makhani & hot gulab jamuns.",
    address: "Main Highway Plaza, Block C",
    image: "https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    deliveryTime: 35,
    deliveryFee: 25,
    active: true,
    menuItems: [
      {
        id: "m-401",
        name: "Dal Makhani",
        description: "Black lentils slow-cooked with fresh butter, cream, and tandoori spices.",
        price: 229,
        image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-4",
        categoryId: "cat-3",
        category: mockCategories[2],
      },
      {
        id: "m-402",
        name: "Butter Naan",
        description: "Clay-oven flatbread brushed with generous golden butter.",
        price: 49,
        image: "https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-4",
        categoryId: "cat-3",
        category: mockCategories[2],
      },
      {
        id: "m-403",
        name: "Gulab Jamun (2 Pcs)",
        description: "Soft milk dumplings dipped in warm cardamom flavored sugar syrup.",
        price: 79,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-4",
        categoryId: "cat-7",
        category: mockCategories[6],
      },
    ],
  },
  {
    id: "rest-5",
    name: "Biryani Darbar",
    description: "Slow-cooked aromatic basmati rice dum biryanis & sweet creamy lassi.",
    address: "Central Avenue, Sector 5",
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop",
    rating: 4.7,
    deliveryTime: 30,
    deliveryFee: 30,
    active: true,
    menuItems: [
      {
        id: "m-501",
        name: "Hyderabadi Chicken Dum Biryani",
        description: "Aromatic basmati rice layered with marinated chicken, saffron, and biryani spices.",
        price: 299,
        image: "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=400&auto=format&fit=crop",
        isVeg: false,
        isBestseller: true,
        restaurantId: "rest-5",
        categoryId: "cat-5",
        category: mockCategories[4],
      },
      {
        id: "m-502",
        name: "Paneer Makhani Dum Biryani",
        description: "Basmati rice slow cooked with paneer tikka chunks and rich gravy.",
        price: 269,
        image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-5",
        categoryId: "cat-5",
        category: mockCategories[4],
      },
      {
        id: "m-503",
        name: "Sweet Lassi",
        description: "Traditional thick chilled yogurt beverage flavored with cardamom.",
        price: 79,
        image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-5",
        categoryId: "cat-8",
        category: mockCategories[7],
      },
    ],
  },
  {
    id: "rest-6",
    name: "Dakshin Delights",
    description: "Crispy butter dosas, steamed fluffy idlis, sambar & authentic filter coffee.",
    address: "South Square Complex, Plaza Area",
    image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop",
    rating: 4.5,
    deliveryTime: 20,
    deliveryFee: 20,
    active: true,
    menuItems: [
      {
        id: "m-601",
        name: "Cheese Butter Masala Dosa",
        description: "Crispy rice crepe filled with potato masala, cheese, and butter with chutneys.",
        price: 149,
        image: "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-6",
        categoryId: "cat-6",
        category: mockCategories[5],
      },
      {
        id: "m-602",
        name: "Steamed Idli Sambar (2 Pcs)",
        description: "Soft and fluffy steamed rice-lentil cakes served with steaming hot lentil sambar.",
        price: 89,
        image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-6",
        categoryId: "cat-6",
        category: mockCategories[5],
      },
      {
        id: "m-603",
        name: "Authentic Filter Coffee",
        description: "Traditional South Indian coffee brewed with chicory and hot frothed milk.",
        price: 69,
        image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-6",
        categoryId: "cat-8",
        category: mockCategories[7],
      },
    ],
  },
  {
    id: "rest-7",
    name: "Sweet Retreat",
    description: "Decadent chocolate cakes, Belgian waffles, brownies & artisan ice creams.",
    address: "Sugar Street Mall, Sector 2",
    image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop",
    rating: 4.8,
    deliveryTime: 15,
    deliveryFee: 25,
    active: true,
    menuItems: [
      {
        id: "m-701",
        name: "Red Velvet Waffle",
        description: "Freshly baked waffle loaded with cream cheese and white chocolate chips.",
        price: 189,
        image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-7",
        categoryId: "cat-7",
        category: mockCategories[6],
      },
      {
        id: "m-702",
        name: "New York Cheesecake Slice",
        description: "Classic rich and creamy baked cheesecake slice on a graham cracker crust.",
        price: 219,
        image: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-7",
        categoryId: "cat-7",
        category: mockCategories[6],
      },
      {
        id: "m-703",
        name: "Double Chocolate Brownie",
        description: "Fudgy and rich chocolate brownie packed with melted chocolate chips.",
        price: 119,
        image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-7",
        categoryId: "cat-7",
        category: mockCategories[6],
      },
    ],
  },
  {
    id: "rest-8",
    name: "The Juice & Brew Co",
    description: "Refreshing cold-pressed juices, organic detox smoothies & iced cold brews.",
    address: "Green Avenue Retail Row",
    image: "https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop",
    rating: 4.6,
    deliveryTime: 20,
    deliveryFee: 30,
    active: true,
    menuItems: [
      {
        id: "m-801",
        name: "Iced Caramel Macchiato",
        description: "Bold espresso shot combined with vanilla syrup, cold milk, and caramel drizzle.",
        price: 169,
        image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: true,
        restaurantId: "rest-8",
        categoryId: "cat-8",
        category: mockCategories[7],
      },
      {
        id: "m-802",
        name: "Cold Pressed Green Detox Juice",
        description: "Refreshing healthy blend of celery, green apple, cucumber, and ginger.",
        price: 139,
        image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-8",
        categoryId: "cat-8",
        category: mockCategories[7],
      },
      {
        id: "m-803",
        name: "Mango Mania Fruit Bowl",
        description: "Fresh diced mango chunks topped with organic honey and mint leaves.",
        price: 129,
        image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop",
        isVeg: true,
        isBestseller: false,
        restaurantId: "rest-8",
        categoryId: "cat-7",
        category: mockCategories[6],
      },
    ],
  },
];
