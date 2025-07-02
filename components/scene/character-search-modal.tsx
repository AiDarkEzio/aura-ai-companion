// components/scene/character-search-modal.tsx

"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import Image from "next/image";
import { searchCharacters } from "@/app/actions/characterActions";
import { Character } from "@/app/generated/prisma";
import { Input } from "@/components/ui/input";
import { X, Search } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { Skeleton } from "@/components/ui/skeleton";
import { CharacterSearchFilter } from "@/lib/types";

interface CharacterSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCharacter: (character: Character) => void;
}

const tabs: { name: string; filter: CharacterSearchFilter }[] = [
  { name: "Discover", filter: "discover" },
  { name: "Your Characters", filter: "user" },
  { name: "Recent", filter: "recent" },
];

export function CharacterSearchModal({
  isOpen,
  onClose,
  onSelectCharacter,
}: CharacterSearchModalProps) {
  const [activeFilter, setActiveFilter] = useState<CharacterSearchFilter>("discover");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Character[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(searchQuery, 300);
  
  useEffect(() => {

    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }

    if (!isOpen) {
      setSearchQuery("");
      setResults([]);
      return;
    }


    startTransition(async () => {
      const characters = await searchCharacters(debouncedQuery, activeFilter);
      setResults(characters);
    });
  }, [debouncedQuery, activeFilter, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex h-[80vh] w-full max-w-2xl flex-col rounded-2xl bg-dark-surface p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-dark-text-secondary transition-colors hover:bg-dark-surface-hover hover:text-white"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-white">Select a Character</h2>

        {/* Tabs */}
        <div className="mt-4 border-b border-dark-border">
          <nav className="-mb-px flex space-x-6">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveFilter(tab.filter)}
                className={`whitespace-nowrap border-b-2 px-1 py-3 text-sm font-medium transition-colors ${
                  activeFilter === tab.filter
                    ? "border-primary-default text-primary-default"
                    : "border-transparent text-dark-text-secondary hover:border-gray-500 hover:text-white"
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Search Input */}
        <div className="relative mt-6">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-text-secondary"
            size={20}
          />
          <Input
            type="text"
            ref={inputRef}
            placeholder="Search characters..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            className="pl-10" // Padding for the icon
          />
        </div>

        {/* Results */}
        <div className="mt-4 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-dark-surface-hover">
          {isPending ? (
            <div className="grid grid-cols-1 gap-3">
              {/* Show a few skeleton loaders */}
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 rounded-lg p-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {results.map((char) => (
                <div
                  key={char.id}
                  onClick={() => onSelectCharacter(char)}
                  className="flex cursor-pointer items-center gap-4 rounded-lg p-3 transition-colors hover:bg-dark-surface-hover"
                >
                  <Image
                    src={char.image || "/scenes/a-rainy-day-at-the-cafe.jpg"}
                    alt={char.name}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold text-white">{char.name}</p>
                    <p className="line-clamp-2 text-sm text-dark-text-secondary">
                      {char.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-center text-dark-text-secondary">
              <p className="text-lg font-medium">No Characters found</p>
              <p>Maybe try a different search or make one?</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
