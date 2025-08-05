// app/privacy/page.tsx
"use client";

import { AnimatedSection } from "@/components/AnimatedSection";
import Link from "next/link";

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="py-6">
    <h2 className="text-2xl font-bold font-heading mb-4">{title}</h2>
    <div className="space-y-4 text-light-text-secondary dark:text-dark-text-secondary">
      {children}
    </div>
  </div>
);

export default function PrivacyPage() {
  const lastUpdated = "July 10, 2025";

  return (
    <main className="bg-background">
      <div className="container mx-auto max-w-3xl px-6 py-32 sm:py-40">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl font-heading">
              Privacy Policy
            </h1>
            <p className="mt-4 text-light-text-secondary dark:text-dark-text-secondary">
              Last Updated: {lastUpdated}
            </p>
          </div>

          <div className="divide-y divide-light-border dark:divide-dark-border">
            <Section title="1. Our Commitment to Your Privacy">
              <p>
                Welcome to AURA (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;). This Privacy Policy
                explains how we collect, use, and protect your information when
                you use our Service. Your privacy is not an afterthought; it is
                the foundation of our platform. We are committed to transparency
                and giving you control over your data.
              </p>
              <p>
                Our core privacy promise is simple:{" "}
                <strong>
                  We will never sell your data, and we will not use your
                  personal conversations to train third-party AI models.
                </strong>
              </p>
            </Section>

            <Section title="2. Information We Collect">
              <p>
                We collect information necessary to provide and improve our
                Service. This includes:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Account Information:</strong> When you create an
                  account, we collect your email address, name, username, and
                  password (stored in a hashed format). If you sign up via a
                  third-party provider (e.g., Google), we receive information
                  from that provider as authorized by you.
                </li>
                <li>
                  <strong>Profile & Persona Information:</strong> Any details
                  you voluntarily add to your profile, persona, or preferences,
                  such as your bio, interests, or communication style. This data
                  is used to personalize your experience.
                </li>
                <li>
                  <strong>Conversation Data:</strong> The messages you exchange
                  with AI characters. This includes the text of your messages,
                  AI responses, and associated metadata like timestamps. This
                  data is essential for the service to function.
                </li>
                <li>
                  <strong>Subscription & Payment Information:</strong> If you
                  subscribe to a paid plan, we collect billing information. This
                  is processed by our third-party payment processor (e.g.,
                  Stripe), and we do not store your full credit card details.
                </li>
                <li>
                  <strong>Technical & Usage Data:</strong> We may collect
                  information about your device and how you interact with our
                  Service, such as IP address, browser type, and pages visited.
                  This helps us with analytics and improving service
                  reliability.
                </li>
              </ul>
            </Section>

            <Section title="3. How We Use Your Information">
              <p>We use your information for the following purposes:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>To Provide and Maintain the Service:</strong> To
                  operate your account, process your conversations, and deliver
                  the core functionalities of AURA.
                </li>
                <li>
                  <strong>To Personalize Your Experience:</strong> To tailor AI
                  responses and character interactions based on your profile,
                  persona, and conversation history.
                </li>
                <li>
                  <strong>To Process Transactions:</strong> To manage your
                  subscription, process payments, and handle credit
                  transactions.
                </li>
                <li>
                  <strong>To Communicate With You:</strong> To send you
                  service-related updates, security alerts, and support
                  messages.
                </li>
                <li>
                  <strong>For Safety and Security:</strong> To monitor for and
                  prevent fraudulent or prohibited activities and to enforce our
                  Terms of Service.
                </li>
              </ul>
            </Section>

            <Section title="4. Data Sharing and Third Parties">
              <p>
                We do not sell your personal data. We only share information
                with third parties under the following limited circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>AI Service Providers:</strong> We send your
                  conversation data to our AI model providers (e.g., Google&apos;s
                  Vertex AI) to generate responses. We use enterprise-grade,
                  privacy-first APIs, and our agreements with these providers
                  prohibit them from using your data to train their models.
                </li>
                <li>
                  <strong>Payment Processors:</strong> We share payment
                  information with secure third-party payment processors like
                  Stripe or Lemon Squeezy to handle subscriptions.
                </li>
                <li>
                  <strong>Legal Compliance:</strong> We may disclose your
                  information if required by law, subpoena, or other legal
                  process, or if we believe in good faith that it is necessary
                  to protect our rights, your safety, or the safety of others.
                </li>
              </ul>
            </Section>

            <Section title="5. Your Data Rights and Choices">
              <p>
                You are in control of your personal information. You have the
                right to:
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Access and Update:</strong> You can review and edit
                  your account and profile information at any time through your
                  settings.
                </li>
                <li>
                  <strong>Control Memory:</strong> You can view and delete
                  specific memories that AURA has stored about your interactions
                  via the memory management feature.
                </li>
                <li>
                  <strong>Data Deletion:</strong> You can delete your entire
                  account and all associated data from your account settings.
                  When you delete your account, we will permanently remove your
                  personal information from our systems within a reasonable -
                  period, subject to any legal retention requirements.
                </li>
              </ul>
              <p>
                For users in certain regions, such as the European Economic Area
                (EEA) or California, you may have additional statutory rights.
                Please contact us to exercise these rights.
              </p>
            </Section>

            <Section title="6. Data Security">
              <p>
                We implement robust technical and organizational measures to
                protect your data. This includes using encryption-in-transit
                (HTTPS/TLS) for all communications and encryption-at-rest for
                data stored in our databases. While no system is perfectly
                secure, we are committed to safeguarding your information.
              </p>
            </Section>

            <Section title="7. Changes to This Policy">
              <p>
                We may update this Privacy Policy from time to time. If we make
                material changes, we will notify you by email or through a
                notice on our Service before the change becomes effective. We
                encourage you to review this policy periodically.
              </p>
            </Section>

            <Section title="8. Contact Us">
              <p>
                If you have any questions or concerns about this Privacy Policy
                or our data practices, please contact us at:
              </p>
              <p>
                <Link
                  //   href="mailto:privacy@aura-app.com"
                  href="mailto:"
                  className="text-primary-default underline"
                >
                  {/* privacy@aura-app.com */}
                  Contact
                </Link>
              </p>
            </Section>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}