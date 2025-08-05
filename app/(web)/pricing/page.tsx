// app/pricing/page.tsx
"use client";

import { AnimatedSection } from "@/components/AnimatedSection";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";
import plans from "@/data/plans.json"

const Button = ({
  children,
  className = "",
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  variant?: "primary" | "secondary";
}) => {
  const baseClasses =
    "inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-300 ease-in-out hover:scale-105 relative overflow-hidden";

  const variantClasses = {
    primary:
      "bg-accent-default text-light-text-default dark:hover:text-dark-text-default shadow-lg hover:bg-light-surface-hover dark:hover:bg-dark-surface-hover dark:hover:border-accent-light/50 hover:border-accent-dark/50 hover:shadow-2xl hover:shadow-accent-dark/10 dark:hover:shadow-accent-light/10",
    secondary:
      "bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border hover:border-primary-dark dark:hover:border-primary-light hover:text-primary-dark dark:hover:text-primary-light",
  };

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

const PricingCard = ({ plan }: { plan: (typeof plans)[0] }) => {
  const router = useRouter();

  const handleCtaClick = () => {
    // In a real app, this could go to a checkout page with the plan selected
    router.push("/app");
  };

  return (
    <div
      className={`relative flex flex-col p-8 rounded-2xl border transition-all duration-300 ${
        plan.isPopular
          ? "border-primary-default shadow-2xl shadow-primary-dark/10 dark:shadow-primary-light/10 bg-light-surface dark:bg-dark-surface"
          : "border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface"
      }`}
    >
      {plan.isPopular && (
        <div className="absolute top-0 -translate-y-1/2 w-full flex justify-center">
          <span className="bg-primary-default text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
            Most Popular
          </span>
        </div>
      )}
      <h3 className="text-2xl font-bold font-heading">{plan.name}</h3>
      <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary min-h-[40px]">
        {plan.description}
      </p>
      <div className="mt-6">
        <span className="text-4xl font-bold">
          {plan.price > 0 ? `$${plan.price.toFixed(2)}` : "Free"}
        </span>
        {plan.price > 0 && (
          <span className="text-light-text-secondary dark:text-dark-text-secondary">
            {" "}
            / month
          </span>
        )}
      </div>
      <ul className="mt-8 space-y-4">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <CheckCircle
              size={20}
              className="text-success-fg flex-shrink-0 mt-1"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-auto pt-8">
        <Button
          onClick={handleCtaClick}
          className="w-full"
          variant={plan.variant as "primary" | "secondary"}
        >
          {plan.cta}
        </Button>
      </div>
    </div>
  );
};

const faqItems = [
  {
    q: "What are credits used for?",
    a: "Credits are used for generating responses from the AI. A typical message costs a small number of credits, with more advanced models costing slightly more. Your monthly allowance is designed to cover regular, daily usage for each plan.",
  },
  {
    q: "Can I change my plan later?",
    a: "Absolutely! You can upgrade or downgrade your plan at any time from your account settings. Prorated charges or credits will be applied automatically.",
  },
  {
    q: "What happens if I run out of credits?",
    a: "If you run out of credits before your monthly renewal, you can purchase additional credit packs. Pro and Ultimate members also get a better rate on credit packs.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel your subscription at any time. You will retain access to your plan's features until the end of your current billing period, after which your account will revert to the Free plan.",
  },
];

export default function PricingPage() {
  return (
    <main>
      {/* --- Hero Section --- */}
      <AnimatedSection className="py-20 sm:py-32 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Choose the plan that&apos;s right for you. Start a conversation for free,
            no credit card required.
          </p>
        </div>
      </AnimatedSection>

      {/* --- Pricing Grid Section --- */}
      <AnimatedSection className="pb-20 sm:pb-32">
        <div className="container mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {plans.map((plan, index) => (
              <PricingCard key={index} plan={plan} />
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
            {faqItems.map((faq, index) => (
              <div key={index} className="py-6">
                <h3 className="text-lg font-semibold font-heading">{faq.q}</h3>
                <p className="mt-2 text-light-text-secondary dark:text-dark-text-secondary">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
