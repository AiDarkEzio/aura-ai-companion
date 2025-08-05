// app/api/cron/route.ts

import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  const today = new Date();
  const subscriptionsToRenew = await prisma.subscription.findMany({
    where: { nextBillingDate: { lte: today } },
    include: { plan: true, user: true },
  });

  // 2. Process renewals in a transaction
  for (const sub of subscriptionsToRenew) {
    await prisma.$transaction(async (tx) => {
      // Grant credits based on their plan
      if (sub.plan.id === 'FREE') {
        await tx.user.update({
          where: { id: sub.userId },
          data: { credits: { set: sub.plan.creditsPerMonth } },
        });
      } else {
        await tx.user.update({
          where: { id: sub.userId },
          data: { credits: { increment: sub.plan.creditsPerMonth }},
        });
      }

      // Log the transaction
      await tx.creditTransaction.create({
        data: {
          userId: sub.userId,
          amount: sub.plan.creditsPerMonth,
          type: "MONTHLY_ALLOWANCE",
          description: `${sub.plan.name} Monthly Grant`,
        },
      });

      // Update their next billing date for one month from now
      const nextBillingDate = new Date(today);
      nextBillingDate.setMonth(today.getMonth() + 1);
      await tx.subscription.update({
        where: { id: sub.id },
        data: { nextBillingDate: nextBillingDate },
      });
    });
  }

  return new Response("Credit replenishment complete.", { status: 200 });
}
