// components/CharacterCard.tsx

import { useRouter } from "next/navigation";
// import { MessageSquare } from "lucide-react";
import type { Character } from "@/app/generated/prisma";
import { AnimatedSection } from "./AnimatedSection";
import { Avatar } from "./Avatar";
import { CharacterIconRenderer } from "./CharacterIconRenderer";
// import { startNewChat } from "@/app/actions/chat-actions";


interface CharacterCardProps {
  character: Character; 
  // index: number;
}

export const CharacterCard = ({ character }: CharacterCardProps) => {
  const router = useRouter()
  const border =
    character.nsfwTendency === "NONE"
      ? "border-green-500 text-green-500"
      : character.nsfwTendency === "LOW"
      ? "border-yellow-500 text-yellow-500"
      : character.nsfwTendency === "MEDIUM"
      ? "border-orange-500 text-orange-500"
      : "border-red-500 text-red-500";

  const handleCardClick = () => {
    router.push(`/characters/${character.id}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }; 


  return (
    <AnimatedSection
      onClick={handleCardClick}
      id={character.id}
      className="group relative flex flex-col h-full items-start p-6 hover:cursor-pointer rounded-2xl bg-light-surface hover:bg-light-surface-hover dark:bg-dark-surface dark:hover:bg-dark-surface-hover border border-light-border dark:border-dark-border transition-all duration-300 dark:hover:border-primary-light/50 hover:border-primary-dark/50 hover:shadow-2xl hover:shadow-primary-dark/10 dark:hover:shadow-primary-light/10"
    >
      {/* <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div 
          onClick={async () => {
            await startNewChat(character.id);
          }}
          className="p-2 rounded-full bg-primary-light/10 hover:bg-primary-light/20 dark:bg-primary-dark/10 dark:hover:bg-primary-dark/20 cursor-pointer transition-colors border-2 border-primary-light dark:border-primary-dark flex items-center justify-center"
        >
          <MessageSquare className="w-5 h-5 text-primary-default" />
        </div>
      </div> */}
      <div className="flex items-center gap-4">
        <div
          className={
            "rounded-full bg-transparent border-2 " +
            border +
            " flex items-center justify-center"
          }
        >
          <Avatar
            avatarSrc={character.image}
            avatarName={character.name}
            iconName={character.icon}
            size={48} // 24
          />
        </div>
        <h3 className="text-lg font-semibold font-heading">{character.name} {character.image ? <span className="ml-1 text-light-text-secondary dark:text-dark-text-secondary"><CharacterIconRenderer iconName={character.icon} className="" height={15} width={15} /></span> : ""}</h3>
      </div>
      <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary line-clamp-2">
        {character.description}
      </p>
    </AnimatedSection>
  );
};

