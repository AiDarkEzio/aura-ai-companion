// contexts/SettingsModalContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type SettingsTab =
  | "identity"
  | "account"
  | "personalization"
  | "preferences"
  | "billing";

interface SettingsModalContextType {
  isOpen: boolean;
  activeTab: SettingsTab;
  openModal: (tab?: SettingsTab) => void;
  closeModal: () => void;
  setActiveTab: (tab: SettingsTab) => void;
}

const SettingsModalContext = createContext<
  SettingsModalContextType | undefined
>(undefined);

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("identity");

  const openModal = (tab: SettingsTab = "identity") => {
    setActiveTab(tab);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  return (
    <SettingsModalContext.Provider
      value={{ isOpen, activeTab, openModal, closeModal, setActiveTab }}
    >
      {children}
    </SettingsModalContext.Provider>
  );
}

export function useSettingsModal() {
  const context = useContext(SettingsModalContext);
  if (context === undefined) {
    throw new Error(
      "useSettingsModal must be used within a SettingsModalProvider"
    );
  }
  return context;
}
