import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "mock_stripe_key_for_build_stability", {
  apiVersion: "2024-12-18.acacia" as any,
});
