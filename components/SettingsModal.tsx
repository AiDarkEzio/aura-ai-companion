// components/SettingsModal.tsx
"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Import the server actions
import { getUserData, updateUserData } from "@/app/actions/userActions";

// Import the shared type definition
import { UserData, UserUpdatePayload } from "@/lib/types";

// Import all tab components (assuming they are in the specified path)
import { CoreIdentityTab } from "./settings/tabs/CoreIdentityTab";
import { AccountSecurityTab } from "./settings/tabs/AccountSecurityTab";
import { AIPersonalizationTab } from "./settings/tabs/AIPersonalizationTab";
import { PreferencesTab } from "./settings/tabs/PreferencesTab";
import { SubscriptionTab } from "./settings/tabs/SubscriptionTab";
import { SettingsTab, useAppContext } from "@/contexts/AppContext";

export default function SettingsModal() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { refreshUser, isSettingsModalOpen, closeSettingsModal, activeSettingsTab, setActiveSettingsTab } = useAppContext(); 
  

  // --- REFACTORED: Use a server action in useEffect ---
  useEffect(() => {
    if (isSettingsModalOpen) {
      setIsLoading(true);
      // Directly call the server action
      getUserData()
        .then((data) => {
          if (data && "error" in data) {
            // Handle error case returned from the server action
            console.error("Failed to fetch user data:", data.error);
            toast.error("Failed to load your settings. Please try again.");
            setUserData(null);
          } else {
            // Set data on success
            setUserData(data as UserData);
          }
        })
        .catch((err) => {
          // Catch any unexpected network or server errors
          console.error("Unexpected error fetching user data:", err);
          toast.error("An unexpected error occurred. Please try again.");
          setUserData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [isSettingsModalOpen]);

  // --- REFACTORED: Call the update server action ---
  const handleSave = async (
    // section: keyof UserUpdatePayload, // Use a more specific type
    section: "profile" | "persona" | "preferences",
    field: string,
    value: string | boolean
  ) => {
    if (!userData) {
      toast.error("Cannot save, user data is not loaded.");
      return;
    }

    const originalData = JSON.parse(JSON.stringify(userData)); // Deep copy for revert

    // Create the payload for the server action
    const updatedSectionData = { ...userData[section], [field]: value };
    const payload: UserUpdatePayload = { [section]: updatedSectionData };

    // Optimistically update the UI
    setUserData((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        [section]: updatedSectionData,
      };
    });

    // Use toast.promise with the server action
    toast.promise(updateUserData(payload), {
      loading: "Saving your changes...",
      success: (result) => {
        if (result.success) {
          refreshUser()
          return "Settings updated successfully!";
        } else {
          // This case is unlikely if the action throws an error, but it's good practice
          throw new Error("Failed to save settings.");
        }
      },
      error: (err: Error) => {
        // Revert UI on failure
        setUserData(originalData);
        // Display the specific error message from the server action
        return err.message || "Failed to save settings. Please try again.";
      },
    });
  };

  const handleAction = (action: "manage_plan" | "update_payment") => {
    if (action === "manage_plan") {
      toast.info("Redirecting to your subscription manager...");
      // Add navigation logic here, e.g., router.push('/billing-portal')
    } else if (action === "update_payment") {
      toast.info("Redirecting to update your payment method...");
      // Add navigation logic here
    }
  };

  if (!isSettingsModalOpen) {
    return null;
  }

  const tabs: { label: string; id: SettingsTab }[] = [
    { label: "Profile", id: "identity" },
    { label: "Account & Security", id: "account" },
    { label: "AI Personalization", id: "personalization" },
    { label: "Preferences", id: "preferences" },
    { label: "Subscription", id: "billing" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="container relative mx-4 max-w-3xl rounded-2xl bg-light-surface dark:bg-dark-surface p-6 md:p-8 shadow-2xl border border-light-border dark:border-dark-border animate-in slide-in-from-bottom-4 duration-300 max-h-[90vh] flex flex-col">
        <button
          onClick={closeSettingsModal}
          className="absolute top-4 right-4 p-2 rounded-full text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover hover:text-primary-default transition-all duration-200"
          aria-label="Close settings"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex-shrink-0">
          <h1 className="text-2xl font-bold font-heading text-light-text-default dark:text-dark-text-default">
            Settings
          </h1>
        </div>

        <div className="flex-shrink-0 border-b border-light-border dark:border-dark-border mt-4">
          <div className="flex space-x-1 overflow-x-auto -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSettingsTab(tab.id)}
                className={`flex-shrink-0 inline-flex items-center justify-center whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 focus-visible:outline-none ${
                  activeSettingsTab === tab.id
                    ? "border-primary-default text-primary-default"
                    : "border-transparent text-light-text-secondary dark:text-dark-text-secondary hover:text-primary-default hover:border-primary-default/50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="py-6 overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-full min-h-[200px]">
              <Loader2 className="h-8 w-8 animate-spin text-primary-default" />
            </div>
          ) : !userData ? (
            <div className="text-center text-red-500">
              Failed to load user data. Please close and try again.
            </div>
          ) : (
            <>
              {activeSettingsTab === "identity" && (
                <CoreIdentityTab
                  profile={userData.profile}
                  onSave={(field, value) => handleSave("profile", field, value)}
                />
              )}
              {activeSettingsTab === "account" && (
                <AccountSecurityTab account={userData.account} />
              )}
              {activeSettingsTab === "personalization" && (
                <AIPersonalizationTab
                  persona={userData.persona}
                  onSave={(field, value) => handleSave("persona", field, value)}
                />
              )}
              {activeSettingsTab === "preferences" && (
                <PreferencesTab
                  preferences={userData.preferences}
                  onSave={(field, value) => {
                    handleSave("preferences", field, value);
                  }}
                />
              )}
              {activeSettingsTab === "billing" && (
                <SubscriptionTab
                  subscription={userData.subscription}
                  onAction={handleAction}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
