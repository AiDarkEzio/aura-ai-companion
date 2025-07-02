// app/(app)/scenes/[sceneId]/page.tsx

import { notFound } from "next/navigation";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/auth";
import { SceneClient } from "@/components/scene/scene-client";
import { Character } from "@/app/generated/prisma";

// This function generates static paths at build time if you want.
// For now, we'll keep it dynamic.
// export async function generateStaticParams() {
//   const scenes = await prisma.scene.findMany({ select: { id: true } });
//   return scenes.map((scene) => ({ sceneId: scene.id }));
// }

export default async function ScenePage({
  params,
}: {
  params: Promise<{ sceneId: string }>;
}) {
  const { sceneId } = await params;
  const userId = await getUserIdFromSession();

  const scene = await prisma.scene.findUnique({
    where: { id: sceneId },
  });

  if (!scene) {
    notFound();
  }

  const userCharacters = userId
    ? await prisma.character.findMany({
        where: { creatorId: userId },
        take: 3,
        orderBy: { createdAt: "desc" },
      })
    : [];

    const remainingSlots = Math.max(0, 5 - userCharacters.length);

    const platformCharacters =
      remainingSlots > 0
        ? await prisma.character.findMany({
            where: {
              isPublic: true,
              creatorId: null,
              id: { notIn: userCharacters.map((c) => c.id) },
            },
            take: remainingSlots,
            orderBy: { likeCount: "desc" },
          })
        : [];

  const suggestedCharacters: Character[] = [
    ...userCharacters,
    ...platformCharacters,
  ].slice(0, 5);

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center py-24">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={scene.image}
          alt={scene.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      </div>

      <SceneClient scene={scene} suggestedCharacters={suggestedCharacters} />
    </div>
  );
}