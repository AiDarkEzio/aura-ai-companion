// components/settings/tabs/AccountSecurityTab.tsx

import { AccountProps } from "@/lib/types";
import { CopyableField, StaticField } from "../fields";

export function AccountSecurityTab({ account }: AccountProps) {
  return (
    <div>
      <CopyableField label="User ID" value={account.userId} />
      <CopyableField label="Email Address" value={account.email} />
      {/* <EditableField label="Email Address" value={account.email} onSave={(v) => onSave("email", v)}/> */}
      <StaticField label="Account Status"
        value={
          <span className={"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium " +
            (account.accountStatus === "ACTIVE") ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" :
            (account.accountStatus === "SUSPENDED") ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" :
            "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}>
            {account.accountStatus === "ACTIVE" ? "Active" : account.accountStatus === "SUSPENDED" ? "Suspended" : "Deleted"}
          </span>
        }
      />
      {/* <ActionField label="Password" buttonLabel="Change Password" onAction={() => alert("Navigate to change password page")} /> */}
      {/* <ActionField label="Two-Factor Auth" buttonLabel={account.twoFactorEnabled ? "Disable" : "Enable"} onAction={() => alert("Toggle 2FA logic")} description={account.twoFactorEnabled ? "Enabled" : "Disabled"} /> */}
      <StaticField label="Date Joined" value={new Date(account.dateJoined).toLocaleDateString()} />
    </div>
  );
}
