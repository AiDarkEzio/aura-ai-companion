// components/settings/tabs/SubscriptionTab.tsx

import { StaticField, ActionField } from "../fields";
import { SubscriptionTabProps } from "@/lib/types";

export function SubscriptionTab({
  subscription,
  onAction,
}: SubscriptionTabProps) {
  return (
    <div>
      <ActionField
        label="Current Plan"
        description={`You are on the ${subscription.currentPlan} plan.`}
        buttonLabel="Manage Plan"
        onAction={() => onAction("manage_plan")}
      />
      <StaticField
        label="Next Billing Date"
        value={new Date(subscription.nextBillingDate).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "long",
            day: "numeric",
          }
        )}
      />
      <ActionField
        label="Payment Method"
        description={`${subscription.paymentMethod} ending in •••• ${subscription.paymentMethodLast4}`}
        buttonLabel="Update"
        onAction={() => onAction("update_payment")}
      />
    </div>
  );
}
