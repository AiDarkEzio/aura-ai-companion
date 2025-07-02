// app/(app)/chat/page.tsx

import { redirect } from "next/navigation";

export default function CharacterPage() {
  redirect("/app");
}

// import { Chat } from "@/components/Chat";

// export default function ChatPage() {
//   return (
//     <main className="flex max-h-screen">
//       <div className="container mt-[65px] mx-auto max-w-7xl px-6">
//         <Chat />
//       </div>
//     </main>
//   );
// }
