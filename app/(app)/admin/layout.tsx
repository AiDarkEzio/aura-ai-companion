// app/(admin)/layout.tsx

import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { ensureAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    await ensureAdmin();
  } catch (error) {
    console.error("Admin access denied:", error);
    redirect("/app");
  }

  return <>{children}</>;
}
