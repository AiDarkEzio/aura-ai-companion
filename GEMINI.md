# Gemini Customization for Aura AI Companion

This file provides instructions and context for Gemini to effectively assist with the development of the "Aura AI Companion" project.

## Project Overview

Aura AI Companion is a Next.js application built with TypeScript, Prisma, and Tailwind CSS. It appears to be a chat application that allows users to interact with AI characters.

## Tech Stack

*   **Framework:** Next.js 15
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4
*   **Database ORM:** Prisma
*   **Schema Validation:** Zod
*   **AI/LLM:** Google AI SDK

## Important Commands

*   **Install Dependencies:** `npm install`
*   **Run Development Server:** `npm run dev`
*   **Run Development Server (Turbopack):** `npm run dev-tp`
*   **Build Project:** `npm run build`
*   **Start Production Server:** `npm run start`
*   **Lint Code:** `npm run lint`
*   **Seed Database:** `npx prisma db seed`
*   **Run Tailwind CSS v4 Upgrade Tool:** `npx @tailwindcss/upgrade`

## Key File Locations

*   **Next.js Pages:** `app/`
*   **API Routes:** `app/api/`
*   **React Components:** `components/`
*   **Prisma Schema:** `prisma/schema.prisma`
*   **Database Seed Script:** `prisma/seed.ts`
*   **Public Assets:** `public/`
*   **Main CSS File (for Tailwind Configuration):** `app/globals.css` (or relevant main CSS file)
*   **Type Definitions:** `lib/types.ts`
*   **Zod Schemas:** `lib/zodSchemas.ts`

## Important Notes for Tailwind CSS v4

*   **CSS-First Configuration:** Tailwind CSS v4 moves configuration from a `tailwind.config.js` file to your main CSS file. Theme customizations are now done using `@theme` in your CSS. While `tailwind.config.js` is still supported for backward compatibility, the CSS-first approach is recommended.
*   **No More `@tailwind` Directives:** The `@tailwind` directives (`@tailwind base;`, `@tailwind components;`, `@tailwind utilities;`) are replaced with a single `@import "tailwindcss";` statement in your main CSS file.