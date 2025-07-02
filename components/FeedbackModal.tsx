// components/FeedbackModal.tsx

"use client";

import { useState } from "react";
import { X } from "lucide-react";

const feedbackOptions = [
  "Boring",
  "Not True",
  "Repetitive",
  "Bad Memory",
  "Too Long",
  "Too Short",
  "Ended Chat Early",
  "Too Flirty",
  "Funny",
  "Interesting",
  "Helpful",
  "Good Memory",
];

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (tags: string[], details?: string) => Promise<void>;
}

export const MessageFeedbackModal = ({
  isOpen,
  onClose,
  onSubmit,
}: FeedbackModalProps) => {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [details, setDetails] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) {
    return null;
  }

  const handleTagClick = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTags.length === 0) return;
    const trimmedDetails = details.trim();
    setIsSubmitting(true);
    await onSubmit(selectedTags, trimmedDetails === '' ? undefined : trimmedDetails);
    setIsSubmitting(false);
  };

  // Reset state on close
  const handleClose = () => {
    setSelectedTags([]);
    setDetails("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex justify-center items-center p-4">
      <div
        className="bg-[#2e2f33] w-full max-w-lg rounded-xl shadow-2xl p-6 relative text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-title"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 id="feedback-title" className="text-xl font-semibold">
            Feedback
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
            {feedbackOptions.map((option) => (
              <label
                key={option}
                className="flex items-center space-x-3 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedTags.includes(option)}
                  onChange={() => handleTagClick(option)}
                  className="appearance-none h-4 w-4 border-2 border-gray-500 rounded-sm bg-transparent transition-all duration-200 checked:bg-gray-400 checked:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2e2f33] focus:ring-gray-500"
                />
                <span className="text-sm text-gray-200 select-none">
                  {option}
                </span>
              </label>
            ))}
          </div>

          <div className="mb-8 rounded-lg border border-gray-600 focus-within:border-gray-400/80 focus-within:ring-1 focus-within:ring-gray-400/80 transition-all">
            <div className="px-3 pt-2">
              <span className="text-xs text-gray-400">Additional details</span>
            </div>
            <textarea
              id="additional-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Optional"
              rows={3}
              className="w-full bg-transparent border-none rounded-b-lg px-3 pb-2 text-sm placeholder-gray-500 focus:ring-0"
            />
          </div>

          <div className="flex justify-end items-center space-x-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full text-sm font-semibold text-gray-300 hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (selectedTags.length === 0 && details.trim() === "")
              }
              className="px-6 py-2 rounded-full text-sm font-semibold bg-gray-400 text-black hover:bg-gray-300 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save details"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
