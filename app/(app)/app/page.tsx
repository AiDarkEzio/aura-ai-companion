"use client";

// 1. Update the import from CharacterSections to HomepageContent
import { HomepageContent } from "@/components/HomepageContent";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getHomepageData, HomepageData } from "@/app/actions/characterActions";
import { AppHeader } from "@/components/Header";

export default function Home() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const homepageData = await getHomepageData();
        setData(homepageData);
      } catch (error) {
        console.error("Failed to fetch homepage data:", error);
        toast.error("Failed to load content. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <main>
      {loading ? (
        <div className="container my-auto mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[70vh]">
          <div className="animate-pulse text-2xl">Loading...</div>
        </div>
      ) : data ? (
        <div className="container my-auto mx-auto max-w-7xl px-6 flex flex-col">
          <AppHeader />
          {/* 2. Update the component name here */}
          <HomepageContent data={data} />
        </div>
      ) : (
        <div className="container my-auto mx-auto max-w-7xl px-6 flex items-center justify-center min-h-[70vh]">
          {/* A slightly more generic message */}
          <div className="animate-pulse text-2xl">No Content Available</div>
        </div>
      )}
    </main>
  );
}
