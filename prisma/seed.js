require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Clearing existing database tables...');
  
  // Clean tables in reverse order of dependencies to avoid foreign key issues
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.coupon.deleteMany();
  
  await prisma.deliveryPartner.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  console.log('Hashing passwords for test accounts...');
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);
  const deliveryPasswordHash = await bcrypt.hash('delivery123', 10);

  console.log('Seeding Users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Fauzia Admin',
      email: 'admin@foodie.com',
      password: adminPasswordHash,
      role: 'ADMIN',
      phone: '9876543210',
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: 'Ahsan Customer',
      email: 'customer@foodie.com',
      password: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '8765432109',
    },
  });

  const deliveryUser = await prisma.user.create({
    data: {
      name: 'Raj Delivery Partner',
      email: 'delivery@foodie.com',
      password: deliveryPasswordHash,
      role: 'DELIVERY_PARTNER',
      phone: '7654321098',
    },
  });

  console.log('Seeding Delivery Partner Profile...');
  await prisma.deliveryPartner.create({
    data: {
      userId: deliveryUser.id,
      vehicleType: 'bike',
      vehicleNumber: 'DL-3C-AB-1234',
      status: 'AVAILABLE',
    },
  });

  console.log('Seeding Addresses...');
  await prisma.address.create({
    data: {
      userId: customer.id,
      title: 'Home',
      street: 'Flat 405, Block C, Central Heights',
      city: 'Delhi NCR',
      state: 'Delhi',
      postalCode: '110001',
      country: 'India',
      phone: '8765432109',
    },
  });

  console.log('Seeding Categories...');
  const categories = {};
  
  const categoryData = [
    { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=400&auto=format&fit=crop' },
    { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=400&auto=format&fit=crop' },
    { name: 'North Indian', image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=400&auto=format&fit=crop' },
    { name: 'Chinese', image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop' },
    { name: 'Biryani', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop' },
    { name: 'South Indian', image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=400&auto=format&fit=crop' },
    { name: 'Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop' },
    { name: 'Beverages', image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=400&auto=format&fit=crop' },
  ];

  for (const cat of categoryData) {
    const dbCat = await prisma.category.create({
      data: {
        name: cat.name,
        image: cat.image,
        description: `Premium ${cat.name} choices`,
      },
    });
    categories[cat.name] = dbCat;
  }

  console.log('Seeding 8 Diverse Restaurants and Detailed Menus...');
  
  // Restaurant 1: The Burger Club
  const burgerClub = await prisma.restaurant.create({
    data: {
      name: 'The Burger Club',
      description: 'Juicy, flame-grilled premium burgers, crispy fries, and thick shakes.',
      address: 'Central Food Boulevard, Block B',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=600&auto=format&fit=crop',
      rating: 4.6,
      deliveryTime: 25,
      deliveryFee: 30,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Classic Veg Burger',
        description: 'Crispy potato-peas patty, fresh veggies, lettuce, and house mayo.',
        price: 129,
        image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: burgerClub.id,
        categoryId: categories['Burgers'].id,
      },
      {
        name: 'Cheese Volcano Chicken Burger',
        description: 'Crispy chicken breast patty stuffed with molten cheese, onions, and spicy dressing.',
        price: 219,
        image: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?q=80&w=400&auto=format&fit=crop',
        isVeg: false,
        isBestseller: true,
        restaurantId: burgerClub.id,
        categoryId: categories['Burgers'].id,
      },
      {
        name: 'Nutella Thick Shake',
        description: 'Creamy blend of vanilla ice cream, Nutella chocolate, and fresh milk.',
        price: 149,
        image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: burgerClub.id,
        categoryId: categories['Beverages'].id,
      }
    ],
  });

  // Restaurant 2: Pizza Fusion
  const pizzaFusion = await prisma.restaurant.create({
    data: {
      name: 'Pizza Fusion',
      description: 'Hand-tossed sourdough pizzas, garlic breads, and molten lava cakes.',
      address: 'Avenue Mall, Ground Floor',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=600&auto=format&fit=crop',
      rating: 4.7,
      deliveryTime: 30,
      deliveryFee: 40,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Margherita Basil Pizza',
        description: 'Fresh basil leaves, extra virgin olive oil, and premium mozzarella cheese on house marinara.',
        price: 249,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: pizzaFusion.id,
        categoryId: categories['Pizza'].id,
      },
      {
        name: 'Fiery Paneer & Paprika Pizza',
        description: 'Spicy marinated paneer cubes, crisp capsicum, red paprika, and loaded mozzarella.',
        price: 329,
        image: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: pizzaFusion.id,
        categoryId: categories['Pizza'].id,
      },
      {
        name: 'Choco Lava Cake',
        description: 'Chocolate cake with a warm, gooey molten chocolate center.',
        price: 99,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: pizzaFusion.id,
        categoryId: categories['Desserts'].id,
      }
    ],
  });

  // Restaurant 3: Dragon Wok
  const dragonWok = await prisma.restaurant.create({
    data: {
      name: 'Dragon Wok',
      description: 'Authentic pan-Asian street food noodles, dim sums, and refreshing ice teas.',
      address: 'Food Junction, Central Market',
      image: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=600&auto=format&fit=crop',
      rating: 4.4,
      deliveryTime: 28,
      deliveryFee: 35,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Veg Hakka Noodles',
        description: 'Wok-tossed noodles with carrots, bell peppers, cabbage, and light soy sauce.',
        price: 169,
        image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: dragonWok.id,
        categoryId: categories['Chinese'].id,
      },
      {
        name: 'Steamed Chicken Dimsums',
        description: 'Delicate wrappers stuffed with juicy minced chicken, served with hot garlic dip.',
        price: 199,
        image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=400&auto=format&fit=crop',
        isVeg: false,
        isBestseller: true,
        restaurantId: dragonWok.id,
        categoryId: categories['Chinese'].id,
      },
      {
        name: 'Lemon Mint Iced Tea',
        description: 'Brewed black tea infused with fresh lemon and mint sprigs.',
        price: 89,
        image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: dragonWok.id,
        categoryId: categories['Beverages'].id,
      }
    ],
  });

  // Restaurant 4: Royal Shanti Dhaba
  const royalShanti = await prisma.restaurant.create({
    data: {
      name: 'Royal Shanti Dhaba',
      description: 'Rich North Indian clay-oven breads, dal makhani, paneer tikka, and traditional sweets.',
      address: 'Main Highway Plaza, Block C',
      image: 'https://images.unsplash.com/photo-1585938338392-50a59970d8ee?q=80&w=600&auto=format&fit=crop',
      rating: 4.8,
      deliveryTime: 35,
      deliveryFee: 25,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Dal Makhani',
        description: 'Black lentils slow cooked overnight with butter, cream, and tandoori spices.',
        price: 229,
        image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: royalShanti.id,
        categoryId: categories['North Indian'].id,
      },
      {
        name: 'Butter Naan',
        description: 'Clay-oven flatbread brushed with rich premium butter.',
        price: 49,
        image: 'https://images.unsplash.com/photo-1601050690597-df056fb4ce78?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: royalShanti.id,
        categoryId: categories['North Indian'].id,
      },
      {
        name: 'Gulab Jamun (2 Pcs)',
        description: 'Warm, soft milk-solid dumplings dipped in cardamom flavored sugar syrup.',
        price: 79,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: royalShanti.id,
        categoryId: categories['Desserts'].id,
      }
    ],
  });

  // Restaurant 5: Biryani Darbar
  const biryaniDarbar = await prisma.restaurant.create({
    data: {
      name: 'Biryani Darbar',
      description: 'Slow-cooked aromatic basmati rice Dum Biryanis with authentic spices.',
      address: 'Central Avenue, Sector 5',
      image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=600&auto=format&fit=crop',
      rating: 4.7,
      deliveryTime: 30,
      deliveryFee: 30,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Hyderabadi Chicken Dum Biryani',
        description: 'Aromatic basmati rice layered with marinated chicken, saffron, and biryani spices, served with raita.',
        price: 299,
        image: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?q=80&w=400&auto=format&fit=crop',
        isVeg: false,
        isBestseller: true,
        restaurantId: biryaniDarbar.id,
        categoryId: categories['Biryani'].id,
      },
      {
        name: 'Paneer Makhani Dum Biryani',
        description: 'Basmati rice slow cooked with paneer tikka chunks and rich gravy.',
        price: 269,
        image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: biryaniDarbar.id,
        categoryId: categories['Biryani'].id,
      },
      {
        name: 'Sweet Lassi',
        description: 'Traditional thick yogurt beverage sweetened and flavored with cardamom.',
        price: 79,
        image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: biryaniDarbar.id,
        categoryId: categories['Beverages'].id,
      }
    ],
  });

  // Restaurant 6: Dakshin Delights
  const dakshinDelights = await prisma.restaurant.create({
    data: {
      name: 'Dakshin Delights',
      description: 'Crispy Butter Dosas, steamed Idlis, Vadas, and filter coffee.',
      address: 'South Square Complex, Plaza Area',
      image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=600&auto=format&fit=crop',
      rating: 4.5,
      deliveryTime: 20,
      deliveryFee: 20,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Cheese Butter Masala Dosa',
        description: 'Crispy rice crepe filled with potato masala, cheese, and butter. Served with sambar and chutneys.',
        price: 149,
        image: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: dakshinDelights.id,
        categoryId: categories['South Indian'].id,
      },
      {
        name: 'Steamed Idli Sambar (2 Pcs)',
        description: 'Soft and fluffy steamed rice-lentil cakes served with steaming hot lentil sambar.',
        price: 89,
        image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: dakshinDelights.id,
        categoryId: categories['South Indian'].id,
      },
      {
        name: 'Authentic Filter Coffee',
        description: 'Traditional South Indian coffee brewed with chicory and hot frothed milk.',
        price: 69,
        image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: dakshinDelights.id,
        categoryId: categories['Beverages'].id,
      }
    ],
  });

  // Restaurant 7: Sweet Retreat
  const sweetRetreat = await prisma.restaurant.create({
    data: {
      name: 'Sweet Retreat',
      description: 'Decadent chocolate cakes, Belgian waffles, and artisan ice creams.',
      address: 'Sugar Street Mall, Sector 2',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=600&auto=format&fit=crop',
      rating: 4.8,
      deliveryTime: 15,
      deliveryFee: 25,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Red Velvet Waffle',
        description: 'Freshly baked red velvet waffle bubble loaded with cream cheese and white chocolate chips.',
        price: 189,
        image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: sweetRetreat.id,
        categoryId: categories['Desserts'].id,
      },
      {
        name: 'New York Cheesecake Slice',
        description: 'Classic rich and creamy baked cheesecake slice on a graham cracker crust.',
        price: 219,
        image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: sweetRetreat.id,
        categoryId: categories['Desserts'].id,
      },
      {
        name: 'Double Chocolate Brownie',
        description: 'Fudgy and rich chocolate brownie with chocolate chips.',
        price: 119,
        image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: sweetRetreat.id,
        categoryId: categories['Desserts'].id,
      }
    ],
  });

  // Restaurant 8: The Juice & Brew Co
  const juiceBrew = await prisma.restaurant.create({
    data: {
      name: 'The Juice & Brew Co',
      description: 'Refreshing cold-pressed juices, organic detox smoothies, and iced cold brews.',
      address: 'Green Avenue Retail Row',
      image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=600&auto=format&fit=crop',
      rating: 4.6,
      deliveryTime: 20,
      deliveryFee: 30,
    },
  });

  await prisma.menuItem.createMany({
    data: [
      {
        name: 'Iced Caramel Macchiato',
        description: 'Bold espresso shot combined with vanilla syrup, cold milk, and rich caramel drizzle.',
        price: 169,
        image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: true,
        restaurantId: juiceBrew.id,
        categoryId: categories['Beverages'].id,
      },
      {
        name: 'Cold Pressed Green Detox Juice',
        description: 'Refreshing healthy blend of celery, green apple, cucumber, spinach, and fresh ginger.',
        price: 139,
        image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: juiceBrew.id,
        categoryId: categories['Beverages'].id,
      },
      {
        name: 'Mango Mania Fruit Salad',
        description: 'Fresh diced mango chunks topped with honey, chia seeds, and mint leaf.',
        price: 129,
        image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?q=80&w=400&auto=format&fit=crop',
        isVeg: true,
        isBestseller: false,
        restaurantId: juiceBrew.id,
        categoryId: categories['Desserts'].id,
      }
    ],
  });

  console.log('Seeding Coupons...');
  await prisma.coupon.createMany({
    data: [
      {
        code: 'WELCOME50',
        discountType: 'PERCENTAGE',
        discountValue: 50,
        minOrderAmount: 200,
        maxDiscount: 150,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        active: true,
      },
      {
        code: 'FLAT100',
        discountType: 'FLAT',
        discountValue: 100,
        minOrderAmount: 500,
        expiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days
        active: true,
      },
    ],
  });

  console.log('SUCCESS: Database Seeding Completed Successfully with rich data!');
}

main()
  .catch((e) => {
    console.error('SEEDING ERROR:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
