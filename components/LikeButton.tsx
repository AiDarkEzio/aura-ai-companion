// components/LikeButton.tsx

"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { likeCharacterAction } from "@/app/actions/characterActions";

const cn = (...classes: (string | boolean | undefined)[]) =>
  classes.filter(Boolean).join(" ");

interface LikeButtonProps {
  characterId: string;
  initialLikeCount: number;
  isInitiallyLiked: boolean;
}

export const LikeButton = ({
  characterId,
  initialLikeCount,
  isInitiallyLiked,
}: LikeButtonProps) => {
  const [isLiked, setIsLiked] = useState(isInitiallyLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, startTransition] = useTransition();

  const handleLike = () => {
    const previousState = {
      isLiked: isLiked,
      likeCount: likeCount,
    };

    startTransition(async () => {
      setIsLiked(!isLiked);
      setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));

      const result = await likeCharacterAction(characterId);

      if (result.error) {
        setIsLiked(previousState.isLiked);
        setLikeCount(previousState.likeCount);
        toast.error(result.error);
      } else {
        setIsLiked(result.isLiked!);
        setLikeCount(result.newLikeCount!);
      }
    });
  };

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={cn(
        "w-full rounded-lg px-8 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors duration-200 disabled:opacity-50 border border-primary-default",
        isLiked
          ? "bg-primary-dark hover:bg-primary-dark/80"
          : "bg-primary-default/40 hover:bg-primary-default/80"
      )}
      aria-label={isLiked ? "Unlike character" : "Like character"}
    >
      Like{isLiked && "d"} {likeCount.toLocaleString()}
    </button>
  );
};
