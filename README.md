# Aura AI Companion

Aura AI Companion is a Next.js application that allows users to interact with various AI characters. It features a chat interface, user accounts, a credit system, and subscription plans.

## Project Status

**This project is currently under development and has been temporarily paused.**

I have put this project on hold to focus on other priorities, but I plan to resume development in the future.

## Key Features

*   **AI Character Chat:** Engage in conversations with a diverse cast of AI characters.
*   **User Authentication:** Secure user sign-up and login.
*   **Personalized Experience:** User profiles, personas, and preferences to tailor interactions.
*   **Credit System:** Users have credits that can be used for various actions within the app.
*   **Subscription Tiers:** Multiple subscription plans (Free, Pro, Ultimate) managed via Lemon Squeezy.
*   **Character Management:** Create, like, and manage memories for AI characters.
*   **Admin Dashboard:** An admin section for managing the application.
*   **Contact Form:** Allows users to send feedback or inquiries.

## Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database ORM:** [Prisma](https://www.prisma.io/)
*   **Database:** PostgreSQL
*   **Schema Validation:** [Zod](https://zod.dev/)
*   **AI/LLM:** [Google AI SDK](https://ai.google.dev/)
*   **Payments:** [Lemon Squeezy](https://www.lemonsqueezy.com/)

## Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   A running PostgreSQL database instance.

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/aura-ai-companion.git
    cd aura-ai-companion
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a `.env.local` file in the root of the project and add the following environment variables.

    ```env
    # Database
    DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

    # Authentication (e.g., NextAuth.js with a provider)
    # Add your specific auth provider variables here
    # AUTH_SECRET="your-secret"
    # GITHUB_ID="your-github-id"
    # GITHUB_SECRET="your-github-secret"

    # Google AI
    GOOGLE_API_KEY="your-google-api-key"

    # Lemon Squeezy
    LEMONSQUEEZY_API_KEY="your-lemonsqueezy-api-key"
    LEMONSQUEEZY_STORE_ID="your-lemonsqueezy-store-id"
    LEMONSQUEEZY_WEBHOOK_SECRET="your-lemonsqueezy-webhook-secret"
    ```

4.  **Push the database schema:**
    ```bash
    npx prisma db push
    ```

5.  **Seed the database with initial data:**
    ```bash
    npx prisma db seed
    ```

6.  **Run the development server:**
    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Available Scripts

*   `npm run dev`: Starts the development server.
*   `npm run dev-tp`: Starts the development server with Turbopack.
*   `npm run build`: Creates a production build of the application.
*   `npm run start`: Starts the production server.
*   `npm run lint`: Lints the codebase using Next.js's built-in ESLint configuration.
*   `npx prisma db seed`: Seeds the database.

## Project Structure

*   `app/`: Contains the core application logic, including pages, API routes, and layouts.
*   `components/`: Contains reusable React components.
*   `prisma/`: Contains the Prisma schema (`schema.prisma`) and the database seed script (`seed.ts`).
*   `lib/`: Contains utility functions, type definitions, and library initializations.
*   `public/`: Contains static assets like images and fonts.

## Future Features (TODO)

*   **Next-Auth Authentication:** Implement a robust authentication system using Next-Auth.
*   **User Profile Page:** Create a dedicated page for users to view and manage their profiles.
*   **Subscription Management:** Allow users to manage their subscriptions (upgrade, downgrade, cancel).
*   **User-Created Characters:** Enable users to create and share their own AI characters.
*   **Lemon Squeezy Integration:** Fully implement the Lemon Squeezy API for handling payments and subscriptions.
*   **Message Feedback Management (Admin):** Develop an admin interface to review and manage user feedback on messages.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](httpss://nextjs.org/docs/app/building-your-application/deploying) for more details.