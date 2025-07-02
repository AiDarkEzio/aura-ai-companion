// app/(app)/chat/[characterId]/loading.tsx
export default function Loading() {
  return (
    <main>
      <div className="container mt-30 mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[70vh]">
        <div className="animate-pulse text-2xl">Loading...</div>
      </div>
    </main>
  );
}
