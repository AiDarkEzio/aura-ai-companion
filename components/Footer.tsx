// components/Footer.tsx

import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="py-8 border-t border-light-border dark:border-dark-border bg-transparent">
      <div className="container mx-auto px-6 flex flex-col sm:flex-row justify-between items-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
        <p className="order-2 sm:order-1 mt-4 sm:mt-0">
          © {new Date().getFullYear()} AURA. All rights reserved.
        </p>
        <div className="order-1 sm:order-2 flex gap-6">
          <Link
            href="#"
            className="hover:text-primary-dark hover:dark:text-primary-light transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="#"
            className="hover:text-primary-dark hover:dark:text-primary-light transition-colors"
          >
            Terms
          </Link>
          <Link
            href="#"
            className="hover:text-primary-dark hover:dark:text-primary-light transition-colors"
          >
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
};

export const AppFooter = () => {
  return (
    <div></div>
  );
};
