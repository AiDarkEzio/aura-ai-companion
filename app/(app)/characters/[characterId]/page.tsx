// app/(app)/characters/[characterId]/page.tsx

import { redirect } from "next/navigation";
import { Shield, FileText, MessageCircle } from "lucide-react";
import { getUserIdFromSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getChatsForCharacter, startNewChat } from "@/app/actions/chat-actions";
import { PastChatsList } from "@/components/PastChatsList";
import { LikeButton } from "@/components/LikeButton";
import { Avatar } from "@/components/Avatar";
import { CharacterMemoryButton } from "@/components/CharacterMemoryButton";

const formatEnumValue = (value?: string) => {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
};

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center gap-4 rounded-lg bg-light-surface p-4 dark:bg-dark-surface">
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-light-bg dark:bg-dark-bg">
      <Icon className="h-6 w-6 text-light-text-secondary dark:text-dark-text-secondary" />
    </div>
    <div className="flex-grow">
      <h3 className="font-semibold text-light-text-default dark:text-dark-text-default">
        {label}
      </h3>
    </div>
    <span className="text-sm font-medium text-light-text-default dark:text-dark-text-default">
      {value}
    </span>
  </div>
);

export default async function CharacterProfilePage({
  params,
}: {
  params: Promise<{ characterId: string }>;
}) {
  const { characterId } = await params;
  const userId = await getUserIdFromSession();

  if (!userId) {
    redirect("/login");
  }

  const [character, pastChats] = await Promise.all([
    prisma.character.findUnique({
      where: { id: characterId },
      include: {
        _count: {
          select: {
            likes: { where: { userId } },
            chats: true,
          },
        },
      },
    }),
    getChatsForCharacter(characterId),
  ]);

  if (!character) {
    redirect("/characters");
  }

  const isLiked = character._count.likes > 0;

  return (
    <main className="min-h-screen bg-light-bg text-light-text-default dark:bg-dark-bg dark:text-dark-text-default">
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <div className="text-center">
          <div className="mt-8 flex justify-center">
            <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-light-surface dark:bg-dark-surface">
              <Avatar
                avatarName={character.name}
                avatarSrc={character.image}
                iconName={character.icon}
                size={128}
              />
            </div>
          </div>

          <h2 className="mt-6 text-4xl font-bold">{character.name}</h2>
          <p className="mt-2 text-lg text-light-text-secondary dark:text-dark-text-secondary">
            {character.characterType === "GAMEMASTER"
              ? "Game Master"
              : formatEnumValue(character.characterType)}{" "}
            · Character ID: {character.id.substring(0, 5)}
          </p>

          <div className="mt-6 flex flex-col justify-center gap-4 sm:flex-row">
            <form
              action={async () => {
                "use server";
                await startNewChat({characterId: character.id});
              }}
              className="flex-1 sm:flex-none"
            >
              <button
                type="submit"
                className="w-full rounded-lg bg-accent-default px-8 py-3 text-sm font-semibold text-accent-foreground shadow-sm transition-colors duration-300 ease-in-out hover:bg-accent-default/80"
              >
                Start New Chat
              </button>
            </form>
            <div className="flex-1 sm:flex-none">
              <LikeButton
                characterId={character.id}
                initialLikeCount={character.likeCount}
                isInitiallyLiked={isLiked}
              />
            </div>
            <div className="flex-1 sm:flex-none">
              <CharacterMemoryButton
                characterId={character.id}
                characterName={character.name}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 space-y-4">
          {/* Description */}
          <div className="flex items-start gap-4 rounded-lg bg-light-surface p-4 dark:bg-dark-surface">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-light-bg dark:bg-dark-bg">
              <FileText className="h-6 w-6 text-light-text-secondary dark:text-dark-text-secondary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-light-text-default dark:text-dark-text-default">
                Description
              </h3>
              <p className="mt-1 text-sm text-light-text-secondary dark:text-dark-text-secondary">
                {character.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <InfoRow
            icon={Shield}
            label="NSFW Tendency"
            value={formatEnumValue(character.nsfwTendency)}
          />
          <InfoRow
            icon={MessageCircle}
            label="Total Chats"
            value={character._count.chats.toLocaleString()}
          />
        </div>

        {/* Past Chats */}
        {pastChats && pastChats.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold">Chats</h2>
            <PastChatsList
              initialChats={pastChats}
              characterId={character.id}
            />
          </div>
        )}
      </div>
    </main>
  );
}
