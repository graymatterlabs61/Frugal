import type { Metadata } from "next";
import { Suspense } from "react";
import { WishlistClient } from "@/components/landing/WishlistClient";

export const metadata: Metadata = {
  title: "Join the Wishlist | Frugal",
  description:
    "Get early access to Frugal AI API cost management. Join the wishlist for 25% off at launch, plus 1% more for every friend you refer.",
  alternates: { canonical: "https://getfrugal.dev/wishlist" },
};

export default function WishlistPage() {
  return (
    <Suspense>
      <WishlistClient />
    </Suspense>
  );
}
