// components/scene/scene-client.tsx

"use client";

import { useState, useTransition } from "react";
import { Character, Scene } from "@/app/generated/prisma";
import { startNewChat } from "@/app/actions/chat-actions";
import { CharacterSelection } from "@/components/scene/character-selection";
import { CharacterSearchModal } from "@/components/scene/character-search-modal";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Loader } from "@/components/ui/loader";

interface SceneClientProps {
  scene: Scene;
  suggestedCharacters: Character[];
}

export function SceneClient({ scene, suggestedCharacters }: SceneClientProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [displayCharacters, setDisplayCharacters] =
    useState<Character[]>(suggestedCharacters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length <= 2) {
      router.push("/app");
    } else {
      router.back();
    }
  };

  const handleStartScene = () => {
    if (!selectedCharacter) return;

    startTransition(async () => {
      await startNewChat({
        characterId: selectedCharacter.id,
        sceneId: scene.id,
      });
      // The action will handle the redirect, no need to do anything here.
    });
  };

  const handleSelectCharacter = (character: Character) => {
    setSelectedCharacter((prev) =>
      prev?.id === character.id ? null : character
    );
  };

  const handleSelectAndCloseModal = (character: Character) => {
    setSelectedCharacter(character);
    const isAlreadyDisplayed = displayCharacters.some(
      (c) => c.id === character.id
    );

    if (!isAlreadyDisplayed) {
      setDisplayCharacters((prev) => [
        character,
        ...prev.slice(0, prev.length - 1),
      ]);
    }

    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center p-4 text-center">
        {/* Back Button */}
        <div className="absolute -top-16 left-4 sm:left-6 md:left-8">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-dark-text-secondary p-1 rounded-lg transition-colors hover:text-dark-text-default hover:cursor-pointer hover:bg-dark-surface-hover/10 dark:hover:bg-light-surface-hover/10"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Scene Details */}
        <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">
          {scene.title}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-dark-text-secondary">
          {scene.summary}
        </p>

        {/* Character Selection */}
        <div className="mt-12 flex w-full flex-col items-center">
          <h2 className="mb-6 text-xl font-semibold text-white">
            Select a Character
          </h2>
          <CharacterSelection
            characters={displayCharacters}
            selectedCharacter={selectedCharacter}
            onSelectCharacter={handleSelectCharacter}
            onSearchClick={() => setIsModalOpen(true)}
          />
        </div>

        {/* Action Button */}
        <div className="mt-12">
          <Button
            size="lg"
            onClick={handleStartScene}
            disabled={!selectedCharacter || isPending}
            className="w-64" // Give it a fixed width
          >
            {isPending ? <Loader className="h-5 w-5" /> : "Start Scene"}
          </Button>
        </div>
      </div>

      {/* Search Modal */}
      <CharacterSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectCharacter={handleSelectAndCloseModal}
      />
    </>
  );
}