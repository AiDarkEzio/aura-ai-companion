import Link from "next/link";
import { CharacterCard } from "./CharacterCard";
import { SceneCard } from "./SceneCard"; // 1. Import SceneCard
import type { Character, Scene } from "@/app/generated/prisma"; // Import Scene
import { AnimatedSection } from "./AnimatedSection";
import { startNewChat } from "@/app/actions/chat-actions";

// This component is generic and can be used for Characters or Scenes
interface ContentSectionProps<T> {
  title: string;
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

const ContentSection = <T extends { id: string }>({
  title,
  items,
  renderItem,
}: ContentSectionProps<T>) => {
  if (items.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold tracking-tight sm:text-3xl font-heading">
        {title}
      </h2>
      <div className="mx-auto mt-8 grid max-w-2xl grid-cols-1 gap-8 sm:mt-10 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        {items.map((item) => (
          // Use item.id for the key
          <div key={item.id}>{renderItem(item)}</div>
        ))}
      </div>
    </div>
  );
};

// 2. Update the HomepageData interface here as well
export interface HomepageData {
  mainCharacter: Character | null;
  userCharacters: Character[];
  communityCharacters: Character[];
  platformCharacters: Character[];
  scenes: Scene[];
}

// 3. Rename the main component
export const HomepageContent = ({ data }: { data: HomepageData }) => {
  const {
    mainCharacter,
    userCharacters,
    communityCharacters,
    platformCharacters,
    scenes, // 4. Destructure scenes from data
  } = data;

  return (
    <>
      {mainCharacter && (
        <AnimatedSection id="main-character">
          {/* ... Main Character hero section (no changes needed here) ... */}
          <div className="min-h-[50vh] flex flex-col items-center justify-center px-4 py-15 sm:px-6 lg:px-8 bg-light-surface/10 dark:bg-dark-surface/10 rounded-2xl shadow-lg border border-light-border dark:border-dark-border">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
                Meet {mainCharacter.name}
              </h2>
              <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
                {mainCharacter.description}
              </p>
            </div>
            <div className="mt-8 flex justify-center">
              <div className="flex gap-4">
                <Link
                  href={`/characters/${mainCharacter.id}`}
                  className="inline-flex items-center rounded-full text-light-text-default bg-primary-default px-6 py-2.5 text-sm font-semibold shadow-sm transition-colors duration-300 ease-in-out hover:bg-primary-default/50 hover:dark:text-dark-text-default"
                >
                  View Details
                </Link>
                <button
                  onClick={async () => {
                    await startNewChat({ characterId: mainCharacter.id });
                  }}
                  className="inline-flex items-center rounded-full text-light-text-default  bg-accent-default px-6 py-2.5 text-sm font-semibold shadow-sm transition-colors duration-300 ease-in-out hover:bg-accent-default/50 hover:dark:text-dark-text-default"
                >
                  Start New Chat
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      )}

      <ContentSection
        title="From the Platform"
        items={platformCharacters}
        renderItem={(character) => (
          <CharacterCard character={character as Character} />
        )}
      />
      
      {/* 5. Add the new Scene Section */}
      <ContentSection
        title="Featured Scenes"
        items={scenes}
        renderItem={(scene) => <SceneCard scene={scene as Scene} />}
      />

      <ContentSection
        title="My Characters"
        items={userCharacters}
        renderItem={(character) => (
          <CharacterCard character={character as Character} />
        )}
      />
      <ContentSection
        title="Community Characters"
        items={communityCharacters}
        renderItem={(character) => (
          <CharacterCard character={character as Character} />
        )}
      />

      <div className="mt-16 mb-8 text-center text-light-text-secondary dark:text-dark-text-secondary text-xs">
        <p>
          Explore more characters and their unique stories. Each character is
          crafted to enhance your experience and interaction on the platform.
        </p>
      </div>
    </>
  );
};
