// lib/types.ts

import { PlanType, AccountStatus, MessageRating } from "@/app/generated/prisma";

export type AccountProps = {
  account: {
    userId: string;
    email: string;
    accountStatus: AccountStatus;
    dateJoined: string;
    // twoFactorEnabled: boolean;
  };
  // onSave: (field: "email", value: string) => void;
};

export type AIPersonaProps = {
  persona: {
    aiTone: string;
    interests: string;
    userGoals: string;
    communicationStyle: string;
    excludedTopics: string;
  };
  onSave: (field: keyof AIPersonaProps["persona"], value: string) => void;
};

export type Subscription = {
  currentPlan: PlanType;
  nextBillingDate: string;
  paymentMethod: string;
  paymentMethodLast4: string;
};

export type SubscriptionTabProps = {
  subscription: Subscription;
  onAction: (action: "manage_plan" | "update_payment") => void;
};

export type Preferences = {
  // theme: Theme;
  language: string; // "en-us" | "es-es" | "fr-fr";
  timezone: string;
  company: string;
};

export type PreferencesTabProps = {
  preferences: Preferences;
  onSave: (field: keyof Preferences, value: string) => void;
};

export type ProfileProps = {
  profile: {
    fullName: string;
    preferredName: string;
    username: string;
    bio: string;
    pronouns: string;
  };
  onSave: (field: keyof ProfileProps["profile"], value: string) => void;
};

export type UserData = {
  profile: ProfileProps['profile']
  account: AccountProps['account'];
  persona: AIPersonaProps['persona']
  preferences: Preferences
  subscription: Subscription
};

export type UserUpdatePayload = {
  profile?: Partial<UserData["profile"]>;
  persona?: Partial<UserData["persona"]>;
  preferences?: Partial<UserData["preferences"]>;
};


export interface MessagePart {
  text: string;
}

export interface Message {
  id: string;
  role: "user" | "model";
  parts: MessagePart[];
  error?: boolean;
  rating?: MessageRating | null;
}

export interface StartNewChatParams {
  characterId: string;
  sceneId?: string;
}

export type CharacterSearchFilter = "discover" | "user" | "recent";
