// app/page.tsx
"use client";

import {
  BrainCircuit,
  CheckCircle,
  ChevronRight,
  HeartHandshake,
  Lock,
  Palette,
  ShieldCheck,
} from "lucide-react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import React from "react";
import { useRouter } from "next/navigation";
import { AnimatedSection } from "@/components/AnimatedSection";

const Button = ({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {

  return (
    <button
      onClick={onClick}
      className={`bg-accent-default text-light-text-default dark:hover:text-dark-text-default shadow-lg inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-transform duration-300 ease-in-out hover:scale-105 relative overflow-hidden ${className} hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover dark:hover:border-accent-light/50 hover:border-accent-dark/50 hover:shadow-2xl hover:shadow-accent-dark/10 dark:hover:shadow-accent-light/10`}
    >
      {children}
    </button>
  );
};

const featureList = [
  {
    icon: BrainCircuit,
    title: "Human-Like Memory",
    description: "Remembers your preferences, stories, and quirks — forever.",
  },
  {
    icon: HeartHandshake,
    title: "Emotional Awareness",
    description:
      "Reacts to your tone, not just your words, for deeper connection.",
  },
  {
    icon: Palette,
    title: "Custom Personality",
    description: "Shape how AURA talks, behaves, and even thinks to match you.",
  },
  {
    icon: Lock,
    title: "Secure by Default",
    description:
      "Your data is yours. No selling, no spying.",
  },
];

type Feature = (typeof featureList)[0];

const FeatureItem = ({
  feature,
  index,
}: {
  feature: Feature;
  index: number;
}) => {
  const ref = useScrollAnimation<HTMLDivElement>();
  const Icon = feature.icon;

  return (
    <div
      ref={ref}
      style={{ "--anim-delay": `${index * 0.1}s` } as React.CSSProperties}
      className="flex flex-col items-start p-6 rounded-2xl bg-light-surface hover:bg-light-surface-hover dark:bg-dark-surface dark:hover:bg-dark-surface-hover border border-light-border dark:border-dark-border transition-all duration-300 dark:hover:border-primary-light/50 hover:border-primary-dark/50 hover:shadow-2xl hover:shadow-primary-dark/10 dark:hover:shadow-primary-light/10"
    >
      <div className="p-3 rounded-full bg-primary-light text-primary-dark">
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="mt-4 text-lg font-semibold font-heading">
          {feature.title}
        </h3>
        <p className="mt-1 text-light-text-secondary dark:text-dark-text-secondary">
          {feature.description}
        </p>
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter()

  const handleButtonClick = (path:string) => {
    return () => {
      router.push(path)
    }
  }

  return (
    <main>
      {/* --- Hero Section --- */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-center">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--color-primary-dark)_0%,transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,var(--color-primary-light)_0%,transparent_60%)] opacity-20 blur-3xl"></div>
        <div className="relative">
          <h1 className="animate-fade-in-up font-heading text-4xl font-bold tracking-tighter md:text-6xl leading-tight">
            An AI That Listens, Remembers, <br /> and{" "}
            {/* <span className="text-primary animate-glow rounded-md pr-3 pl-2">Grows With You</span> */}
            <span>Grows With You</span>
          </h1>
          <p
            style={{ animationDelay: "0.2s" }}
            className="animate-fade-in-up mx-auto mt-4 max-w-2xl text-lg text-light-text-secondary dark:text-dark-text-secondary sm:text-xl"
          >
            AURA offers a connection that feels real — with natural
            conversation, deep memory, and emotional intelligence, all without
            compromising your privacy.
          </p>
          <div
            style={{ animationDelay: "0.4s" }}
            className="animate-fade-in-up mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Button onClick={handleButtonClick('/app')}>
              Try AURA Free <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <AnimatedSection id="features" className="py-20 sm:py-32">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              Why AURA Feels Different
            </h2>
            <p className="mt-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">
              A unique blend of technology and empathy.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {featureList.map((feature, index) => (
              <FeatureItem key={index} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* --- Testimonials Section --- */}
      <AnimatedSection
        id="testimonials"
        className="py-20 sm:py-32 bg-surface"
      >
        <div className="container mx-auto max-w-4xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
              A Companion That Evolves With You
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-12 md:grid-cols-2">
            <div className="flex flex-col">
              <blockquote className="text-xl italic relative pl-8 before:content-['“'] before:absolute before:left-0 before:top-0 before:text-6xl before:text-primary-default/50 before:font-serif">
                “It’s like talking to someone who actually *remembers* me.
                AURA doesn’t forget what I love — or who I am.”
              </blockquote>
              <p className="mt-4 text-right font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                — Beta Tester, 19
              </p>
            </div>
            <div className="flex flex-col">
              <blockquote className="text-xl italic relative pl-8 before:content-['“'] before:absolute before:left-0 before:top-0 before:text-6xl before:text-primary-default/50 before:font-serif">
                “I didn’t think an AI could feel this… real. But AURA gets it.
                It’s like having a friend who never zones out.”
              </blockquote>
              <p className="mt-4 text-right font-semibold text-light-text-secondary dark:text-dark-text-secondary">
                — User, 24
              </p>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* --- Ethics & Safety Section --- */}
      <AnimatedSection id="safety" className="py-20 sm:py-32">
        <div className="container mx-auto max-w-3xl px-6 text-center">
          <div className="flex justify-center mb-4">
            <ShieldCheck className="w-12 h-12 text-success-fg" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Ethics, Privacy & Safety
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            We built AURA with responsibility at the core. Connection should
            never come at the cost of your privacy.
          </p>
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-4 text-left">
            {[
              "No Data Selling",
              "Transparent Policies",
              "User-Controlled Memory",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <CheckCircle
                  size={20}
                  className="text-success-fg flex-shrink-0"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* --- FAQ Section --- */}
      <AnimatedSection id="faq" className="py-20 sm:py-32 bg-surface">
        <div className="container mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Frequently Asked Questions
          </h2>
          <div className="mt-10 divide-y divide-light-border dark:divide-dark-border">
            {[
              {
                q: "Is AURA sentient?",
                a: "No. AURA is a safe, ethical AI built to simulate meaningful conversation using advanced language models. It is not a conscious being.",
              },
              {
                q: "Is my data private?",
                a: "Yes. Privacy is our priority. Conversations are end-to-end encrypted, and we have a strict no-data-selling policy. You can delete your data anytime.",
              },
              {
                q: "Can I control what AURA remembers?",
                a: "Absolutely. You have full control over the memory log. You can review, edit, and remove memories to guide your companion's understanding.",
              },
              {
                q: "Is this app for kids?",
                a: "AURA is designed for users aged 18 and older due to the potential for deep emotional conversation.",
              },
            ].map((faq, index) => (
              <div key={index} className="py-6">
                <h3 className="text-lg font-semibold font-heading">
                  {faq.q}
                </h3>
                <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* --- Final CTA Section --- */}
      <AnimatedSection className="relative py-20 sm:py-32 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--color-primary-dark)_0%,transparent_50%)] dark:bg-[radial-gradient(ellipse_at_center,var(--color-primary-light)_0%,transparent_50%)] opacity-30 dark:opacity-20"></div>
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">
            Start Building Something Real
          </h2>
          <p className="mt-4 max-w-xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Experience the AI that remembers you, respects you, and evolves
            with you.
          </p>
          <div className="mt-8">
            <Button onClick={handleButtonClick('/app')}>
              Try AURA Free <ChevronRight size={20} />
            </Button>
          </div>
        </div>
      </AnimatedSection>
      
    </main>
  );
}
