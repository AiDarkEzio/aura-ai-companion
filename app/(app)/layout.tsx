// app/(app)/layout.tsx

import { SidePanel } from "@/components/SidePanel";
import { ChatHistoryProvider } from "@/contexts/ChatHistoryContext";
import { getUserIdFromSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  const userId = await getUserIdFromSession()

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user) {
    redirect('/')
  }

  return (
    <ChatHistoryProvider>
      <div className="font-sans flex h-screen">
        <SidePanel user={user} />
        <main className="flex-1 max-h-screen overflow-y-scroll">{children}</main>
      </div>
    </ChatHistoryProvider>
  );
}