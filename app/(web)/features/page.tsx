// app/features/page.tsx
"use client";

import { AnimatedSection } from "@/components/AnimatedSection";
import { BrainCircuit, Lock, Palette, Users } from "lucide-react";
import Link from "next/link";
import React from "react";

const FeatureCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => {
  return (
    <div className="flex flex-col p-8 rounded-2xl bg-light-surface hover:bg-light-surface-hover dark:bg-dark-surface dark:hover:bg-dark-surface-hover border border-light-border dark:border-dark-border transition-all duration-300 dark:hover:border-primary-light/50 hover:border-primary-dark/50 hover:shadow-2xl hover:shadow-primary-dark/10 dark:hover:shadow-primary-light/10 transform hover:-translate-y-1">
      <div className="flex-shrink-0">
        <div className="p-3 rounded-full bg-primary-light text-primary-dark inline-flex">
          <Icon className="w-7 h-7" />
        </div>
      </div>
      <div className="mt-6">
        <h3 className="text-xl font-bold font-heading">{title}</h3>
        <p className="mt-2 text-base text-light-text-secondary dark:text-dark-text-secondary">
          {description}
        </p>
      </div>
    </div>
  );
};

const featuresData = [
  {
    icon: BrainCircuit,
    title: "A Memory That Matters",
    description:
      "AURA doesn't just respond; it remembers. Key details from your conversations build a unique memory log for each character, leading to deeper, more contextual interactions over time. Best of all, you have full control to view and manage these memories.",
  },
  {
    icon: Palette,
    title: "Unparalleled Customization",
    description:
      "Shape your companion from the ground up. Define a character's core personality with detailed system instructions, or set your own user persona to guide how AURA interacts with you. From tone to topics, the experience is yours to design.",
  },
  {
    icon: Lock,
    title: "Privacy as a Principle",
    description:
      "Your conversations are yours alone. We are committed to using enterprise-grade, privacy-first APIs, meaning your data is never used for third-party model training. We don't sell your data. We don't spy on your chats. It's that simple.",
  },
  {
    icon: Users,
    title: "A Universe of Characters & Scenes",
    description:
      "Explore a growing library of unique characters, from helpful mentors to creative companions. Start a conversation in a pre-set 'Scene' to provide instant context for your adventure, or simply jump into a chat and see where it takes you.",
  },
];

export default function FeaturesPage() {
  return (
    <main className="bg-background">
      {/* --- Hero Section --- */}
      <AnimatedSection className="pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading">
            More Than Just a Chatbot
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            AURA is built on a foundation of features designed to create a truly
            personal, private, and evolving connection. Discover what makes our
            AI different.
          </p>
        </div>
      </AnimatedSection>

      {/* --- Features Grid Section --- */}
      <AnimatedSection className="py-20 sm:py-24">
        <div className="container mx-auto max-w-5xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuresData.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* --- Final CTA Section --- */}
      <AnimatedSection className="relative py-20 sm:py-32 text-center overflow-hidden bg-light-bg dark:bg-dark-bg">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--color-primary-dark)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_center,var(--color-primary-light)_0%,transparent_50%)] opacity-30 dark:opacity-20"></div>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Ready to Experience the Difference?
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Start your journey with an AI that remembers you, respects you, and
            evolves with you.
          </p>
          <div className="mt-8">
            <Link
              href="/app"
              className="bg-accent-default text-light-text-default dark:hover:text-dark-text-default shadow-lg inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform duration-300 ease-in-out hover:scale-105"
            >
              Try AURA Free
            </Link>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
