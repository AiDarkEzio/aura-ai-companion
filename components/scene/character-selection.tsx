// components/scene/character-selection.tsx

"use client";

import Image from "next/image";
import { Character } from "@/app/generated/prisma";
import { Search } from "lucide-react";

interface CharacterSelectionProps {
  characters: Character[];
  selectedCharacter: Character | null;
  onSelectCharacter: (character: Character) => void;
  onSearchClick: () => void;
}

export function CharacterSelection({
  characters,
  selectedCharacter,
  onSelectCharacter,
  onSearchClick,
}: CharacterSelectionProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
      {characters.map((char) => {
        const isSelected = selectedCharacter?.id === char.id;
        return (
          <button
            key={char.id}
            className="flex flex-col items-center gap-2 text-center group"
            onClick={() => onSelectCharacter(char)}
          >
            <div
              className={`relative h-20 w-20 cursor-pointer rounded-full transition-all duration-300 md:h-24 md:w-24 ${
                isSelected
                  ? "ring-4 ring-primary-default ring-offset-4 ring-offset-black/20"
                  : "ring-2 ring-transparent hover:scale-105"
              }`}
            >
              <Image
                src={char.image || "/scenes/a-rainy-day-at-the-cafe.jpg"}
                alt={char.name}
                fill
                className="rounded-full object-cover"
              />
            </div>
            <p
              className={`max-w-[100px] truncate text-sm font-medium transition-colors ${
                isSelected
                  ? "text-white"
                  : "text-dark-text-secondary group-hover:text-dark-text-default"
              }`}
            >
              {char.name}
            </p>
          </button>
        );
      })}

      {/* Search Icon */}
      <button
        className="flex flex-col cursor-pointer items-center gap-2 text-center"
        onClick={onSearchClick}
        aria-label="Search all characters"
      >
        <div className="group flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-dark-text-secondary/50 bg-white/5 transition-colors hover:border-dark-text-secondary/80 hover:bg-white/10 md:h-24 md:w-24">
          <Search className="h-8 w-8 text-dark-text-secondary transition-colors group-hover:text-white" />
        </div>
        <p className="text-sm font-medium text-dark-text-secondary">
          Search All
        </p>
      </button>
    </div>
  );
}
