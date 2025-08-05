// app/(web)/contact/page.tsx
"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { AnimatedSection } from "@/components/AnimatedSection";
import { submitContactForm } from "@/app/actions/contact-actions";
import { Send } from "lucide-react";

const initialState = {
  message: null,
  errors: {},
  success: false,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold transition-all duration-300 ease-in-out bg-primary-default text-primary-foreground hover:bg-primary-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      {pending ? (
        <>
          <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
          <span>Sending...</span>
        </>
      ) : (
        <>
          <Send size={18} />
          <span>Send Message</span>
        </>
      )}
    </button>
  );
}

export default function ContactPage() {
  const [state, formAction] = useActionState(submitContactForm, initialState);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!state.message) {
      return;
    }

    if (state.success) {
      toast.success(state.message);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } else {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <main className="bg-background">
      <AnimatedSection className="pt-32 pb-20 sm:pt-40 sm:pb-28 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl font-heading">
            Get in Touch
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-light-text-secondary dark:text-dark-text-secondary">
            Have a question, feedback, or a partnership inquiry? We&apos;d love to
            hear from you. Fill out the form below.
          </p>
        </div>
      </AnimatedSection>

      <AnimatedSection className="pb-20 sm:pb-32">
        <div className="container mx-auto max-w-4xl px-6 flex justify-center items-center">
          <div className="w-full">
            <form action={formAction} className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium mb-1"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-default focus:outline-none"
                />
                {state.errors?.name && (
                  <p className="text-sm text-error-fg mt-1">
                    {state.errors.name[0]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-default focus:outline-none"
                />
                {state.errors?.email && (
                  <p className="text-sm text-error-fg mt-1">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="subject"
                  className="block text-sm font-medium mb-1"
                >
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-default focus:outline-none"
                />
                {state.errors?.subject && (
                  <p className="text-sm text-error-fg mt-1">
                    {state.errors.subject[0]}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-2 rounded-md bg-light-surface dark:bg-dark-surface border border-light-border dark:border-dark-border focus:ring-2 focus:ring-primary-default focus:outline-none"
                ></textarea>
                {state.errors?.message && (
                  <p className="text-sm text-error-fg mt-1">
                    {state.errors.message[0]}
                  </p>
                )}
              </div>

              <SubmitButton />
            </form>
          </div>
        </div>
      </AnimatedSection>
    </main>
  );
}
