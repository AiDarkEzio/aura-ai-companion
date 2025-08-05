// components/dashboard/billing/transactionHistoryClient.tsx

"use client";

import { CreditTransaction } from "@/app/generated/prisma";
import { cn, getTransactionTypeDetails, timeAgo } from "@/lib/utils";

interface TransactionHistoryClientProps {
  transactions: CreditTransaction[];
}

export function TransactionHistoryClient({
  transactions,
}: TransactionHistoryClientProps) {
  if (transactions.length === 0) {
    return (
      <div className="mt-8 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-light-border dark:border-dark-border p-12 text-center">
        <h3 className="text-lg font-medium text-light-text-default dark:text-dark-text-default">
          No Transactions Yet
        </h3>
        <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
          Your credit history will appear here once you start chatting.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-lg border border-light-border dark:border-dark-border">
            <table className="min-w-full divide-y divide-light-border-subtle dark:divide-dark-border-subtle">
              <thead className="bg-light-surface-hover dark:bg-dark-surface-hover">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-light-text-default dark:text-dark-text-default sm:pl-6"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-light-text-default dark:text-dark-text-default"
                  >
                    Amount
                  </th>
                  <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-light-text-default dark:text-dark-text-default"
                  >
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border-subtle dark:divide-dark-border-subtle bg-light-surface dark:bg-dark-surface">
                {transactions.map((transaction) => {
                  const { Icon, label, className } = getTransactionTypeDetails(
                    transaction.type
                  );
                  const amount = transaction.amount;

                  return (
                    <tr key={transaction.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <Icon
                              className={cn("h-5 w-5", className)}
                              aria-hidden="true"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-light-text-default dark:text-dark-text-default">
                              {label}
                            </div>
                            {transaction.description && (
                              <div className="text-light-text-secondary dark:text-dark-text-secondary">
                                {transaction.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={cn(
                            "font-semibold",
                            amount > 0 ? "text-green-500" : "text-red-500"
                          )}
                        >
                          {amount > 0 ? `+${amount}` : amount}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                        {timeAgo(transaction.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
