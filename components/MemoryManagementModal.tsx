"use client";

import { useState, useEffect, useTransition } from "react";

import {
  getUserCharacterMemories,
  addUserCharacterMemory,
  updateUserCharacterMemory,
  deleteUserCharacterMemory,
  resetUserCharacterMemories,
} from "@/app/actions/characterActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { X } from "lucide-react";

interface MemoryManagementModalProps {
  characterId: string;
  characterName: string;
  onClose?: () => void; // Optional onClose prop
}

export function MemoryManagementModal({
  characterId,
  characterName,
  onClose,
}: MemoryManagementModalProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [memories, setMemories] = useState<string[]>([]);
  const [newMemory, setNewMemory] = useState("");
  const [editingMemory, setEditingMemory] = useState<string | null>(null);
  const [editedMemoryText, setEditedMemoryText] = useState("");
  const [isLoading, startTransition] = useTransition();

  useEffect(() => {
    if (characterId) {
      startTransition(async () => {
        const res = await getUserCharacterMemories(characterId);
        if (res.success && res.memories) {
          setMemories(res.memories);
        } else if (res.error) {
          toast.error(res.error);
        }
      });
    }
  }, [characterId, startTransition]);

  const handleAddMemory = async () => {
    if (!newMemory.trim()) {
      toast.error("Memory cannot be empty.");
      return;
    }
    startTransition(async () => {
      const res = await addUserCharacterMemory(characterId, newMemory);
      if (res.success) {
        setNewMemory("");
        // Re-fetch memories to ensure UI is in sync with DB
        const updatedRes = await getUserCharacterMemories(characterId);
        if (updatedRes.success && updatedRes.memories) {
          setMemories(updatedRes.memories);
        }
        toast.success("Memory added successfully!");
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  const handleEditClick = (memory: string) => {
    setEditingMemory(memory);
    setEditedMemoryText(memory);
  };

  const handleSaveEdit = async (oldMemory: string) => {
    if (!editedMemoryText.trim()) {
      toast.error("Memory cannot be empty.");
      return;
    }
    startTransition(async () => {
      const res = await updateUserCharacterMemory(
        characterId,
        oldMemory,
        editedMemoryText
      );
      if (res.success) {
        setEditingMemory(null);
        setEditedMemoryText("");
        // Re-fetch memories
        const updatedRes = await getUserCharacterMemories(characterId);
        if (updatedRes.success && updatedRes.memories) {
          setMemories(updatedRes.memories);
        }
        toast.success("Memory updated successfully!");
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  const handleDeleteMemory = async (memoryToDelete: string) => {
    if (!confirm("Are you sure you want to delete this memory?")) {
      return;
    }
    startTransition(async () => {
      const res = await deleteUserCharacterMemory(characterId, memoryToDelete);
      if (res.success) {
        // Re-fetch memories
        const updatedRes = await getUserCharacterMemories(characterId);
        if (updatedRes.success && updatedRes.memories) {
          setMemories(updatedRes.memories);
        }
        toast.success("Memory deleted successfully!");
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  const handleResetMemories = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all memories for this character? This action cannot be undone."
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await resetUserCharacterMemories(characterId);
      if (res.success) {
        setMemories([]);
        toast.success("All memories reset successfully!");
      } else if (res.error) {
        toast.error(res.error);
      }
    });
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("characterId");
      router.replace(`/memories?${params.toString()}`);
    }
  };

  return (
    <div className="fixed inset-0 bg-light-bg/80 dark:bg-dark-bg/80 backdrop-blur-3xl flex items-center justify-center z-50">
      {/* 
        FIX 1: Replaced `bg-white` with theme-aware classes `bg-card` and `text-card-foreground`.
        This makes the modal's background and default text color adapt to the current theme.
        `bg-card` typically maps to `var(--color-light-surface)` and `var(--color-dark-surface)`.
      */}
      <div className="bg-light-surface dark:bg-dark-surface text-card-foreground p-6 rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Memories for {characterName}</h2>
          <Button variant="outline" size={'icon'} onClick={handleClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {isLoading && <Loader className="mx-auto" />}

        {/* 
          FIX 2: Replaced `text-gray-500` with `text-muted-foreground`.
          This uses the theme's designated color for secondary or less important text.
        */}
        {!isLoading && memories.length === 0 && (
          <p className="text-muted-foreground mb-4">
            No memories found for this character yet.
          </p>
        )}

        <div className="space-y-3 mb-6">
          {memories.map((memory, index) => (
            <div key={index} className="flex items-center space-x-2">
              {editingMemory === memory ? (
                <>
                  <Input
                    value={editedMemoryText}
                    onChange={(e) => setEditedMemoryText(e.target.value)}
                    className="flex-grow"
                  />
                  <Button
                    variant="outline"
                    onClick={() => handleSaveEdit(memory)}
                    disabled={isLoading}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setEditingMemory(null)}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  {/*
                    FIX 3: Replaced `bg-gray-50` with `bg-muted`.
                    This gives the memory item a subtle background that works in both light and dark modes.
                    The `border` class will automatically pick up the theme's border color.
                    The text color is inherited from `text-card-foreground`, ensuring readability.
                  */}
                  <p className="flex-grow p-2 border rounded-md bg-muted">
                    {memory}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditClick(memory)}
                    disabled={isLoading}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteMemory(memory)}
                    disabled={isLoading}
                  >
                    Delete
                  </Button>
                </>
              )}
            </div>
          ))}
        </div>

        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Add a new memory..."
            value={newMemory}
            onChange={(e) => setNewMemory(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAddMemory();
              }
            }}
            disabled={isLoading}
          />
          <Button onClick={handleAddMemory} disabled={isLoading}>
            Add
          </Button>
        </div>

        <Button
          variant="destructive"
          onClick={handleResetMemories}
          disabled={isLoading}
          className="w-full"
        >
          Reset All Memories for {characterName}
        </Button>
      </div>
    </div>
  );
}
