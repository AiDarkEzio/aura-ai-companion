// // src/app/actions/lemonsqueezy.ts
// "use server";

// import { getUserIdFromSession } from "@/lib/auth";
// import {  } from "@lemonsqueezy/lemonsqueezy.js";
// import { redirect } from "next/navigation";
// import prisma from "@/lib/prisma"

// export async function getCheckoutURL(
//   variantId: number,
//   user: { name?: string; email: string; id: string }
// ) {
//   if (!user || !user.email || !user.id) {
//     throw new Error("User is not authenticated.");
//   }

//   const checkout = await createCheckout({
//     storeId: Number(process.env.LEMONSQUEEZY_STORE_ID!),
//     variantId,
//     custom: {
//       // This is how we link the purchase back to our user!
//       user_id: user.id,
//     },
//     checkout_data: {
//       email: user.email,
//       name: user.name,
//     },
//     product_options: {
//       redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`, // Redirect after purchase
//     },
//   });

//   return checkout.data!.attributes.url;
// }

// // A helper function to be called from a client component
// export async function createCheckout(variantId: number) {
//   const userId = await getUserIdFromSession();

//     if (!userId) {
//         return { error: "User not authenticated" };
//     }

//     const user = await prisma.user.findUnique({ where: { id: userId } })

//   if (!user || !user.email || !user.id) {
//     return { error: "Not authenticated" };
//   }
//   const checkoutUrl = await getCheckoutURL(variantId, {
//     email: user.email,
//     id: user.id,
//     name: user.name ?? "",
//   });
//   redirect(checkoutUrl);
// }
