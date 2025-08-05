// app/layout.tsx
import type { Metadata } from "next";
import { Toaster } from "sonner";
import { Inter, Fredoka } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";
import { getUserThemePreference } from "./actions/preferences-actions";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AURA — Your AI Companion That Truly Gets You",
  description:
    "An AI that listens, remembers, and grows with you. Feel understood, remembered, and connected with AURA.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialTheme = await getUserThemePreference();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${fredoka.variable} font-sans bg-light-bg dark:bg-dark-bg`}>
        <ThemeProvider initialTheme={initialTheme}>
          <Toaster closeButton position="top-right" richColors />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}