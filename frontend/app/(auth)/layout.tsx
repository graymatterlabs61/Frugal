import { redirect } from "next/navigation";

// Auth pages are locked during pre-launch. All traffic goes to /wishlist.
export default function AuthGroupLayout() {
  redirect("/wishlist");
}
