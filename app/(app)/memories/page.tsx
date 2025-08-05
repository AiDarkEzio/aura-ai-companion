// app/(app)/memories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getCharactersWithMemories, getCharacter } from "@/app/actions/characterActions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MemoryManagementModal } from "@/components/MemoryManagementModal";
import Link from "next/link";
import { Character } from "@/app/generated/prisma";

export default function MemoriesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const characterId = searchParams.get("characterId");
    const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacterName, setSelectedCharacterName] = useState<string | null>(null);

  useEffect(() => {
    const fetchCharacters = async () => {
      const fetchedCharacters = await getCharactersWithMemories();
      setCharacters(fetchedCharacters);
    };
    fetchCharacters();
  }, []);

  useEffect(() => {
    const fetchSelectedCharacter = async () => {
      if (characterId) {
        const selectedChar = await getCharacter(characterId);
        if (selectedChar) {
          setSelectedCharacterName(selectedChar.name);
        }
      }
    };
    fetchSelectedCharacter();
  }, [characterId]);

  return (
    <div className="container mx-auto pt-4 px-0">
      <h2 className="text-3xl font-bold mb-6">Manage Character Memories</h2>
      {characters.length === 0 ? (
        <p className="text-gray-500">No characters with memories found yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {characters.map((character) => (
            <Link
              key={character.id}
              href={`/memories?characterId=${character.id}`}
              className="block p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-light-surface dark:bg-dark-surface hover:bg-light-surface-hover hover:dark:bg-dark-surface-hover border dark:border-dark-border border-light-border"
            >
              <div className="flex items-center space-x-4">
                <Avatar className="border dark:border-dark-border border-light-border">
                  <AvatarImage
                    src={character.image || "/users/default-user-02.jpg"}
                    alt={character.name}
                  />
                  <AvatarFallback>{character.name[0]}</AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-semibold">{character.name}</h2>
              </div>
            </Link>
          ))}
        </div>
      )}

      {characterId && selectedCharacterName && (
        <MemoryManagementModal
          characterId={characterId}
          characterName={selectedCharacterName}
          onClose={() => {
            router.replace("/memories");
          }}
        />
      )}
    </div>
  );
}
