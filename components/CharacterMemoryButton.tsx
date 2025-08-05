"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MemoryManagementModal } from "@/components/MemoryManagementModal";
import { Brain } from "lucide-react";

interface CharacterMemoryButtonProps {
  characterId: string;
  characterName: string;
}

export function CharacterMemoryButton({
  characterId,
  characterName,
}: CharacterMemoryButtonProps) {
  const [showMemoryModal, setShowMemoryModal] = useState(false);

  return (
    <>
      <Button
        onClick={() => setShowMemoryModal(true)}
        className="w-full rounded-lg bg-blue-500 px-8 py-3 text-sm font-semibold text-white shadow-sm transition-colors duration-300 ease-in-out hover:bg-blue-600"
      >
        <Brain className="mr-2 h-5 w-5" /> Manage Memories
      </Button>

      {showMemoryModal && (
        <MemoryManagementModal
          characterId={characterId}
          characterName={characterName}
          onClose={() => setShowMemoryModal(false)}
        />
      )}
    </>
  );
}
