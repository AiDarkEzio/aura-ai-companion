// app/(web)/about/page.tsx
"use client";

import { AnimatedSection } from "@/components/AnimatedSection";
import Image from "next/image";
import Link from "next/link";
import { HeartHandshake, Lock, UserCheck, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <main className="bg-background">
      {/* --- Hero Section --- */}
      <AnimatedSection className="pt-32 pb-20 sm:pt-40 sm:pb-28 text-center bg-light-surface dark:bg-dark-surface">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading">
            Crafting Connection in a Digital World
          </h1>
          <p className="mt-6 max-w-3xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            AURA was born from a simple belief: technology should deepen our
            humanity, not dilute it. We&apos;re on a mission to create an AI
            companion that offers genuine connection through memory, empathy,
            and respect for your privacy.
          </p>
        </div>
      </AnimatedSection>

      {/* --- Founder Section --- */}
      <AnimatedSection className="py-20 sm:py-32">
        <div className="container mx-auto max-w-5xl px-6 grid md:grid-cols-3 gap-12 items-center">
          <div className="md:col-span-1 flex justify-center">
            <div className="relative w-48 h-48 rounded-full overflow-hidden shadow-2xl">
              <Image
                src="/users/default-user-01.jpg"
                alt="Subhadra Poshitha, Founder of AURA"
                layout="fill"
                objectFit="cover"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold font-heading">
              Meet Our Founder
            </h2>
            <p className="mt-4 text-xl font-semibold text-primary-default dark:text-primary-light">
              Subhadra Poshitha
            </p>
            <blockquote className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary border-l-4 border-primary-default/50 pl-4 italic">
              &quot;As an AI enthusiast and developer, I saw a gap. Other AIs felt
              transactional, forgetting you the moment the conversation ended. I
              wanted to build the future of human-computer interaction—an AI
              that remembers, evolves, and truly listens. That&apos;s why I created
              AURA.&quot;
            </blockquote>
          </div>
        </div>
      </AnimatedSection>

      {/* --- Core Principles Section --- */}
      <AnimatedSection className="py-20 sm:py-32 bg-light-surface dark:bg-dark-surface">
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Our Core Principles
            </h2>
            <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
              These values guide every decision we make.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary-light text-primary-dark flex-shrink-0">
                <Lock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-heading">
                  Privacy by Design
                </h3>
                <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                  Your trust is our most important asset. We are committed to
                  using privacy-first APIs and will never sell your data or use
                  your conversations to train third-party models.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary-light text-primary-dark flex-shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-heading">
                  You Are in Control
                </h3>
                <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                  AURA is your companion. You control its personality, its
                  memories, and your data. We provide the tools for you to shape
                  your experience.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary-light text-primary-dark flex-shrink-0">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-heading">
                  Empathy-Driven Engineering
                </h3>
                <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                  We build with feeling. Our goal is not just to simulate
                  intelligence, but to foster a sense of understanding and
                  emotional resonance in every interaction.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-primary-light text-primary-dark flex-shrink-0">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold font-heading">
                  Continuous Evolution
                </h3>
                <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">
                  We are constantly learning and improving. We&apos;re committed to
                  integrating the latest, most responsible AI technology to make
                  AURA better, safer, and more capable every day.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* --- Join Us CTA Section --- */}
      <AnimatedSection className="py-20 sm:py-32 text-center">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Join Us on the Journey
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Experience the future of companionship. Help us shape an AI that&apos;s
            built on connection, trust, and respect.
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
