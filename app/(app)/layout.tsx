// app/(app)/layout.tsx

import { AppLayout } from "@/components/AppLayout";
import SettingsModal from "@/components/SettingsModal";
import { AppProvider } from "@/contexts/AppContext";
import { getUserIdFromSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = await getUserIdFromSession()
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    redirect('/')
  }

  return (
    <AppProvider initialUser={user}>
      <AppLayout>{children}</AppLayout>
      <SettingsModal />
    </AppProvider>
  );
}