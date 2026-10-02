import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/customer/CheckoutForm";
import { redirect } from "next/navigation";

export default async function CheckoutPage() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  // Fetch the user's saved addresses from Supabase database
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
        <p className="text-sm text-gray-500 mt-1">Complete your order details and delivery info</p>
      </div>

      <CheckoutForm
        initialAddresses={addresses.map((address) => ({
          id: address.id,
          title: address.title,
          street: address.street,
          city: address.city,
          state: address.state,
          postalCode: address.postalCode,
          phone: address.phone,
        }))}
      />
    </div>
  );
}
