// components/User.tsx
'use client'

import { useAppContext } from "@/contexts/AppContext"

export const CreditsBalance = () => {
    const { user } = useAppContext()

    return user.credits.toLocaleString();
}