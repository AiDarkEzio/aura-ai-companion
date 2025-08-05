// app/(app)/dashboard/billing/page.tsx
import prisma from "@/lib/prisma";
import { TransactionHistoryClient } from "@/components/dashboard/billing/transactionHistoryClient";
import { CreditCard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserIdFromSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { CreditsBalance } from "@/components/User";

export default async function BillingPage() {
  const userId = await getUserIdFromSession();

  if (!userId) {
    redirect("/login");
  }

  const transactions = await prisma.creditTransaction.findMany({
    where: {
      userId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 50, // Paginate for performance
  });

  return (
    <main className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-light-text-default dark:text-dark-text-default">
          Billing & Usage
        </h1>
        <p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">
          Manage your credits and view your transaction history.
        </p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {/* Current Balance Card */}
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Current Balance
            </h3>
            <Wallet className="h-6 w-6 text-light-text-secondary dark:text-dark-text-secondary" />
          </div>
          <p className="mt-4 text-4xl font-bold text-light-text-default dark:text-dark-text-default">
            <CreditsBalance />{" "}
            <span className="text-lg font-normal">credits</span>
          </p>
        </div>

        {/* Purchase Credits Card */}
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-light-text-secondary dark:text-dark-text-secondary">
              Need More?
            </h3>
            <CreditCard className="h-6 w-6 text-light-text-secondary dark:text-dark-text-secondary" />
          </div>
          <p className="mt-4 text-light-text-default dark:text-dark-text-default">
            Purchase more credits to continue your conversations.
          </p>
          <Button className="mt-4 w-full bg-primary-default hover:bg-primary-dark text-primary-foreground">
            Buy Credits
          </Button>
        </div>
      </div>

      {/* Transaction History Section */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold tracking-tight text-light-text-default dark:text-dark-text-default">
          Transaction History
        </h2>
        <TransactionHistoryClient transactions={transactions} />
      </div>
    </main>
  );
}
